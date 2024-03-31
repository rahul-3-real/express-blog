import Category from "../models/category.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { notEmptyValidation } from "../utils/validators.js";

// Get All Categories Controller
export const getCategoriesController = asyncHandler(async (req, res) => {
  // Get all categories
  const categories = await Category.find();

  // Sending Response
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Fetched all categories"));
});

// Get Single Category Controller
export const getCategoryController = asyncHandler(async (req, res) => {
  // Get Id from params
  const categoryId = req.params._id;
  const category = await Category.findById(categoryId);

  if (!category) throw new ApiError(404, "Category not found");

  // Send RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Fetched single category"));
});

// Create Category Controller
export const createCategoryController = asyncHandler(async (req, res) => {
  // Get data from frontend
  const user = await req.user;
  const { title, description } = req.body;

  // Validate Data
  notEmptyValidation([title, description]);

  // Check if category already exist
  const categoryExists = await Category.findOne({ title });
  if (categoryExists) throw new ApiError(400, "Category already exists");

  // Create a new category
  const category = await Category.create({
    title,
    description,
    user: user._id,
  });

  // Sending RESPONSE
  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully!"));
});

// Update Category Controller
export const updateCategoryController = asyncHandler(async (req, res) => {
  // Get category that needs to be updated
  const categoryId = req.params._id;
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, "Category not found");

  // Get data from frontend
  const { title, description } = req.body;

  const updatedCategoryDetails = {};

  // Validate data
  if (title) {
    const titleExists = await Category.findOne({ title });
    if (titleExists && titleExists?.title !== category.title) {
      throw new ApiError(400, "Category already exists");
    }
    updatedCategoryDetails.title = title;
  } else {
    updatedCategoryDetails.title = category.title;
  }

  if (description) {
    updatedCategoryDetails.description = description;
  } else {
    updatedCategoryDetails.description = category.description;
  }

  // Update Category details
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: updatedCategoryDetails,
    },
    { new: true }
  );

  // Send RESPONSE
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCategory, "Category updated successfully!")
    );
});

// Delete Category Controller
export const deleteCategoryController = asyncHandler(async (req, res) => {
  // Get category
  const categoryId = req.params._id;
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, "Category not found");

  // Delete category
  await Category.findByIdAndDelete(categoryId);

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, "Deleted", "Category deleted successfully!"));
});
