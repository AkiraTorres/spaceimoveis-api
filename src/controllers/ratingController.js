import asyncHandler from 'express-async-handler';

import RatingService from '../services/ratingService.js';

export const getAllRatesByReceiver = asyncHandler(async (req, res, next) => {
  try {
    const { receiverEmail } = req.params;
    const { page } = req.query;

    const result = await RatingService.getAllRatesByReceiver(receiverEmail, page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAllRatesBySender = asyncHandler(async (req, res, next) => {
  try {
    const { senderEmail } = req.params;
    const { page } = req.query;

    const result = await RatingService.getAllRatesBySender(senderEmail, page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAvgRateByReceiver = asyncHandler(async (req, res, next) => {
  try {
    const { receiverEmail } = req.params;

    const result = await RatingService.getAvgRateByReceiver(receiverEmail);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const setRate = asyncHandler(async (req, res, next) => {
  try {
    const { senderEmail, receiverEmail, rate, comment } = req.body;

    const result = await RatingService.setRate(senderEmail, receiverEmail, rate, comment);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = req.body;

    const result = await RatingService.filter(data, page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const deleteRate = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const senderEmail = req.email;

    await RatingService.deleteRate(id, senderEmail);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
