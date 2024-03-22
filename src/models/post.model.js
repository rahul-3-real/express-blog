import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: "uncategorized",
    },
    tags: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
    description: String,
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

export default Post;
