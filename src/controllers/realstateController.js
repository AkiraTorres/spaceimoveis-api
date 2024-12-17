import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';
import RealstateService from '../services/realstateService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await RealstateService.findAll(page, 'realstate');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const result = await RealstateService.find({ email: req.params.email }, 'realstate');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    let realstateData = {};
    if (data !== undefined) realstateData = JSON.parse(data);
    realstateData.type = 'realstate';

    const result = await RealstateService.create(realstateData, files);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    let realstateData = {};
    if (data !== undefined) realstateData = JSON.parse(data);

    const result = await RealstateService.update(req.params.email, realstateData, files);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const elevate = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    let realstateData = {};
    if (data !== undefined) realstateData = JSON.parse(data);

    const result = await ClientService.elevate(req.params.email, realstateData, files, 'realstate');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = req.body;

    const result = await RealstateService.filter(data, 'realstate', page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const result = await RealstateService.destroy(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAvailability = asyncHandler(async (req, res, next) => {
  try {
    const result = await RealstateService.getAvailability(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const setAvailability = asyncHandler(async (req, res, next) => {
  try {
    const { disponibilidade } = req.body;
    const result = await RealstateService.setAvailability(req.email, disponibilidade);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
