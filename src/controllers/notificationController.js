import asyncHandler from 'express-async-handler';

import NotificationService from '../services/notificationService.js';

export const getNotifications = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;

    const notification = await NotificationService.getNotifications(email);
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
});

export const getUnreadNotifications = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;

    await NotificationService.getUnreadNotifications(email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    await NotificationService.markAsRead(id, email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const markAllAsReadByChat = asyncHandler(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { email } = req;

    await NotificationService.markAllAsReadByChatId(chatId, email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const markAllAsReadByChatId = asyncHandler(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { email } = req;

    await NotificationService.markAllAsReadByChatId(chatId, email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
