import asyncHandler from "express-async-handler";

import * as service from "../services/chatService.js";

export const createChat = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    const chat = await service.create(email, targetEmail);
    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
});

export const findUserChats = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;

    const chats = await service.findUserChats(email);
    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
});

export const findChat = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { targetEmail } = req.params;

    const chat = await service.findChat(email, targetEmail);
    res.status(200).json(chat);
  } catch (error) {
    next(error);
  }
});
