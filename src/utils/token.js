const jwt = require("jsonwebtoken");

// ساخت توکن از روی ID کاربر
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// تنظیمات کوکی (برای امنیت)
const cookieOptions = {
  httpOnly: true, // JS نمی‌تونه بخونه → ضد XSS
  secure: process.env.NODE_ENV === "production", // فقط HTTPS
  sameSite: "strict", // ضد CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز (میلی‌ثانیه)
};

// ذخیره توکن در کوکی
const sendTokenCookie = (res, token) => {
  res.cookie("jwt", token, cookieOptions);
};

// پاک کردن کوکی (logout)
const clearTokenCookie = (res) => {
  res.cookie("jwt", "", { ...cookieOptions, maxAge: 0 });
};

module.exports = { signToken, sendTokenCookie, clearTokenCookie };
