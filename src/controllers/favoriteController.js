import asyncHandler from 'express-async-handler';

import FavoriteService from '../services/favoriteService.js';

export const setFavorite = asyncHandler(async (req, res, next) => {
  try {
    const { email, propertyId } = req.body;

    const result = await FavoriteService.setFavorite(email, propertyId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const getFavorites = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    const result = await FavoriteService.getFavorites(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getPropertyTotalFavorites = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await FavoriteService.getPropertyTotalFavorites(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const removeFavorite = asyncHandler(async (req, res, next) => {
  try {
    const { email, propertyId } = req.params;

    await FavoriteService.removeFavorite(email, propertyId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
