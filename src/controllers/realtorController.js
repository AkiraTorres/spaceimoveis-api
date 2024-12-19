import asyncHandler from 'express-async-handler';

import ClientService from '../services/clientService.js';
import RealtorService from '../services/realtorService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await RealtorService.findAll(page, 'realtor');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const result = await RealtorService.find({ email: req.params.email }, 'realtor');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    let realtorData = {};
    if (data !== undefined) realtorData = JSON.parse(data);
    realtorData.type = 'realtor';

    const result = await RealtorService.create(realtorData, files);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    let realtorData = {};
    if (data !== undefined) realtorData = JSON.parse(data);

    const result = await RealtorService.update(req.params.email, realtorData, files);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const elevate = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    let realtorData = {};
    if (data !== undefined) realtorData = JSON.parse(data);

    const result = await ClientService.elevate(req.params.email, realtorData, files, 'realtor');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = req.body;

    const result = await RealtorService.filter(data, 'realtor', page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const result = await RealtorService.destroy(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAvailability = asyncHandler(async (req, res, next) => {
  try {
    const result = await RealtorService.getAvailability(req.params.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const setAvailability = asyncHandler(async (req, res, next) => {
  try {
    const { disponibilidade } = req.body;
    const result = await RealtorService.setAvailability(req.email, disponibilidade);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const approveAppointment = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await RealtorService.approveAppointment(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const rejectAppointment = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await RealtorService.rejectAppointment(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
