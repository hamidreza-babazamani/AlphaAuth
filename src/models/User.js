const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // --- اطلاعات اصلی ---
    email: {
      type: String,
      required: [true, "ایمیل الزامی است"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "ایمیل نامعتبر"],
    },
    password: {
      type: String,
      required: [true, "پسورد الزامی است"],
      minlength: [8, "پسورد حداقل ۸ کاراکتر"],
      select: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ✅ جدید: نقش کاربر
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // --- وضعیت تأیید ---
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    // --- OTP ایمیل ---
    emailOtp: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },
    emailOtpAttempts: { type: Number, default: 0, select: false },

    // --- OTP شماره ---
    phoneOtp: { type: String, select: false },
    phoneOtpExpires: { type: Date, select: false },
    phoneOtpAttempts: { type: Number, default: 0, select: false },

    // --- OTP بازیابی پسورد ---
    resetPasswordOtp: { type: String, select: false },
    resetPasswordOtpExpires: { type: Date, select: false },
    resetPasswordOtpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);

// جلوگیری از برگشت پسورد و OTP در پاسخ JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailOtp;
  delete obj.phoneOtp;
  delete obj.resetPasswordOtp;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
