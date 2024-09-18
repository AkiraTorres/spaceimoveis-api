import asyncHandler from 'express-async-handler';

import FollowerService from '../services/followerService.js';

const service = new FollowerService();

export const follow = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { followedEmail } = req.params;

    res.status(200).json(await service.follow(email, followedEmail));
  } catch (error) {
    next(error);
  }
});

export const unfollow = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { followedEmail } = req.params;

    res.status(200).json(await service.unfollow(email, followedEmail));
  } catch (error) {
    next(error);
  }
});

export const getFollowers = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    res.status(200).json(await service.getFollowers(email));
  } catch (error) {
    next(error);
  }
});

export const getFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    res.status(200).json(await service.getFollowing(email));
  } catch (error) {
    next(error);
  }
});

export const isFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    res.status(200).json(await service.isFollowing(email, targetEmail));
  } catch (error) {
    next(error);
  }
});

export const isMutual = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    res.status(200).json(await service.isMutual(email, targetEmail));
  } catch (error) {
    next(error);
  }
});

export const getTotalFollowers = asyncHandler(async (req, res, next) => {
  try {
    const { targetEmail } = req.params;

    res.status(200).json(await service.getTotalFollowers(targetEmail));
  } catch (error) {
    next(error);
  }
});

export const getTotalFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { targetEmail } = req.params;

    res.status(200).json(await service.getTotalFollowing(targetEmail));
  } catch (error) {
    next(error);
  }
});
