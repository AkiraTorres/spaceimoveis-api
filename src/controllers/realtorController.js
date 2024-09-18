import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';
import RealtorService from '../services/realtorService.js';

const service = new RealtorService();
const clientService = new ClientService();

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await service.findAll(page, 'realtor');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.findByPk({ email: req.params.email, type: 'realtor' });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let realtorData = {};
    if (data !== undefined) realtorData = JSON.parse(data);

    const result = await service.create(realtorData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let realtorData = {};
    if (data !== undefined) realtorData = JSON.parse(data);

    const result = await service.update(req.params.email, realtorData, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const elevate = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let realtorData = {};
    if (data !== undefined) realtorData = JSON.parse(data);

    const result = await clientService.elevate(req.params.email, realtorData, file, 'realtor');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = req.body;

    const result = await service.filter(data, 'realtor', page);
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
