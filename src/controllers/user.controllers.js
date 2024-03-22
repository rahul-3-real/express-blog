import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  emailValidation,
  notEmptyValidation,
  passwordValidation,
  usernameValidation,
} from "../utils/validators.js";
import {
  generateAccessRefreshToken,
  generateVerificationToken,
  options,
  generate20CharToken,
} from "../utils/generateToken.js";
import { sendVerificationCodeEmail } from "../configs/email.config.js";

// Register Controller
export const registerController = asyncHandler(async (req, res) => {
  // Get Data From Frontend
  const { email, username, fullName, password, password2 } = req.body;

  // Validation Check
  notEmptyValidation([email, username, fullName, password]);
  usernameValidation(username);
  emailValidation(email);
  passwordValidation(password);

  // Check If user Exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Create New User
  const createdUser = await User.create({
    email,
    username,
    fullName,
    password,
  });

  // Check if user is created
  const user = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(500, "Error creating user, Please try again!");
  }

  // Save Verification Code
  const token = generate20CharToken();
  generateVerificationToken(user._id, token);
  sendVerificationCodeEmail(user.email, token);

  // Sending RESPONSE
  return res.status(201).json(new ApiResponse(200, user, "User registered!"));
});

// Login Controller
export const loginController = asyncHandler(async (req, res) => {
  // Getting data from frontend
  const { email, password } = req.body;

  // Validating Data
  notEmptyValidation([email, password]);
  emailValidation(email);

  // Check if data exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // Password Check
  const passwordCheck = await user.isPasswordCorrect(password);
  if (!passwordCheck) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate Token
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Sending RESPONSE
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedin successfully!"
      )
    );
});

// Logout Controller
export const logoutController = asyncHandler(async (req, res) => {
  // Delete cookies from Frontend
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  // Sending RESPONSE
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});
