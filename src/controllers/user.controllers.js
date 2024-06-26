import jwt from "jsonwebtoken";
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
  generatePasswordResetToken,
} from "../utils/generateToken.js";
import {
  sendPasswordResetEmail,
  sendVerificationCodeEmail,
} from "../configs/email.config.js";

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

// Verify Account Controller
export const verifyAccountController = asyncHandler(async (req, res) => {
  // Getting code from Parameter
  const { token } = req.query;
  if (!token) throw new ApiError(400, "Verification token is missing");

  // Get Account associated with the token
  const user = await User.findOne({ verificationToken: token });
  if (!user) throw new ApiError(404, "User not found or is already verified");

  // Check if the token is expired
  const currentDate = new Date();
  if (currentDate > user.verificationTokenExpiry) {
    throw new ApiError(400, "Verification token has expired");
  }

  // Verify User
  try {
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
  } catch (error) {
    throw new ApiError(500, `Error while verifying your account :: ${error}`);
  }

  // Check if user is created
  const verifiedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, { user: verifiedUser }, "Account Verified!"));
});

// Resend Verify Account Link Controller
export const resendVerifyAccountLinkController = asyncHandler(
  async (req, res) => {
    // Get Email from frontend
    const { email } = req.body;

    // Validate Field
    notEmptyValidation([email]);
    emailValidation(email);

    // Check if user Exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User with this email does not exist");
    }

    if (user.verified) throw new ApiError(404, "User is already verified");

    // Generate Token
    const token = generate20CharToken();
    generateVerificationToken(user._id, token);
    sendVerificationCodeEmail(user.email, token);

    // Sending RESPONSE
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Verification link sent to your email"));
  }
);

// Reset Password Controller
export const resetPasswordController = asyncHandler(async (req, res) => {
  // Get data from frontend
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // Validate Fields
  notEmptyValidation([oldPassword, newPassword, confirmPassword]);

  // Check if old password matches
  const user = await User.findById(req.user._id);
  const passwordCheck = await user.isPasswordCorrect(oldPassword);
  if (!passwordCheck) {
    throw new ApiError(401, "Invalid old password");
  }

  // Check if passwords match
  passwordValidation(newPassword);
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // New Password should not be equal to old password
  if (newPassword === oldPassword) {
    throw new ApiError(400, "New password cannot be same as old password");
  }

  // Update Password
  user.password = newPassword;
  await user.save();

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully!"));
});

// Forgot Password Controller
export const forgotPasswordController = asyncHandler(async (req, res) => {
  // Get Email from frontend
  const { email } = req.body;

  // Check if teh field is valid
  notEmptyValidation([email]);
  emailValidation(email);

  // Check if user Exists
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User with this email does not exist");

  // Generate Token
  const token = generate20CharToken();
  generatePasswordResetToken(user._id, token);
  sendPasswordResetEmail(user.email, token);

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link sent to your email"));
});

// Forgot Password Request Controller
export const forgotPasswordRequestController = asyncHandler(
  async (req, res) => {
    // Get token from url
    const { token } = req.query;

    // Check if token is valid
    const user = await User.findOne({ passwordResetToken: token });
    if (!user) {
      throw new ApiError(404, "Password reset request is invalid");
    }

    const currentDate = new Date();
    if (currentDate > user.passwordResetTokenExpiry) {
      throw new ApiError(400, "Password reset token has expired");
    }

    // Get data from frontend
    const { newPassword, confirmPassword } = req.body;

    // Validate Fields
    notEmptyValidation([newPassword, confirmPassword]);
    passwordValidation(newPassword);

    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "Password does not match");
    }

    // Update Password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    // Sending RESPONSE
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully!"));
  }
);

// Become an Author Controller
export const becomeAuthorController = asyncHandler(async (req, res) => {
  // Get User from request and update role
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: "author" },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "You are now an author!"));
});

// Upload Avatar Image Controller
export const uploadAvatarImageController = asyncHandler(async (req, res) => {
  // Get file from frontend
  let localPath;
  if (!req.file) throw new ApiError(400, "Please upload a file");
  localPath = req.file?.path;

  // Upload file
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: localPath } },
    { new: true }
  ).select("-password -refreshToken");

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image uploaded successfully!"));
});

// Upload Cover Image Controller
export const uploadCoverImageController = asyncHandler(async (req, res) => {
  // Get file from frontend
  let localPath;
  if (!req.file) throw new ApiError(400, "Please upload a file");
  localPath = req.file?.path;

  // Upload file
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: localPath } },
    { new: true }
  ).select("-password -refreshToken");

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image uploaded successfully!"));
});

// Remove Avatar Image Controller
export const removeAvatarImageController = asyncHandler(async (req, res) => {
  // Get User from request and update role
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { avatar: "" } },
    { new: true }
  );

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image removed successfully!"));
});

// Remove Cover Image Controller
export const removeCoverImageController = asyncHandler(async (req, res) => {
  // Get User from request and update role
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { coverImage: "" } },
    { new: true }
  );

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image removed successfully!"));
});

// Get User Profile Controller
export const getUserProfile = asyncHandler(async (req, res) => {
  // Get Username from Params
  const { username } = req.params;

  // Check if username exists
  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, "User not found");

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully!"));
});

// Update User Profile Controller
export const updateUserProfile = asyncHandler(async (req, res) => {
  // Get data from frontend
  const { email, username, fullName } = req.body;

  const updatedUserDetail = {};

  // Check if email is provided and exists in database
  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists?.email !== req.user.email) {
      throw new ApiError(400, "Email already exists");
    }
    emailValidation(email);
    updatedUserDetail.email = email;
  } else {
    updatedUserDetail.email = req.user.email;
  }

  // Check if username is provided and exists in database
  if (username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists && usernameExists?.username !== req.user.username) {
      throw new ApiError(400, "Username already exists");
    }
    usernameValidation(username);
    updatedUserDetail.username = username;
  } else {
    updatedUserDetail.username = req.user.username;
  }

  // Update User
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email: updatedUserDetail.email,
        username: updatedUserDetail.username,
        fullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated"));
});

// Remove User Controller
export const removeUserController = asyncHandler(async (req, res) => {
  // Get User from request
  const user = req.user._id;

  // Delete User
  await User.findByIdAndDelete(user);

  // Sending RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, "", "User deleted successfully!"));
});

// Refresh Access Token Controller
export const refreshAccessTokenController = asyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized Request");
  }

  try {
    // Decode refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Check if user exists
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(400, "Invalid refresh token");
    }

    // Compare cookie refresh token with refresh token stored in database
    if (incomingRefreshToken !== user?.refreshToken) {
      res.status(401).json({ message: "Refres token is expired!" });
    }

    // Generate new access token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      user._id
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
            accessToken,
            refreshToken,
          },
          "Access token refreshed!"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message || "Invalid refresh token");
  }
});
