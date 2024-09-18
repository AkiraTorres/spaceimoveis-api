import asyncHandler from 'express-async-handler';

import FollowerService from '../services/followerService.js';

export const follow = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { followedEmail } = req.params;

    res.status(200).json(await FollowerService.follow(email, followedEmail));
  } catch (error) {
    next(error);
  }
});

export const unfollow = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { followedEmail } = req.params;

    res.status(200).json(await FollowerService.unfollow(email, followedEmail));
  } catch (error) {
    next(error);
  }
});

export const getFollowers = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    res.status(200).json(await FollowerService.getFollowers(email));
  } catch (error) {
    next(error);
  }
});

export const getFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    res.status(200).json(await FollowerService.getFollowing(email));
  } catch (error) {
    next(error);
  }
});

export const isFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    res.status(200).json(await FollowerService.isFollowing(email, targetEmail));
  } catch (error) {
    next(error);
  }
});

export const isMutual = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    res.status(200).json(await FollowerService.isMutual(email, targetEmail));
  } catch (error) {
    next(error);
  }
});

export const getTotalFollowers = asyncHandler(async (req, res, next) => {
  try {
    const { targetEmail } = req.params;

    res.status(200).json(await FollowerService.getTotalFollowers(targetEmail));
  } catch (error) {
    next(error);
  }
});

export const getTotalFollowing = asyncHandler(async (req, res, next) => {
  try {
    const { targetEmail } = req.params;

    res.status(200).json(await FollowerService.getTotalFollowing(targetEmail));
  } catch (error) {
    next(error);
  }
});
