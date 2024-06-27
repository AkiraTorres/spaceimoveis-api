import asyncHandler from "express-async-handler";

import * as service from "../services/chatService.js";

export const createChat = asyncHandler(async (req, res) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    const chat = await service.create(email, targetEmail);
    res.status(201).json(chat);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
    res.status(status).json({ message });
  }
});

export const findUserChats = asyncHandler(async (req, res) => {
  try {
    const { email } = req;

    const chats = await service.findUserChats(email);
    res.status(200).json(chats);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
    res.status(status).json({ message });
  }
});

export const findChat = asyncHandler(async (req, res) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    const chat = await service.findChat(email, targetEmail);
    res.status(200).json(chat);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
    res.status(status).json({ message });
  }
});
