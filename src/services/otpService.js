const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// تولید کد ۶ رقمی امن
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// هش کردن کد قبل از ذخیره در دیتابیس
async function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

// مقایسه کد وارد شده با هش ذخیره‌شده
async function verifyOtp(code, hashedOtp) {
  return bcrypt.compare(code, hashedOtp);
}

// زمان انقضا از الان
function getExpiry() {
  const minutes = parseInt(process.env.OTP_EXPIRES_MIN || "10", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOtp, hashOtp, verifyOtp, getExpiry };
