import mongoose from "mongoose";
import Post from "../models/post.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { notEmptyValidation } from "../utils/validators.js";

// Get All Post Controllers
export const getAllPostsController = asyncHandler(async (req, res) => {
  // Get all posts
  const posts = await Post.find();

  // Sending Response
  return res.status(200).json(new ApiResponse(200, posts, "Fetched all posts"));
});

// Get Single Post Controller
export const getPostController = asyncHandler(async (req, res) => {
  // Get Id from params
  const postId = req.params._id;
  const post = await Post.findById(postId);

  if (!post) throw new ApiError(404, "Post not found");

  // Send RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, post, "Fetched single post"));
});

// Create Post Controller
export const createPostController = asyncHandler(async (req, res) => {
  // Get data from frontend
  const user = req.user;
  const {
    title,
    category,
    tags,
    description,
    excerpt,
    isActive,
    isPublic,
    featuredImage,
  } = req.body;

  // Validate fields
  notEmptyValidation([title, description, excerpt]);

  // Check if the post exists for that user
  const existingPost = await Post.findOne({ title, user: user._id });
  if (existingPost) {
    throw new ApiError(400, "You have already created a post with same title");
  }

  // Split the tags string into an array of ObjectIds
  const tagIds = tags
    .split(",")
    .map((tagId) => new mongoose.Types.ObjectId(tagId.trim()));

  // Create Post
  const post = await Post.create({
    user: user._id,
    title,
    category,
    tags: tagIds,
    description,
    excerpt,
    isActive,
    isPublic,
    featuredImage,
  });

  // Sending RESPONSE
  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully!"));
});

// Update Post Controller
export const updatePostController = asyncHandler(async (req, res) => {});

// Delete Post Controller
export const deletePostController = asyncHandler(async (req, res) => {
  // Get Post
  const postId = req.params._id;
  const post = await Post.findById(postId);

  if (!post) throw new ApiError(404, "No such post found");

  // Delete Post
  await Post.findByIdAndDelete(postId);

  // Sending Response
  return res
    .status(200)
    .json(new ApiResponse(200, "Deleted", "Post deleted successfully!"));
});
