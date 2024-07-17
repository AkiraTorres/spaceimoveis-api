import * as service from "../services/messageService.js";
import asyncHandler from "express-async-handler";

export const createMessage = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { chatId } = req.params;
    const { text } = req.body;

    const message = await service.createMessage({ chatId, email, text });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

export const findMessages = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { chatId } = req.params;

    const messages = await service.findMessages(chatId, email);
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    await service.deleteMessage(id, email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

