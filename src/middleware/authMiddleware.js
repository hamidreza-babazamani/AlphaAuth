const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

// ================================================================
// protect: چک می‌کنه کاربر لاگین هست یا نه
// ================================================================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // ۱. اول از کوکی
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }
    // ۲. اگه نبود، از هدر Authorization
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("لطفاً وارد شوید", 401));
    }

    // اعتبارسنجی توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("کاربر دیگر وجود ندارد", 401));
    }

    // کاربر رو به req اضافه کن برای روت‌های بعدی
    req.user = user;
    next();
  } catch (err) {
    next(new AppError("توکن نامعتبر یا منقضی شده", 401));
  }
};

// ================================================================
// restrictTo: چک می‌کنه کاربر کدوم نقش رو داره
// ================================================================
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user تو مرحله protect پر شده
    if (!req.user) {
      return next(new AppError("ابتدا وارد شوید", 401));
    }

    // چک کن نقش کاربر تو لیست نقش‌های مجاز هست
    if (!roles.includes(req.user.role)) {
      return next(new AppError("شما اجازه دسترسی به این بخش را ندارید", 403));
    }

    next();
  };
};
