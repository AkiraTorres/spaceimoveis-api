import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import firebaseConfig from '../config/firebase.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validateString } from '../validators/inputValidators.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default class PostService {
  static async getPostDetails(id) {
    const post = await prisma.userPosts.findUnique({
      where: { id, active: true },
      include: {
        PostMedia: true,
        PostLikes: true,
        PostComments: { orderBy: { createdAt: 'desc' } },
      },
    });

    const user = await prisma.user.findFirst({ where: { email: post.email }, include: { UserPhoto: { where: { type: 'profile' } } } });
    const comments = await Promise.all(post.PostComments.map(async (comment) => this.getCommentDetails(comment.id)));
    return { ...post, name: user.name, photo: (user.UserPhoto[0].url || null), PostComments: comments };
  }

  static async getCommentDetails(id) {
    const comment = await prisma.postComments.findUnique({ where: { id } });
    const user = await prisma.user.findFirst({ where: { email: comment.email }, include: { UserPhoto: { where: { type: 'profile' } } } });
    return { ...comment, name: user.name, photo: (user.UserPhoto[0].url || null) };
  }

  static async getPostsByUserEmail(email, page = 1, limit = 5) {
    const total = await prisma.userPosts.count({ where: { email: validateEmail(email), active: true } });
    const lastPage = Math.ceil(total / limit);

    const posts = await prisma.userPosts.findMany({
      where: { email: validateEmail(email), active: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(limit * (page - 1)),
    });

    const result = await Promise.all(posts.map(async (post) => this.getPostDetails(post.id)));

    const pagination = {
      path: '/posts',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    return { result, pagination };
  }

  static async getPostById(id) {
    const post = await prisma.userPosts.findUnique({ where: { id, active: true }, include: { PostMedia: true } });
    if (!post) throw new ConfigurableError('Post não encontrado', 404);

    return this.getPostDetails(post.id);
  }

  static async getPostsByFollowed(email, page, limit) {
    const user = await prisma.user.findUnique({ where: { email: validateEmail(email) }, include: { Follower: true } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);
    if (user.Follower.length === 0) return { result: [], pagination: { total: 0 } };

    const followed = user.Follower.map((f) => f.followedEmail);

    const total = await prisma.userPosts.count({ where: { email: { in: followed }, active: true } });
    const lastPage = Math.ceil(total / limit);

    const posts = await prisma.userPosts.findMany({
      where: { email: { in: followed }, active: true },
      include: { PostMedia: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(limit * (page - 1)),
    });

    const pagination = {
      path: '/posts',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const result = await Promise.all(posts.map(async (post) => this.getPostDetails(post.id)));

    return { result, pagination };
  }

  static async create({ content, medias, email }) {
    const validatedEmail = validateEmail(email);

    if (!validatedEmail) throw new ConfigurableError('Um post precisa ser realizado por um usuário logado', 400);
    if (!content && !medias) throw new ConfigurableError('Um post precisa ter um conteúdo valido', 400);

    const text = content ? validateString(content) : null;
    const postData = { id: uuid(), email: validatedEmail, text };

    const transaction = [prisma.userPosts.create({ data: postData })];

    const newMedias = medias || [];
    const m = await Promise.all(newMedias.map(async (media) => {
      const storageRef = ref(storage, `posts/medias/${postData.id}/${media.originalname}`);
      const metadata = { contentType: media.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, media.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return { postId: postData.id, url: downloadUrl, type: media.mimetype };
    }));

    if (m.length > 0) transaction.push(prisma.postMedia.createMany({ data: m }));

    const [newPost] = await prisma.$transaction(transaction);
    return this.getPostDetails(newPost.id);
  }

  static async likePost(id, email) {
    const post = await prisma.userPosts.findUnique({ where: { id: validateString(id), active: true } });
    if (!post) throw new ConfigurableError('Post não encontrado', 404);

    const user = await prisma.user.findUnique({ where: { email: validateEmail(email) } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const transaction = [];
    let result = null;

    const like = await prisma.postLikes.findFirst({ where: { postId: post.id, email: user.email } });
    if (like) {
      transaction.push(prisma.postLikes.delete({ where: { id: like.id } }));
      transaction.push(prisma.userPosts.update({ where: { id: post.id }, data: { likes: { decrement: 1 } } }));
      result = { liked: false };
    } else {
      transaction.push(prisma.postLikes.create({ data: { postId: post.id, email: user.email } }));
      transaction.push(prisma.userPosts.update({ where: { id: post.id }, data: { likes: { increment: 1 } } }));
      result = { liked: true };
    }

    await prisma.$transaction(transaction);
    return result;
  }

  static async commentPost(id, email, content) {
    const post = await prisma.userPosts.findUnique({ where: { id, active: true } });
    if (!post) throw new ConfigurableError('Post não encontrado', 404);

    const user = await prisma.user.findUnique({ where: { email: validateEmail(email) } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const comment = await prisma.postComments.create({ data: { postId: post.id, email: user.email, text: validateString(content) } });
    return this.getCommentDetails(comment.id);
  }

  static async likeComment(id, email) {
    const comment = await prisma.postComments.findUnique({ where: { id: validateString(id) } });
    if (!comment) throw new ConfigurableError('Comentário não encontrado', 404);

    const user = await prisma.user.findUnique({ where: { email: validateEmail(email) } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const transaction = [];
    let result = null;

    const like = await prisma.commentLikes.findFirst({ where: { commentId: comment.id, email: user.email } });
    if (like) {
      transaction.push(prisma.commentLikes.delete({ where: { id: like.id } }));
      transaction.push(prisma.postComments.update({ where: { id: comment.id }, data: { likes: { decrement: 1 } } }));
      result = { liked: false };
    } else {
      transaction.push(prisma.commentLikes.create({ data: { commentId: comment.id, email: user.email } }));
      transaction.push(prisma.postComments.update({ where: { id: comment.id }, data: { likes: { increment: 1 } } }));
      result = { liked: true };
    }

    await prisma.$transaction(transaction);
    return result;
  }

  static async deletePost(id, email) {
    const post = await prisma.userPosts.findUnique({ where: { id, active: true } });
    if (!post) throw new ConfigurableError('Post não encontrado', 404);
    if (post.email !== validateEmail(email)) throw new ConfigurableError('Você não tem permissão para deletar este post', 403);

    return prisma.userPosts.update({ where: { id }, data: { active: false, deletedAt: new Date() } });
  }

  static async deleteComment(id, email) {
    const comment = await prisma.postComments.findUnique({ where: { id } });
    if (!comment) throw new ConfigurableError('Comentário não encontrado', 404);
    if (comment.email !== validateEmail(email)) throw new ConfigurableError('Você não tem permissão para deletar este comentário', 403);

    return prisma.postComments.delete({ where: { id } });
  }
}
