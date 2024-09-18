import asyncHandler from 'express-async-handler';

import AdminService from '../services/adminService.js';
import PropertyService from '../services/propertyService.js';

const service = new AdminService();
const propertyService = new PropertyService();

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
    const { email } = req.params;

    const result = await service.findByPk(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findByCpf = asyncHandler(async (req, res, next) => {
  try {
    const { cpf } = req.params;

    const result = await service.findByCpf(cpf);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let adminData = {};
    if (data !== undefined) adminData = JSON.parse(data);

    const result = await service.create(adminData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let adminData = {};
    if (data !== undefined) adminData = JSON.parse(data);

    const result = await service.update(req.params.email, adminData, file);
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

export const getLastPublishedProperties = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const result = await service.getLastPublishedProperties(page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getLastRegisteredUsers = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.getLastRegisteredUsers();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const approveProperty = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.approveProperty(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const denyProperty = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await service.denyProperty(id, reason);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const denyUser = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;
    const { reason } = req.body;

    const result = await service.denyUser(email, reason);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const filterProperties = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, isHighlighted = false, isPublished = true, limit = 6, verified = false } = req.query;
    const filter = req.body;

    const result = await propertyService.filter(filter, verified, page, isHighlighted, isPublished, limit, '/admin/properties/filter');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const filterUsers = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = req.body;

    const result = await service.filterUsers(filter, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const usersRegisteredMonthly = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.usersRegisteredMonthly();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesRegisteredMonthly = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.propertiesRegisteredMonthly();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
