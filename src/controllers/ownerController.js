import asyncHandler from 'express-async-handler';

import * as service from '../services/ownerService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await service.findAll(page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.findByPk(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let ownerData = {};
    if (data !== undefined) ownerData = JSON.parse(data);

    const result = await service.create(ownerData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let ownerData = {};
    if (data !== undefined) ownerData = JSON.parse(data);

    const result = await service.update(req.params.email, ownerData, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const elevate = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let ownerData = {};
    if (data !== undefined) ownerData = JSON.parse(data);

    const result = await service.elevate(req.params.email, ownerData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.destroy(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
