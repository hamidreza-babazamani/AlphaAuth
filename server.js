require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const { generalLimiter } = require("./src/middleware/rateLimiter");

const app = express();

// اتصال دیتابیس
connectDB();

// --- میدل‌ورهای عمومی ---
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use("/api", generalLimiter);

// ================================================================
// 🌐 آدرس‌های تمیز
// ================================================================
const publicDir = path.join(__dirname, "public");

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(publicDir, "dashboard.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

// 🔀 Redirect از آدرس‌های قدیمی (.html) به تمیز
app.get("/index.html", (req, res) => res.redirect(301, "/"));
app.get("/dashboard.html", (req, res) => res.redirect(301, "/dashboard"));
app.get("/admin.html", (req, res) => res.redirect(301, "/admin"));

// --- فایل‌های استاتیک (CSS، JS، تصاویر، favicon) ---
app.use(express.static(publicDir));

// --- روت‌های API ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `روت ${req.originalUrl} یافت نشد`,
  });
});

// --- مدیریت خطا ---
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AlphaAuth running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
