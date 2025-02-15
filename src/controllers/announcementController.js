import asyncHandler from 'express-async-handler';

import AnnouncementService from '../services/announcementService.js';

export const getAnnouncements = asyncHandler(async (req, res, next) => {
  try {
    const { active = null } = req.query;

    const result = await AnnouncementService.getAnnouncements(active);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getValidAnnouncements = asyncHandler(async (req, res, next) => {
  try {
    const result = await AnnouncementService.getAnnouncements(true);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const createAnnouncement = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;
    const { file } = req;

    let announcementData = {};
    if (data !== undefined) announcementData = JSON.parse(data);

    const result = await AnnouncementService.createAnnouncement(announcementData, file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const addViewAnnouncement = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await AnnouncementService.addViewAnnouncement(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const handlePayment = asyncHandler(async (req, res, next) => {
  try {
    const { action, data } = req.body;

    const result = await AnnouncementService.handlePayment(action, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
