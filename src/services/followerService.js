import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class FollowerService {
  constructor() {
    this.userService = new UserService();
  }

  static async follow(followerEmail, followedEmail) {
    const validatedFollowerEmail = validateEmail(followerEmail);
    const validatedFollowedEmail = validateEmail(followedEmail);

    const follower = await this.userService.find(validatedFollowerEmail);
    if (!follower) throw new ConfigurableError('Seguidor não encontrado', 404);

    const followed = await this.userService.find(validatedFollowedEmail);
    if (!followed) throw new ConfigurableError('Seguido não encontrado', 404);

    const follow = await prisma.follower.findFirst({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
    if (follow) throw new ConfigurableError('Já seguindo', 409);

    return prisma.follower.create({ followerEmail, followedEmail });
  }

  static async unfollow(followerEmail, followedEmail) {
    const validatedFollowerEmail = validateEmail(followerEmail);
    const validatedFollowedEmail = validateEmail(followedEmail);

    const follower = await this.userService.find(validatedFollowerEmail);
    if (!follower) throw new ConfigurableError('Seguidor não encontrado', 404);

    const followed = await this.userService.find(validatedFollowedEmail);
    if (!followed) throw new ConfigurableError('Seguido não encontrado', 404);

    const follow = await prisma.follower.findFirst({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
    if (!follow) throw new ConfigurableError('Não está seguindo o usuário', 409);

    return prisma.follower.delete({ where: { followerEmail, followedEmail } });
  }

  static async getFollowers(email) {
    const validatedEmail = validateEmail(email);

    const followed = await this.userService.find(validatedEmail);
    if (!followed) throw new ConfigurableError('Usuário não encontrado', 404);

    const followers = await prisma.follower.findMany({ where: { followedEmail: validatedEmail } });
    if (!followers) throw new ConfigurableError('Você não tem seguidores', 404);

    return followers;
  }

  static async getFollowing(email) {
    const validatedEmail = validateEmail(email);

    const follower = await this.userService.find(validatedEmail);
    if (!follower) throw new ConfigurableError('Usuário não encontrado', 404);

    const following = await prisma.follower.findMany({ where: { followerEmail: validatedEmail } });
    if (!following) throw new ConfigurableError('Você não está seguindo ninguém', 404);

    return following;
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

    const followed = await this.userService.find(validatedEmail);
    if (!followed) throw new ConfigurableError('Usuário não encontrado', 404);

    return prisma.follower.count({ where: { followedEmail: validatedEmail } });
  }

  static async getTotalFollowing(email) {
    const validatedEmail = validateEmail(email);

    const follower = await this.userService.find(validatedEmail);
    if (!follower) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return prisma.follower.count({ where: { followerEmail: validatedEmail } });
  }
}
