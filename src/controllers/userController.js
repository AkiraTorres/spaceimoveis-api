import asyncHandler from 'express-async-handler';

import UserService from '../services/userService.js';

export const find = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await UserService.find({ email: req.params.email }));
  } catch (error) {
    next(error);
  }
});

export const findAll = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await UserService.findAll());
  } catch (error) {
    next(error);
  }
});

export const changePassword = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await UserService.changePassword(req.email, req.body.password));
  } catch (error) {
    next(error);
  }
});

export const rescuePassword = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    res.status(200).json(await UserService.rescuePassword(data));
  } catch (error) {
    next(error);
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await UserService.resetPassword(req.body));
  } catch (error) {
    next(error);
  }
});

export const contact = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).json(await UserService.contact(req.body));
  } catch (error) {
    next(error);
  }
});

export const findAllAppointments = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;

    const result = await UserService.findAllAppointments(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const findAppointmentById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    const result = await UserService.findAppointmentById(id, email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const returnRandomSellers = asyncHandler(async (req, res, next) => {
  try {
    const { total = 5 } = req.query;

    const result = await UserService.returnRandomSellers(total);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
