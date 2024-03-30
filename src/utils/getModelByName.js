import Tag from "../models/tag.model.js";
import Category from "../models/category.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Get Model by name
const getModelByName = (modelName) => {
  switch (modelName) {
    case "Tag":
      return Tag;
    case "Post":
      return Post;
    case "Category":
      return Category;
    case "User":
      return User;
    default:
      return null;
  }
};

export default getModelByName;
