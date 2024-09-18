import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';
import RealstateService from '../services/realstateService.js';

const service = new RealstateService();
const clientService = new ClientService();

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await service.findAll(page, 'realstate');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.find({ email: req.params.email }, 'realstate');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let realstateData = {};
    if (data !== undefined) realstateData = JSON.parse(data);

    const result = await service.create(realstateData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let realstateData = {};
    if (data !== undefined) realstateData = JSON.parse(data);

    const result = await service.update(req.params.email, realstateData, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const elevate = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let realstateData = {};
    if (data !== undefined) realstateData = JSON.parse(data);

    const result = await clientService.elevate(req.params.email, realstateData, file, 'realstate');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = req.body;

    const result = await service.filter(data, 'realstate', page);
    res.status(200).json(result);
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
