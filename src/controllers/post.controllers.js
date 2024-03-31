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
