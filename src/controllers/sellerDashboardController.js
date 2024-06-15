import asyncHandler from 'express-async-handler';

import * as service from '../services/sellerDashboardService.js';

export const totalPropertiesLikes = asyncHandler(async (req, res) => {
  const result = await service.totalPropertiesLikes(req.email);
  res.status(200).json(result);
});

export const totalPropertiesViews = asyncHandler(async (req, res) => {
  const result = await service.totalPropertiesViews(req.email);
  res.status(200).json(result);
});
