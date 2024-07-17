import asyncHandler from 'express-async-handler';

import { filter } from '../services/propertyService.js';
import * as service from '../services/sellerDashboardService.js';

export const totalPropertiesLikes = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const result = await service.totalPropertiesLikes(email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const totalPropertiesViews = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const result = await service.totalPropertiesViews(email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const propertiesLikesMonthly = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const result = await service.propertiesLikesMonthly(email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const propertiesViewsMonthly = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const result = await service.propertiesViewsMonthly(email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const topProperties = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const result = await service.topProperties(email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const propertiesFilter = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const {page = 1, isHighlighted = false, isPublished = true, limit = 6} = req.query;
    const data = req.body;
    data.email = email;

    const result = await filter(data, false, page, isHighlighted, isPublished, limit, '/dashboard/properties/filter');
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});
