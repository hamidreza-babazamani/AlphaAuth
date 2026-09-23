module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "خطای سرور";

  // خطای duplicate key در MongoDB (کد 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    err.statusCode = 409;
    err.message = `این ${field} قبلاً ثبت شده`;
  }

  // خطای Validation مونگوس
  if (err.name === "ValidationError") {
    err.statusCode = 400;
    err.message = Object.values(err.errors)
      .map((e) => e.message)
      .join("، ");
  }

  // خطای CastError (مثلاً ObjectId نامعتبر)
  if (err.name === "CastError") {
    err.statusCode = 400;
    err.message = "شناسه نامعتبر";
  }

  res.status(err.statusCode).json({
    status: err.statusCode >= 500 ? "error" : "fail",
    message: err.message,
    // فقط در حالت توسعه stack trace نشون بده
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
