const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const {
  signToken,
  sendTokenCookie,
  clearTokenCookie,
} = require("../utils/token");

// ================================================================
// SIGN UP
// ================================================================
exports.signup = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // اعتبارسنجی سطح کنترلر
    if (password !== confirmPassword) {
      return next(new AppError("پسوردها یکسان نیستند", 400));
    }

    // چک تکراری بودن
    const exists = await User.findOne({ email });
    if (exists) {
      return next(new AppError("این ایمیل قبلاً ثبت شده", 409));
    }

    // ✅ جدید: تعیین نقش بر اساس ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const role = adminEmails.includes(email.toLowerCase()) ? "admin" : "user";

    // هش کردن پسورد
    const hashed = await bcrypt.hash(password, 12);

    // ساخت کاربر (با role صریح)
    const user = await User.create({ email, password: hashed, role });

    // ساخت توکن و ست کردن کوکی
    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      status: "success",
      message: "ثبت‌نام موفق",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// LOGIN
// ================================================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // چون select: false هست، باید صریحاً password رو بخوایم
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("ایمیل یا پسورد اشتباه است", 401));
    }

    // مقایسه پسورد
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("ایمیل یا پسورد اشتباه است", 401));
    }

    // توکن و کوکی
    const token = signToken(user._id);
    sendTokenCookie(res, token);

    // قبل از ارسال، پسورد رو پاک کن
    user.password = undefined;

    res.json({
      status: "success",
      message: "ورود موفق",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// LOGOUT
// ================================================================
exports.logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ status: "success", message: "خروج موفق" });
};

// ================================================================
// ME (اطلاعات کاربر جاری)
// ================================================================
exports.getMe = (req, res) => {
  res.json({
    status: "success",
    data: { user: req.user },
  });
};
