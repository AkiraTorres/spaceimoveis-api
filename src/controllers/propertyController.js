import asyncHandler from 'express-async-handler';

import PropertyService from '../services/propertyService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, isHighlighted = false, isPublished = true, limit = 6 } = req.query;

    const result = await PropertyService.findAll(page, isHighlighted, isPublished, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const recommendedProperties = asyncHandler(async (req, res, next) => {
  try {
    const result = await PropertyService.recommendedProperties(true, false);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await PropertyService.findByPk(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findBySellerEmail = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 6 } = req.query;

    const take = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    const result = await PropertyService.findBySellerEmail(email, page, take);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAllPropertiesIds = asyncHandler(async (req, res, next) => {
  try {
    const result = await PropertyService.getAllPropertiesIds(req.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAllPropertiesCities = asyncHandler(async (req, res, next) => {
  try {
    const result = await PropertyService.getAllPropertiesCities(req.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getTimesSeen = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await PropertyService.getTimesSeen(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const addTimesSeen = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await PropertyService.addTimesSeen(id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const getMostSeenPropertiesBySeller = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;
    const { limit = 6 } = req.query;

    const result = await PropertyService.getMostSeenPropertiesBySeller(email, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { files } = req;

    const propertyData = JSON.parse(data);

    const result = await PropertyService.create(propertyData, files);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const { page = 1, limit = 6, verified = true } = req.query;

    const result = await PropertyService.filter(data, verified, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const { files } = req;

    const result = await PropertyService.update(id, JSON.parse(data), files, req.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    const result = await PropertyService.destroy(id, email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const shareProperty = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;
    const data = req.body;

    const result = await PropertyService.shareProperty(id, email, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getSharedProperties = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { page = 1, limit = 6, status = null } = req.query;

    const result = await PropertyService.getSharedProperties(email, status, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const confirmSharedProperty = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    const result = await PropertyService.confirmSharedProperty(id, email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const negateSharedProperty = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;
    const { reason } = req.body;

    const result = await PropertyService.negateSharedProperty(id, email, reason);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const checkLimits = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;

    const result = await PropertyService.checkLimits(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
