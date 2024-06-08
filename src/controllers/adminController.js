import asyncHandler from 'express-async-handler';

import * as service from '../services/adminService.js';

export const getLastPublishedProperties = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;

  const result = await service.getLastPublishedProperties(page);
  res.status(200).json(result);
});

export const getLastRegisteredUsers = asyncHandler(async (req, res) => {
  const result = await service.getLastRegisteredUsers();
  res.status(200).json(result);
});

export const denyProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await service.denyProperty(id);
  res.status(200).send();
});

export const denyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await service.denyUser(id);
  res.status(200).send();
});
