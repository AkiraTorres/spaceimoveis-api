import asyncHandler from 'express-async-handler';

import PostService from '../services/postService.js';

export const getPostsByUserEmail = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const posts = await PostService.getPostsByUserEmail(email, page, limit);
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

export const getPostById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await PostService.getPostById(id);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

export const getPostsByFollowed = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { page = 1, limit = 20 } = req.query;

    const posts = await PostService.getPostsByFollowed(email, page, limit);
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

export const createPost = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req;
    const { data } = req.body;
    const { files } = req;

    const { text } = data !== undefined ? JSON.parse(data) : { text: null };

    const post = await PostService.create({ content: text, medias: files, email });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

export const likePost = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    res.status(200).json(await PostService.likePost(id, email));
  } catch (error) {
    next(error);
  }
});

export const commentPost = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;
    const { text } = req.body;

    const result = await PostService.commentPost(id, email, text);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export const deletePost = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req;

    await PostService.deletePost(id, email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
