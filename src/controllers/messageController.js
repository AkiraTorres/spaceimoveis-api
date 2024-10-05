import asyncHandler from 'express-async-handler';

import MessageService from '../services/messageService.js';

export const createMessage = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { chatId } = req.params;
    const { text } = req.body;

    const message = await MessageService.createMessage({ chatId, email, text });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

export const findMessages = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { chatId } = req.params;

    console.log(chatId);

    const messages = await MessageService.findMessages(chatId, email);
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    await MessageService.deleteMessage(id, email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
