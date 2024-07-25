import asyncHandler from 'express-async-handler';

import * as service from '../services/followerService.js';

export const follow = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { followedEmail } = req.params;

    return await service.follow(email, followedEmail);
  } catch (error) {
    next(error);
  }
});

export const unfollow = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { followedEmail } = req.params;

    return await service.unfollow(email, followedEmail);
  } catch (error) {
    next(error);
  }
});

export const getFollowers = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    return await service.getFollowers(email);
  } catch (error) {
    next(error);
  }
});

export const getFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    return await service.getFollowing(email);
  } catch (error) {
    next(error);
  }
});

export const isFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    return await service.isFollowing(email, targetEmail);
  } catch (error) {
    next(error);
  }
});

export const isMutual = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    return await service.isMutual(email, targetEmail);
  } catch (error) {
    next(error);
  }
});

export const getTotalFollowers = asyncHandler(async (req, res, next) => {
  try {
    const { targetEmail } = req.params;

    return await service.getTotalFollowers(targetEmail);
  } catch (error) {
    next(error);
  }
});

export const getTotalFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { targetEmail } = req.params;

    return await service.getTotalFollowing(targetEmail);
  } catch (error) {
    next(error);
  }
});
