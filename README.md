<div align="center">

# 🔐 AlphaAuth

**سیستم احراز هویت مدرن و امن با Node.js، Express 5 و MongoDB**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

سیستم احراز هویت کامل با تأیید ایمیل، تأیید شماره تلفن، بازیابی رمز و پنل ادمین

</div>

---

## ✨ ویژگی‌ها

### 🔐 احراز هویت

- ثبت‌نام و ورود با ایمیل و پسورد
- **JWT** در کوکی **httpOnly** (ضد XSS)
- `sameSite: strict` (ضد CSRF)
- هش پسورد با **bcrypt** + salt
- خروج امن

### 📧 تأیید ایمیل

- کد **OTP** شش رقمی
- هش شده در دیتابیس
- انقضا ۱۰ دقیقه‌ای
- محدودیت ۵ تلاش

### 📱 تأیید شماره تلفن

- ارسال SMS با **Kavenegar**
- اعتبارسنجی شماره ایرانی
- جلوگیری از شماره‌های تکراری

### 🔑 بازیابی رمز عبور

- OTP از طریق ایمیل
- تغییر پسورد امن
- جلوگیری از User Enumeration

### 🎭 نقش‌ها و پنل ادمین

- نقش‌های `user` و `admin`
- پنل ادمین کامل:
  - 📊 آمار کلی سیستم
  - 👥 مدیریت کاربران
  - 🔍 سرچ و فیلتر
  - 📄 صفحه‌بندی
  - 👑 تغییر نقش
  - 🗑️ حذف کاربر
  - 🛡️ محافظت چندلایه

### 🛡️ امنیت

- **Rate Limiting** (عمومی + OTP)
- محافظت از **Brute Force**
- محافظت از **User Enumeration**
- کلید **JWT** جداگانه
- مدیریت خطای مرکزی
- **HTTPS-only** در production

### 🎨 رابط کاربری

- **Glassmorphism** با پس‌زمینه سرمه‌ای
- طراحی **Responsive**
- Modalهای زیبا
- انیمیشن‌های نرم
- پشتیبانی کامل **RTL**

---

## 🛠️ تکنولوژی‌ها

| بخش            | تکنولوژی                     |
| -------------- | ---------------------------- |
| **Backend**    | Node.js, Express 5           |
| **Database**   | MongoDB, Mongoose            |
| **Auth**       | JWT, bcryptjs                |
| **Email**      | Nodemailer (Ethereal در dev) |
| **SMS**        | Kavenegar                    |
| **Validation** | express-validator            |
| **Security**   | express-rate-limit, Helmet   |
| **Frontend**   | HTML5, CSS3, Vanilla JS      |

---

## 📸 اسکرین‌شات‌ها

### صفحه ورود و ثبت‌نام

![Login Page](docs/screenshots/login.png)

### داشبورد کاربر

![Dashboard](docs/screenshots/dashboard.png)

### پنل ادمین

![Admin Panel](docs/screenshots/admin.png)

> 💡 برای اضافه کردن اسکرین‌شات، پوشه `docs/screenshots/` بساز و عکس‌ها رو با همین اسم‌ها بذار.

---

## 🚀 نصب و اجرا

### پیش‌نیازها

- **Node.js** نسخه ۱۸ یا بالاتر → [دانلود](https://nodejs.org)
- **MongoDB** (لوکال یا [Atlas](https://www.mongodb.com/cloud/atlas))

### ۱. کلون پروژه

```bash
git clone https://github.com/YOUR_USERNAME/AlphaAuth.git
cd AlphaAuth
```
