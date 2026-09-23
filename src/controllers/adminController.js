const User = require("../models/User");
const AppError = require("../utils/AppError");

// ================================================================
// 1. getStats — آمار کلی سیستم
// ================================================================
exports.getStats = async (req, res, next) => {
  try {
    // اجرای همه queryها با Promise.all (موازی، سریع‌تر)
    const [
      totalUsers,
      verifiedEmails,
      verifiedPhones,
      totalAdmins,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isPhoneVerified: true }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      status: "success",
      data: {
        stats: {
          totalUsers,
          verifiedEmails,
          verifiedPhones,
          totalAdmins,
          recentUsers, // کاربران ۷ روز اخیر
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 2. getAllUsers — لیست همه کاربران (صفحه‌بندی + سرچ + فیلتر)
// ================================================================
exports.getAllUsers = async (req, res, next) => {
  try {
    // ۱. پارامترهای query از URL
    const page = parseInt(req.query.page) || 1; // صفحه فعلی
    const limit = parseInt(req.query.limit) || 10; // تعداد در هر صفحه
    const skip = (page - 1) * limit; // چند تا رو skip کن

    const search = req.query.search || ""; // سرچ روی ایمیل
    const role = req.query.role || ""; // فیلتر نقش

    // ۲. ساخت query شرط‌ها
    const filter = {};

    // سرچ روی ایمیل (case-insensitive)
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    // فیلتر نقش
    if (role && ["user", "admin"].includes(role)) {
      filter.role = role;
    }

    // ۳. گرفتن کاربران + تعداد کل
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 }) // جدیدترین اول
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    // ۴. محاسبه‌ی اطلاعات صفحه‌بندی
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 3. getUser — جزئیات یه کاربر خاص
// ================================================================
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("کاربر یافت نشد", 404));
    }

    res.json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 4. updateUserRole — تغییر نقش کاربر
// ================================================================
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // ۱. اعتبارسنجی ورودی
    if (!role || !["user", "admin"].includes(role)) {
      return next(new AppError("نقش نامعتبر است", 400));
    }

    // ۲. پیدا کردن کاربر هدف
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("کاربر یافت نشد", 404));
    }

    // ۳. جلوگیری از تغییر نقش خودت
    if (user._id.equals(req.user._id)) {
      return next(new AppError("نمی‌توانی نقش خودت را تغییر دهی", 400));
    }

    // ۴. جلوگیری از حذف آخرین ادمین
    //    اگه می‌خوایم یه ادمین رو user کنیم، اول چک کن ادمین دیگه‌ای هست
    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return next(
          new AppError("نمی‌توانی آخرین ادمین را به کاربر عادی تغییر دهی", 400),
        );
      }
    }

    // ۵. تغییر نقش
    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.json({
      status: "success",
      message: `نقش کاربر به "${role === "admin" ? "ادمین" : "کاربر عادی"}" تغییر کرد`,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ================================================================
// 5. deleteUser — حذف کاربر
// ================================================================
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // ۱. پیدا کردن کاربر
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("کاربر یافت نشد", 404));
    }

    // ۲. جلوگیری از حذف خودت
    if (user._id.equals(req.user._id)) {
      return next(new AppError("نمی‌توانی حساب خودت را حذف کنی", 400));
    }

    // ۳. جلوگیری از حذف آخرین ادمین
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return next(new AppError("نمی‌توانی آخرین ادمین را حذف کنی", 400));
      }
    }

    // ۴. حذف
    await user.deleteOne();

    res.json({
      status: "success",
      message: "کاربر با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};
