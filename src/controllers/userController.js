import asyncHandler from 'express-async-handler';

import UserService from '../services/userService.js';

const service = new UserService();

export const find = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await service.find(req.params.email));
  } catch (error) {
    next(error);
  }
});

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await service.findAll());
  } catch (error) {
    next(error);
  }
});

export const changePassword = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await service.changePassword(req.email, req.body.password));
  } catch (error) {
    next(error);
  }
});

export const rescuePassword = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await service.rescuePassword(req.body));
  } catch (error) {
    next(error);
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await service.resetPassword(req.body));
  } catch (error) {
    next(error);
  }
});

export const contact = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await service.contact(req.body));
  } catch (error) {
    next(error);
  }
});
