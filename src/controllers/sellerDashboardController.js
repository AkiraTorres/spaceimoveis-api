import asyncHandler from 'express-async-handler';

import PropertyService from '../services/propertyService.js';
import SellerDashboardService from '../services/sellerDashboardService.js';

const service = new SellerDashboardService();
const propertyService = new PropertyService();

export const totalPropertiesLikes = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await service.totalPropertiesLikes(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const totalPropertiesViews = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await service.totalPropertiesViews(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesLikesMonthly = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await service.propertiesLikesMonthly(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesViewsMonthly = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await service.propertiesViewsMonthly(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const topProperties = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await service.topProperties(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesFilter = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { page = 1, limit = 6 } = req.query;
    const data = req.body;
    data.advertiserEmail = email;

    const result = await propertyService.filter(data, page, limit, '/dashboard/properties/filter');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
