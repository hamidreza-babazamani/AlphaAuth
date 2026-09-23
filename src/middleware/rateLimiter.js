const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// محدودیت کلی — هر IP حداکثر ۱۰۰ درخواست در ۱۵ دقیقه
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "تعداد درخواست‌ها زیاد است. کمی صبر کن",
  },
});

// محدودیت سخت برای OTP — ۳ درخواست در دقیقه
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  // اگه کاربر لاگین بود بر اساس user._id، وگرنه با helper مخصوص IP
  keyGenerator: (req) => {
    if (req.user?._id) {
      return req.user._id.toString();
    }
    // ✅ استفاده از helper برای پشتیبانی صحیح IPv6
    return ipKeyGenerator(req);
  },
  message: {
    status: "fail",
    message: "لطفاً کمی صبر کن",
  },
});

module.exports = { generalLimiter, otpLimiter };
