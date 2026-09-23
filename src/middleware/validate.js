const { body, validationResult } = require("express-validator");

// میدل‌ور چک کردن نتایج
const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// قوانین ثبت‌نام
const signupRules = [
  body("email").isEmail().withMessage("ایمیل نامعتبر").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("پسورد حداقل ۸ کاراکتر")
    .matches(/\d/)
    .withMessage("پسورد باید شامل عدد باشد"),
  body("confirmPassword").notEmpty().withMessage("تکرار پسورد الزامی"),
  handleErrors,
];

// قوانین ورود
const loginRules = [
  body("email").isEmail().withMessage("ایمیل نامعتبر"),
  body("password").notEmpty().withMessage("پسورد الزامی"),
  handleErrors,
];

module.exports = { signupRules, loginRules };
