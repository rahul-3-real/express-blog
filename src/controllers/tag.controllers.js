import Tag from "../models/tag.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { notEmptyValidation } from "../utils/validators.js";

// Get Tags Controller
export const getTagsController = asyncHandler(async (req, res) => {
  const tags = await Tag.find();
  return res
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
  return res
    .status(201)
    .json(new ApiResponse(201, tag, "Tag created successfully!"));
});

// Get Single Tag Controller
export const getTagController = asyncHandler(async (req, res) => {
  // Get tag
  const tagId = req.params._id;
  const tag = await Tag.findById(tagId);
  if (!tag) throw new ApiError(404, "Tag not found");

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, tag, "Tag detail fetched successfully!"));
});

// Update Tag Controller
export const updateTagController = asyncHandler(async (req, res) => {
  // Get tag that needs to be updated
  const tagId = req.params._id;
  const tag = await Tag.findById(tagId);
  if (!tag) throw new ApiError(404, "Tag not found");

  // Get data from frontend
  const { title, description } = req.body;

  const updatedTagDetails = {};

  // Validate data
  if (title) {
    const titleExists = await Tag.findOne({ title });
    if (titleExists && titleExists?.title !== tag.title) {
      throw new ApiError(400, "Tag already exists");
    }
    updatedTagDetails.title = title;
  } else {
    updatedTagDetails.title = tag.title;
  }

  if (description) {
    updatedTagDetails.description = description;
  } else {
    updatedTagDetails.description = tag.description;
  }

  // Update tag details
  const updatedTag = await Tag.findByIdAndUpdate(
    tagId,
    {
      $set: updatedTagDetails,
    },
    { new: true }
  );

  // Send RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTag, "Tag updated successfully!"));
});

// Delete Tag Controller
export const deleteTagController = asyncHandler(async (req, res) => {
  // Get tag
  const tagId = req.params._id;
  const tag = await Tag.findById(tagId);
  if (!tag) throw new ApiError(404, "Tag not found");

  // Delete tag
  await Tag.findByIdAndDelete(tagId);

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, "Deleted", "Tag deleted successfully!"));
});
