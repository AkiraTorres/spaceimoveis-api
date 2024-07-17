import asyncHandler from 'express-async-handler';
import * as globalService from '../services/globalService.js';

export async function findAll(req, res, next) {
  try {
    const result = await globalService.findAll();

    return res.send(result);
  } catch (error) {
    next(error);
  }
}

export async function find(req, res, next) {
  try {
    const { email } = req.params;

    const user = await globalService.find(email);

    return res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { password } = req.body;
    const { email } = req;

    const result = await globalService.changePassword(email, password);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function rescuePassword(req, res, next) {
  try {
    const { email } = req.body;

    const result = await globalService.rescuePassword(email);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, password, otp } = req.body;

    const result = await globalService.resetPassword(email, password, otp);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export const shareProperty = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { guestEmail } = req.body;
    const { email } = req;

    const result = await globalService.shareProperty(id, email, guestEmail);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const getSharedProperties = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req;
    const {page = 1, limit = 6} = req.query;

    const result = await globalService.getSharedProperties(email, page, limit);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const getSharedProperty = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;
    const {email} = req;

    const result = await globalService.getSharedProperty(id, email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const confirmSharedProperty = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;
    const {email} = req;

    const result = await globalService.confirmSharedProperty(id, email);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const negateSharedProperty = asyncHandler(async (req, res, next) => {
  try {
    const {id} = req.params;
    const {email} = req;
    const {reason} = req.body;

    const result = await globalService.negateSharedProperty(id, email, reason);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

export const contact = asyncHandler(async (req, res, next) => {
  try {
    const {email} = req.body;
    const {message} = req.body;
    const {name} = req.body;
    const {type} = req.body;

    const result = await globalService.contact(email, message, name, type);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});
