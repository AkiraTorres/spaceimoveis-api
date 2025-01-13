import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class FollowerService {
  static async follow(followerEmail, followedEmail) {
    const validatedFollowerEmail = validateEmail(followerEmail);
    const validatedFollowedEmail = validateEmail(followedEmail);

    const follower = await UserService.find({ email: validatedFollowerEmail });
    if (!follower) throw new ConfigurableError('Seguidor não encontrado', 404);

    const followed = await UserService.find({ email: validatedFollowedEmail });
    if (!followed) throw new ConfigurableError('Seguido não encontrado', 404);

    const follow = await prisma.follower.findFirst({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
    if (follow) throw new ConfigurableError('Já seguindo', 409);

    return prisma.follower.create({ data: { followerEmail, followedEmail } });
  }

  static async unfollow(followerEmail, followedEmail) {
    const validatedFollowerEmail = validateEmail(followerEmail);
    const validatedFollowedEmail = validateEmail(followedEmail);

    const follower = await UserService.find({ email: validatedFollowerEmail });
    if (!follower) throw new ConfigurableError('Seguidor não encontrado', 404);

    const followed = await UserService.find({ email: validatedFollowedEmail });
    if (!followed) throw new ConfigurableError('Seguido não encontrado', 404);

    const follow = await prisma.follower.findFirst({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
    if (!follow) throw new ConfigurableError('Não está seguindo o usuário', 409);

    return prisma.follower.delete({ where: { id: follow.id } });
  }

  static async getFollowers(email, page = 1, limit = 10) {
    const validatedEmail = validateEmail(email);

    const followed = await UserService.find({ email: validatedEmail });
    if (!followed) throw new ConfigurableError('Usuário não encontrado', 404);

    const total = await prisma.follower.count({ where: { followedEmail: validatedEmail } });
    const lastPage = Math.ceil(total / limit);

    const followers = await prisma.follower.findMany({
      where: { followedEmail: validatedEmail },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(limit * (page - 1)),
    });
    if (!followers) throw new ConfigurableError('Você não tem seguidores', 404);

    const result = await Promise.all(followers.map(async (follow) => UserService.userDetails(follow.followerEmail)));

    const pagination = {
      path: '/follow/followers',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    return { result, pagination };
  }

  static async getFollowing(email, page = 1, limit = 10) {
    const validatedEmail = validateEmail(email);

    const follower = await UserService.find({ email: validatedEmail });
    if (!follower) throw new ConfigurableError('Usuário não encontrado', 404);

    const total = await prisma.follower.count({ where: { followerEmail: validatedEmail } });
    const lastPage = Math.ceil(total / limit);

    const following = await prisma.follower.findMany({
      where: { followerEmail: validatedEmail },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(limit * (page - 1)),
    });
    if (!following) throw new ConfigurableError('Você não está seguindo ninguém', 404);

    const result = await Promise.all(following.map(async (follow) => UserService.userDetails(follow.followedEmail)));

    const pagination = {
      path: '/follow/following',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    return { result, pagination };
  }

  static async isFollowing(followerEmail, followedEmail) {
    const validatedFollowerEmail = validateEmail(followerEmail);
    const validatedFollowedEmail = validateEmail(followedEmail);

    return !!(prisma.follower.findFirst({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } }));
  }

  static async isMutual(followerEmail, followedEmail) {
    const validatedFollowerEmail = validateEmail(followerEmail);
    const validatedFollowedEmail = validateEmail(followedEmail);

    const follow1 = await prisma.follower.findFirst({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
    const follow2 = await prisma.follower.findFirst({ where: { followerEmail: validatedFollowedEmail, followedEmail: validatedFollowerEmail } });
    return !!follow1 && !!follow2;
  }

  static async getTotalFollowers(email) {
    const validatedEmail = validateEmail(email);

    const followed = await UserService.find({ email: validatedEmail });
    if (!followed) throw new ConfigurableError('Usuário não encontrado', 404);

    return prisma.follower.count({ where: { followedEmail: validatedEmail } });
  }

  static async getTotalFollowing(email) {
    const validatedEmail = validateEmail(email);

    const follower = await UserService.find({ email: validatedEmail });
    if (!follower) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return prisma.follower.count({ where: { followerEmail: validatedEmail } });
  }
}
