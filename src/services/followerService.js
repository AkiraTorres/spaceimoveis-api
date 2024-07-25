import Follower from "../db/models/Follower.js";
import {validateEmail} from "../validators/inputValidators.js";
import {find} from "./globalService.js";

async function follow(followerEmail, followedEmail) {
  const validatedFollowerEmail = validateEmail(followerEmail);
  const validatedFollowedEmail = validateEmail(followedEmail);

  const follower = await find(validatedFollowerEmail);
  if (!follower) {
    const error = new Error('Follower not found');
    error.status = 404;
    throw error;
  }

  const followed = await find(validatedFollowedEmail);
  if (!followed) {
    const error = new Error('Followed not found');
    error.status = 404;
    throw error;
  }

  const follow = await Follower.findOne({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
  if (follow) {
    const error = new Error('Already following');
    error.status = 409;
    throw error;
  }

  return await Follower.create({followerEmail, followedEmail});
}

async function unfollow(followerEmail, followedEmail) {
  const validatedFollowerEmail = validateEmail(followerEmail);
  const validatedFollowedEmail = validateEmail(followedEmail);

  const follower = await find(validatedFollowerEmail);
  if (!follower) {
    const error = new Error('Follower not found');
    error.status = 404;
    throw error;
  }

  const followed = await find(validatedFollowedEmail);
  if (!followed) {
    const error = new Error('Followed not found');
    error.status = 404;
    throw error;
  }

  const follow = await Follower.findOne({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
  if (!follow) {
    const error = new Error('Not following');
    error.status = 409;
    throw error;
  }

  return await Follower.create({followerEmail, followedEmail});
}

async function getFollowers(email) {
  const validatedEmail = validateEmail(email);

  const followed = await find(validatedEmail);
  if (!followed) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const followers = await Follower.findAll({ where: { followedEmail: validatedEmail } });
  if (!followers) {
    const error = new Error('No followers found');
    error.status = 404;
    throw error;
  }

  return followers;
}

async function getFollowing(email) {
  const validatedEmail = validateEmail(email);

  const follower = await find(validatedEmail);
  if (!follower) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const following = await Follower.findAll({ where: { followerEmail: validatedEmail } });
  if (!following) {
    const error = new Error('Not following anyone');
    error.status = 404;
    throw error;
  }

  return following;
}

async function isFollowing(followerEmail, followedEmail) {
  const validatedFollowerEmail = validateEmail(followerEmail);
  const validatedFollowedEmail = validateEmail(followedEmail);

  const follow = await Follower.findOne({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
  return !!follow;
}

async function isMutual(followerEmail, followedEmail) {
  const validatedFollowerEmail = validateEmail(followerEmail);
  const validatedFollowedEmail = validateEmail(followedEmail);

  const follow1 = await Follower.findOne({ where: { followerEmail: validatedFollowerEmail, followedEmail: validatedFollowedEmail } });
  const follow2 = await Follower.findOne({ where: { followerEmail: validatedFollowedEmail, followedEmail: validatedFollowerEmail } });
  return !!follow1 && !!follow2;
}

async function getTotalFollowers(email) {
  const validatedEmail = validateEmail(email);

  const followed = await find(validatedEmail);
  if (!followed) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return await Follower.count({where: {followedEmail: validatedEmail}});
}

async function getTotalFollowing(email) {
  const validatedEmail = validateEmail(email);

  const follower = await find(validatedEmail);
  if (!follower) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return await Follower.count({where: {followerEmail: validatedEmail}});
}

export {follow, unfollow, getFollowers, getFollowing, isFollowing, isMutual, getTotalFollowers, getTotalFollowing};