import asyncHandler from 'express-async-handler';

import * as service from '../services/propertyService.js';

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    const {page = 1, isHighlighted = false, isPublished = true, limit = 6} = req.query;

    const result = await service.findAll(page, isHighlighted, isPublished, limit);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const recommendedProperties = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.recommendedProperties(true, false);
    res.json(result);
  } catch(error) {
    next(error);
  }
});

export const findByPk = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;

    const result = await service.findByPk(id);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const findBySellerEmail = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req.params;
    const {page = 1, limit = 6} = req.query;

    const result = await service.findBySellerEmail(email, page, limit);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const getAllPropertiesIds = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.getAllPropertiesIds(req.email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const getAllPropertiesCities = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.getAllPropertiesCities(req.email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const getTimesSeen = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;

    const result = await service.getTimesSeen(id);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const addTimesSeen = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;

    const result = await service.addTimesSeen(id);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const getMostSeenPropertiesBySeller = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req.params;
    const {limit = 6} = req.query;

    const result = await service.getMostSeenPropertiesBySeller(email, limit);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const create = asyncHandler(async (req, res, next) => {
  try {
    const {data} = req.body;
    const {files} = req;

    const propertyData = JSON.parse(data);

    const result = await service.create(propertyData, files);
    res.status(201).json(result);
  } catch(error) {
    next(error);
  }
});

export const filter = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const {page = 1, isHighlighted = false, isPublished = true, limit = 6, verified = true} = req.query;

    const result = await service.filter(data, verified, page, isHighlighted, isPublished, limit);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const update = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;
    const {data} = req.body;
    const {files} = req;

    const result = await service.update(id, JSON.parse(data), files, req.email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const destroy = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;
    const {email} = req;

    const result = await service.destroy(id, email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const testPicture = asyncHandler(async (req, res, next) => {
  try {
    const {files} = req;

    console.log(files);

    res.status(200).json({files});
  } catch(error) {
    next(error);
  }
});