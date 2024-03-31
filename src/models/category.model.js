import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;
