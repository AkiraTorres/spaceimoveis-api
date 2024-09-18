import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';

const service = new ClientService();

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await service.findAll(page, 'client');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const find = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.find({ email: req.params.email }, 'client');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let clientData = {};
    if (data !== undefined) clientData = JSON.parse(data);

    const result = await service.create(clientData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let clientData = {};
    if (data !== undefined) clientData = JSON.parse(data);

    const result = await service.update(req.params.email, clientData, file);
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

export const elevate = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let clientData = {};
    if (data !== undefined) clientData = JSON.parse(data);

    const result = await service.elevate(req.params.email, clientData, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
