import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import getModelByName from "../utils/getModelByName.js";

// Verify that the user is authenticated
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(201, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Check if the user is verified
export const isUserVerified = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.verified) {
      throw new ApiError(
        400,
        `Please verify your account before changing the role`
      );
    }

    next();
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

// Check if the user is an Author
export const isAuthor = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "author") {
      throw new ApiError(400, "You are not an Author");
    }

    next();
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

// Check if the user is Authorized
export const isAuthorized = (modelName) =>
  asyncHandler(async (req, res, next) => {
    try {
      const user = req.user;

      // Extract the resource ID from the request parameters
      const resourceId = req.params._id;
      if (!resourceId) {
        throw new ApiError(400, "Resource ID not provided.");
      }

      // Dynamically select the appropriate model based on modelName
      const ResourceModel = getModelByName(modelName);

      if (!ResourceModel) {
        throw new Error(`Model ${modelName} not found.`);
      }

      // Fetch the resource from the database
      const resource = await ResourceModel.findById(resourceId);

      if (!resource) {
        throw new ApiError(404, "Resource not found.");
      }

      // Check if the requesting user is the owner of the resource
      if (resource.user.toString() !== user._id.toString()) {
        throw new ApiError(
          403,
          "You are not authorized to perform this action."
        );
      }

      next();
    } catch (error) {
      throw new ApiError(403, error?.message || "Forbidden");
    }
  });
