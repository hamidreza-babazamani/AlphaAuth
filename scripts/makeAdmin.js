require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function makeAdmin(email) {
  if (!email) {
    console.error("❌ لطفاً ایمیل رو وارد کن:");
    console.error("   node scripts/makeAdmin.js your@email.com");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ متصل به MongoDB");

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ کاربری با ایمیل "${email}" پیدا نشد`);
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`ℹ️  کاربر "${email}" از قبل ادمین بود`);
      await mongoose.disconnect();
      process.exit(0);
    }

    user.role = "admin";
    await user.save({ validateBeforeSave: false });

    console.log(`✅ کاربر "${email}" با موفقیت ادمین شد 👑`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ خطا:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

const email = process.argv[2];
makeAdmin(email);
