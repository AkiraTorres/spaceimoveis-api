import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';
import OwnerService from '../services/ownerService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await OwnerService.findAll(page, 'owner');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const result = await OwnerService.find({ email: req.params.email }, 'owner');
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
    ownerData.type = 'owner';

    const result = await OwnerService.create(ownerData, file);
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

    const result = await OwnerService.update(req.params.email, ownerData, file);
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

    const result = await ClientService.elevate(req.params.email, ownerData, file, 'owner');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const result = await OwnerService.destroy(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
