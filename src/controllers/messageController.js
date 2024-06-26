import * as service from "../services/messageService.js";
import asyncHandler from "express-async-handler";

export const createMessage = asyncHandler(async (req, res) => {
  try {
    const { email } = req;
    const { chatId } = req.params;
    const { text } = req.body;

    const message = await service.createMessage({ chatId, email, text });
    res.status(201).json(message);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
    res.status(status).json({ message });
  }
});

export const findMessages = asyncHandler(async (req, res) => {
  try {
    const { email } = req;
    const { chatId } = req.params;

    const messages = await service.findMessages(chatId, email);
    res.status(200).json(messages);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
    res.status(status).json({ message });
  }
});

export const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req;

    await service.deleteMessage(id, email);
    res.status(204).send();
  } catch (error) {
    const status = error.status || 500;
    const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
    res.status(status).json({ message });
  }
});

