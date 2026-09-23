const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 همه روت‌های این فایل نیاز به احراز هویت + نقش admin دارن
router.use(protect);
router.use(restrictTo("admin"));

// ================================================================
// آمار
// ================================================================
router.get("/stats", adminController.getStats);

// ================================================================
// مدیریت کاربران
// ================================================================
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUser);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
