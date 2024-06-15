import asyncHandler from 'express-async-handler';

import * as service from '../services/sellerDashboardService.js';

export const totalPropertiesLikes = asyncHandler(async (req, res) => {
  const { email } = req;
  const result = await service.totalPropertiesLikes(email);
  res.status(200).json(result);
});

export const totalPropertiesViews = asyncHandler(async (req, res) => {
  const { email } = req;
  const result = await service.totalPropertiesViews(email);
  res.status(200).json(result);
});

export const propertiesLikesMonthly = asyncHandler(async (req, res) => {
  const { email } = req;
  const result = await service.propertiesLikesMonthly(email);
  res.status(200).json(result);
});

export const propertiesViewsMonthly = asyncHandler(async (req, res) => {
  const { email } = req;
  const result = await service.propertiesViewsMonthly(email);
  res.status(200).json(result);
});

export const topProperties = asyncHandler(async (req, res) => {
  const { email } = req;
  const result = await service.topProperties(email);
  res.status(200).json(result);
});
