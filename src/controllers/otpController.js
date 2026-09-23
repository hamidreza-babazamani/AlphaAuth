const User = require("../models/User");
const AppError = require("../utils/AppError");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../services/emailService");
const { sendOtpSms } = require("../services/smsService");
const {
  generateOtp,
  hashOtp,
  verifyOtp,
  getExpiry,
} = require("../services/otpService");
const { signToken, sendTokenCookie } = require("../utils/token");

// ================================================================
// 1. ارسال کد تأیید ایمیل
// ================================================================
exports.sendEmailOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return next(new AppError("ایمیل شما قبلاً تأیید شده", 400));
    }

    // تولید کد و هش
    const code = generateOtp();
    user.emailOtp = await hashOtp(code);
    user.emailOtpExpires = getExpiry();
    user.emailOtpAttempts = 0;

    // validateBeforeSave: false → اعتبارسنجی مدل رو رد کن
    // چون داریم فقط OTP ذخیره می‌کنیم، نه کل سند
    await user.save({ validateBeforeSave: false });

    // ارسال ایمیل
    await sendOtpEmail(user.email, code, "verify");

    res.json({
      status: "success",
      message: "کد تأیید به ایمیل شما ارسال شد",
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 2. تأیید ایمیل با کد
// ================================================================
exports.verifyEmailOtp = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) return next(new AppError("کد را وارد کنید", 400));

    // select '+' → فیلدهایی که select:false هستن رو بیار
    const user = await User.findById(req.user._id).select(
      "+emailOtp +emailOtpExpires +emailOtpAttempts",
    );

    if (!user.emailOtp || !user.emailOtpExpires) {
      return next(new AppError("کدی ارسال نشده. دوباره درخواست بده", 400));
    }

    // چک انقضا
    if (user.emailOtpExpires < new Date()) {
      return next(new AppError("کد منقضی شده. دوباره درخواست بده", 400));
    }

    // چک تعداد تلاش
    if (user.emailOtpAttempts >= parseInt(process.env.OTP_MAX_ATTEMPTS)) {
      return next(
        new AppError("تعداد تلاش بیش از حد. دوباره درخواست بده", 429),
      );
    }

    // بررسی کد
    const isValid = await verifyOtp(code, user.emailOtp);
    if (!isValid) {
      user.emailOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("کد اشتباه است", 400));
    }

    // ✅ موفق: پاک کردن OTP و علامت‌گذاری
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    user.emailOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.json({ status: "success", message: "ایمیل با موفقیت تأیید شد" });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 3. ارسال کد تأیید شماره
// ================================================================
exports.sendPhoneOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) return next(new AppError("شماره تلفن را وارد کنید", 400));
    if (!/^09\d{9}$/.test(phone)) {
      return next(new AppError("شماره تلفن نامعتبر (مثال: 09123456789)", 400));
    }

    // چک تکراری بودن (به جز خود کاربر)
    const existing = await User.findOne({ phone, _id: { $ne: req.user._id } });
    if (existing) {
      return next(new AppError("این شماره قبلاً استفاده شده", 409));
    }

    const user = await User.findById(req.user._id);
    const code = generateOtp();

    user.phone = phone;
    user.phoneOtp = await hashOtp(code);
    user.phoneOtpExpires = getExpiry();
    user.phoneOtpAttempts = 0;
    user.isPhoneVerified = false;
    await user.save({ validateBeforeSave: false });

    // ارسال SMS
    await sendOtpSms(phone, code);

    res.json({
      status: "success",
      message: "کد تأیید به شماره شما ارسال شد",
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 4. تأیید شماره
// ================================================================
exports.verifyPhoneOtp = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return next(new AppError("کد را وارد کنید", 400));

    const user = await User.findById(req.user._id).select(
      "+phoneOtp +phoneOtpExpires +phoneOtpAttempts",
    );

    if (!user.phoneOtp || !user.phoneOtpExpires) {
      return next(new AppError("کدی ارسال نشده", 400));
    }
    if (user.phoneOtpExpires < new Date()) {
      return next(new AppError("کد منقضی شده", 400));
    }
    if (user.phoneOtpAttempts >= parseInt(process.env.OTP_MAX_ATTEMPTS)) {
      return next(new AppError("تعداد تلاش بیش از حد", 429));
    }

    const isValid = await verifyOtp(code, user.phoneOtp);
    if (!isValid) {
      user.phoneOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("کد اشتباه است", 400));
    }

    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    user.phoneOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.json({ status: "success", message: "شماره با موفقیت تأیید شد" });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 5. فراموشی رمز: درخواست کد
// ================================================================
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // ⚠️ امنیت: همیشه پیام موفق می‌دیم (چه ایمیل باشه چه نباشه)
    if (!user) {
      return res.json({
        status: "success",
        message: "اگر ایمیل شما در سیستم باشد، کد بازیابی ارسال می‌شود",
      });
    }

    const code = generateOtp();
    user.resetPasswordOtp = await hashOtp(code);
    user.resetPasswordOtpExpires = getExpiry();
    user.resetPasswordOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, code, "reset");

    res.json({
      status: "success",
      message: "اگر ایمیل شما در سیستم باشد، کد بازیابی ارسال می‌شود",
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 6. فراموشی رمز: تغییر پسورد
// ================================================================
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return next(new AppError("پسوردها یکسان نیستند", 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError("پسورد حداقل ۸ کاراکتر", 400));
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordOtpAttempts",
    );

    if (!user || !user.resetPasswordOtp) {
      return next(new AppError("درخواست نامعتبر", 400));
    }
    if (user.resetPasswordOtpExpires < new Date()) {
      return next(new AppError("کد منقضی شده", 400));
    }
    if (
      user.resetPasswordOtpAttempts >= parseInt(process.env.OTP_MAX_ATTEMPTS)
    ) {
      return next(new AppError("تعداد تلاش بیش از حد", 429));
    }

    const isValid = await verifyOtp(code, user.resetPasswordOtp);
    if (!isValid) {
      user.resetPasswordOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("کد اشتباه است", 400));
    }

    // پسورد جدید
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    // توکن جدید (اختیاری)
    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.json({ status: "success", message: "پسورد با موفقیت تغییر کرد" });
  } catch (err) {
    next(err);
  }
};
