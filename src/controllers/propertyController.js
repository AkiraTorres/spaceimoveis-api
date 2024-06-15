import asyncHandler from 'express-async-handler';

import * as service from '../services/propertyService.js';

export const findAll = asyncHandler(async (req, res) => {
  const { page = 1, isHighlighted = false, isPublished = true, limit = 6 } = req.query;

  const result = await service.findAll(page, isHighlighted, isPublished, limit);
  res.status(200).json(result);
});

export const recommendedProperties = asyncHandler(async (req, res) => {
  const result = await service.recommendedProperties(true, false);
  res.json(result);
});

export const findByPk = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await service.findByPk(id);
  res.status(200).json(result);
});

export const findBySellerEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { page = 1, limit = 6 } = req.query;

  const result = await service.findBySellerEmail(email, page, limit);
  res.status(200).json(result);
});

export const getAllPropertiesIds = asyncHandler(async (req, res) => {
  const result = await service.getAllPropertiesIds(req.email);
  res.status(200).json(result);
});

export const getAllPropertiesCities = asyncHandler(async (req, res) => {
  const result = await service.getAllPropertiesCities(req.email);
  res.status(200).json(result);
});

export const getTimesSeen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await service.getTimesSeen(id);
  res.status(200).json(result);
});

export const addTimesSeen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await service.addTimesSeen(id);
  res.status(200).json(result);
});

export const getMostSeenPropertiesBySeller = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { limit = 6 } = req.query;

  const result = await service.getMostSeenPropertiesBySeller(email, limit);
  res.status(200).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const { data } = req.body;
  const { files } = req;

  const propertyData = JSON.parse(data);

  const result = await service.create(propertyData, files);
  res.status(201).json(result);
});

export const filter = asyncHandler(async (req, res) => {
  const data = req.body;
  const { page = 1, isHighlighted = false, isPublished = true, limit = 6 } = req.query;

  const result = await service.filter(data, page, isHighlighted, isPublished, limit, true);
  res.status(200).json(result);
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { files } = req;

  const result = await service.update(id, JSON.parse(data), files, req.email);
  res.status(200).json(result);
});

export const destroy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req;

  const result = await service.destroy(id, email);
  res.status(200).json(result);
});
