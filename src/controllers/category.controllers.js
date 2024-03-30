import Category from "../models/category.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { notEmptyValidation } from "../utils/validators.js";

// Get All Categories
export const getCategoriesController = asyncHandler(async (req, res) => {
  // Get all categories
  const categories = await Category.find();

  // Sending Response
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Fetched all categories"));
});
