import Post from "../models/post.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// Update Post Controller

export const updatePostController = asyncHandler(async (req, res) => {
  // Get data from frontend
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
  const postId = req.params._id;
  const user = req.user;

  // Get Post
  const post = await Post.findById(postId);

  // Validate Posts
  const updatedPost = {};
  if (title) {
    if (title !== post.title) {
      const existingPost = await Post.findOne({ title, user: user._id });
      if (existingPost) {
        throw new ApiError(
          400,
          "You have already created a post with the same title"
        );
      }
    }
    updatedPost.title = title;
  } else {
    updatedPost.title = post.title;
  }

  const updatePropertyIfProvided = (propertyName, newValue) => {
    if (newValue) {
      updatedPost[propertyName] = newValue;
    } else {
      updatedPost[propertyName] = post[propertyName];
    }
  };

  updatePropertyIfProvided("description", description);
  updatePropertyIfProvided("tags", tags);
  updatePropertyIfProvided("category", category);
  updatePropertyIfProvided("excerpt", excerpt);
  updatePropertyIfProvided("isActive", isActive);
  updatePropertyIfProvided("isPublic", isPublic);
  updatePropertyIfProvided("featuredImage", featuredImage);

  // Sending RESPONSE
  res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});
