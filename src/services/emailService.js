const nodemailer = require("nodemailer");

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // --- حالت تست: Ethereal ---
  if (
    process.env.NODE_ENV === "development" &&
    process.env.USE_ETHEREAL === "true"
  ) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("📧 Ethereal account:", testAccount.user);
    return transporter;
  }

  // --- حالت واقعی: Gmail یا SMTP دلخواه ---
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function sendOtpEmail(to, code, purpose = "verify") {
  const t = await getTransporter();

  const subjects = {
    verify: "تأیید ایمیل",
    reset: "بازیابی رمز عبور",
  };

  const html = `
    <div style="font-family: Tahoma, sans-serif; direction: rtl; max-width: 500px; margin: auto; padding: 24px; background: #0a1128; color: #fff; border-radius: 16px;">
      <h1 style="color: #6ea8ff; letter-spacing: 2px; margin-bottom: 4px; font-size: 22px; text-align: center;">AlphaAuth</h1>
      <p style="color: #64748b; font-size: 12px; margin-bottom: 20px; text-align: center;">سیستم احراز هویت مدرن</p>

      <h2 style="color: #a8c9ff; font-size: 18px;">${subjects[purpose]}</h2>
      <p>کد یکبارمصرف شما:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: rgba(255,255,255,0.1); padding: 16px; text-align: center; border-radius: 12px; color: #a8c9ff; direction: ltr;">
        ${code}
      </div>
      <p style="color: #8ba3c7; font-size: 12px; margin-top: 16px;">
        این کد تا ${process.env.OTP_EXPIRES_MIN} دقیقه معتبر است. اگر شما این درخواست را نداده‌اید، نادیده بگیرید.
      </p>

      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0 12px;">
      <p style="color: #475569; font-size: 11px; text-align: center; margin: 0;">
        © AlphaAuth — همه حقوق محفوظ است
      </p>
    </div>
  `;

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || "AlphaAuth <no-reply@alphaauth.local>",
    to,
    subject: `${subjects[purpose]} - AlphaAuth`,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log("📧 پیش‌نمایش ایمیل:", preview);

  return info;
}

module.exports = { sendOtpEmail };
