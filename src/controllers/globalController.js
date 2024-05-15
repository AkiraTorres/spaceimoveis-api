import asyncHandler from 'express-async-handler';
import * as globalService from '../services/globalService.js';

export async function findAll(req, res) {
  try {
    const result = await globalService.findAll();

    return res.send(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function find(req, res) {
  try {
    const { email } = req.params;

    const user = await globalService.find(email);

    return res.json(user);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { password } = req.body;
    const { email } = req;

    const result = await globalService.changePassword(email, password);

    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function rescuePassword(req, res) {
  try {
    const { email } = req.body;

    const result = await globalService.rescuePassword(email);
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, password, otp } = req.body;

    const result = await globalService.resetPassword(email, password, otp);
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export const shareProperty = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { guestEmail } = req.body;
    const { email } = req;

    const result = await globalService.shareProperty(id, email, guestEmail);
    res.json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

export const getSharedProperties = asyncHandler(async (req, res) => {
  const { email } = req;
  const { page = 1, limit = 6 } = req.query;

  const result = await globalService.getSharedProperties(email, page, limit);
  res.json(result);
});

export const getSharedProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req;

  const result = await globalService.getSharedProperty(id, email);
  res.json(result);
});
