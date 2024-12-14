import asyncHandler from 'express-async-handler';

import PropertyService from '../services/propertyService.js';
import SellerDashboardService from '../services/sellerDashboardService.js';

export const totalPropertiesLikes = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await SellerDashboardService.totalPropertiesLikes(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const totalPropertiesViews = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await SellerDashboardService.totalPropertiesViews(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesLikesMonthly = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await SellerDashboardService.propertiesLikesMonthly(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesViewsMonthly = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await SellerDashboardService.propertiesViewsMonthly(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const topProperties = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await SellerDashboardService.topProperties(email);
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

    const result = await PropertyService.filter(data, page, limit, '/dashboard/properties/filter');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const propertiesProportions = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const result = await SellerDashboardService.propertiesProportions(email);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
