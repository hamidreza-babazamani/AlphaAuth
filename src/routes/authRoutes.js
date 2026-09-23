const express = require("express");
const authController = require("../controllers/authController");
const otpController = require("../controllers/otpController");
const { protect } = require("../middleware/authMiddleware");
const { signupRules, loginRules } = require("../middleware/validate");
const { otpLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// --- احراز هویت ---
router.post("/signup", signupRules, authController.signup);
router.post("/login", loginRules, authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);

// --- تأیید ایمیل ---
router.post(
  "/verify-email/send",
  protect,
  otpLimiter,
  otpController.sendEmailOtp,
);
router.post("/verify-email/confirm", protect, otpController.verifyEmailOtp);

// --- تأیید شماره ---
router.post(
  "/verify-phone/send",
  protect,
  otpLimiter,
  otpController.sendPhoneOtp,
);
router.post("/verify-phone/confirm", protect, otpController.verifyPhoneOtp);

// --- فراموشی رمز ---
router.post("/forgot-password", otpLimiter, otpController.forgotPassword);
router.post("/reset-password", otpController.resetPassword);

module.exports = router;
