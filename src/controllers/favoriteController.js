import asyncHandler from 'express-async-handler';

import * as service from '../services/favoriteService.js';

export const setFavorite = asyncHandler(async (req, res) => {
  try {
    const { email, propertyId } = req.body;

    const result = await service.setFavorite(email, propertyId);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const getFavorites = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;

    const result = await service.getFavorites(email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const removeFavorite = asyncHandler(async (req, res) => {
  try {
    const { email, propertyId } = req.params;

    await service.removeFavorite(email, propertyId);
    res.status(204).end();
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});
