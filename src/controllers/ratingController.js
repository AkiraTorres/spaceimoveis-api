import asyncHandler from 'express-async-handler';

import * as service from '../services/ratingService.js';

export const getAllRatesByReceiver = asyncHandler(async (req, res) => {
  try {
    const { receiverEmail } = req.params;
    const { page } = req.query;

    const result = await service.getAllRatesByReceiver(receiverEmail, page);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const getAllRatesBySender = asyncHandler(async (req, res) => {
  try {
    const { senderEmail } = req.params;
    const { page } = req.query;

    const result = await service.getAllRatesBySender(senderEmail, page);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const getAvgRateByReceiver = asyncHandler(async (req, res) => {
  try {
    const { receiverEmail } = req.params;

    const result = await service.getAvgRateByReceiver(receiverEmail);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const setRate = asyncHandler(async (req, res) => {
  try {
    const { senderEmail, receiverEmail, rate, comment } = req.body;
    // const senderEmail = req.email;

    const result = await service.setRate(senderEmail, receiverEmail, rate, comment);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const filter = asyncHandler(async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = req.body;

    const result = await service.filter(data, page);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const deleteRate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const senderEmail = req.email;

    await service.deleteRate(id, senderEmail);
    res.status(204).end();
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});
