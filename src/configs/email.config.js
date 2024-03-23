import nodemailer from "nodemailer";
import connectServer from "../configs/server.config.js";
import ApiError from "../utils/apiError.js";

// Transporter (Setting up SMTP details)
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Sending Verification Code Email
export const sendVerificationCodeEmail = async (sendTo, verificationCode) => {
  const appUrl = "http://localhost:3001";
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sendTo,
      subject: "Express Blog - Verification Code",
      html: `<h1>Hello ${sendTo}</h1><p>Please verify your email by clicking on the link below</p><a href="${appUrl}/api/users/verify-account?token=${verificationCode}">Verify</a>`,
    });
    return info;
  } catch (error) {
    throw new ApiError(500, `Error sending Email :: ${error}`);
  }
};
