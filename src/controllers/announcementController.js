import asyncHandler from 'express-async-handler';

import AnnouncementService from '../services/announcementService.js';

export const getAnnouncement = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await AnnouncementService.getAnnouncement(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getAnnouncements = asyncHandler(async (req, res, next) => {
  try {
    const { active = null } = req.query;

    const result = await AnnouncementService.getAnnouncements(active);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const getUserAnnouncements = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;

    const result = await AnnouncementService.getUserAnnouncements(email);
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
    const { file, email = null } = req;

    let announcementData = {};
    if (data !== undefined) announcementData = JSON.parse(data);

    const result = await AnnouncementService.createAnnouncement(announcementData, file, email !== null);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const generatePayment = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;

    const result = await AnnouncementService.generatePayment(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const approveAnnouncement = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await AnnouncementService.approveAnnouncement(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const denyAnnouncement = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await AnnouncementService.denyAnnouncement(id);
    res.status(200).json(result);
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

export const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    const result = await AnnouncementService.deleteAnnouncement(id, email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
