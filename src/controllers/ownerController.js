import asyncHandler from 'express-async-handler';

import * as service from '../services/ownerService.js';

export const findAll = asyncHandler(async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const result = await service.findAll(page);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const findByPk = asyncHandler(async (req, res) => {
  try {
    const result = await service.findByPk(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const create = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const result = await service.create(data);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const update = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const result = await service.update(req.params.email, data);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const destroy = asyncHandler(async (req, res) => {
  try {
    const result = await service.destroy(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});
