import Tag from "../models/tag.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { notEmptyValidation } from "../utils/validators.js";

// Get Tags Controller
export const getTagsController = asyncHandler(async (req, res) => {
  const tags = await Tag.find();
  res
    .status(200)
    .json(new ApiResponse(200, tags, "Tags fetched successfully!"));
});

// Create Tag Controller
export const createTagController = asyncHandler(async (req, res) => {
  // Get data from frontend
  const user = await req.user;
  const { title, description } = req.body;

  // Validate Data
  notEmptyValidation([title, description]);

  // Check if tag already exist
  const tagExists = await Tag.findOne({ title });
  if (tagExists) throw new ApiError(400, "Tag already exists");

  // Create a new Tag
  const tag = await Tag.create({ title, description, user: user._id });

  // Sending RESPONSE
  res.status(201).json(new ApiResponse(201, tag, "Tag created successfully!"));
});
