import asyncHandler from 'express-async-handler';

import * as service from '../services/propertyService.js';

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
    const { id } = req.params;

    const result = await service.findByPk(id);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const findBySellerEmail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;

    const result = await service.findBySellerEmail(email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const create = asyncHandler(async (req, res) => {
  try {
    const { data } = req.body;
    const { files } = req;

    const propertyData = JSON.parse(data);

    const result = await service.create(propertyData, files);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const filter = asyncHandler(async (req, res) => {
  const { data } = req.body;
  const { page = 1 } = req.query;

  const result = await service.filter(JSON.parse(data), page);
  res.status(200).json(result);
});

export const update = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { files } = req;

    const result = await service.update(id, JSON.parse(data), files);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const destroy = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const result = await service.destroy(id);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});
