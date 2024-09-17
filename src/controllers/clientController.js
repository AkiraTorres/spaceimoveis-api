import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await ClientService.findAll(page, 'client');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const find = asyncHandler(async (req, res, next) => {
  try {
    const result = await ClientService.find({ email: req.params.email });
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

    const result = await ClientService.create(clientData, file);
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

    const result = await ClientService.update(req.params.email, clientData, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const result = await ClientService.destroy(req.params.email);
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

    const result = await ClientService.elevate(req.params.email, clientData, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
