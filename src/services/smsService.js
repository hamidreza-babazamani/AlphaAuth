const Kavenegar = require("kavenegar");

let api;
function getApi() {
  if (!api) {
    api = Kavenegar.KavenegarApi({ apikey: process.env.KAVENEGAR_API_KEY });
  }
  return api;
}

async function sendOtpSms(phone, code) {
  // در حالت توسعه، فقط لاگ کن
  if (
    process.env.NODE_ENV === "development" &&
    process.env.USE_ETHEREAL === "true"
  ) {
    console.log(`📱 [DEV] AlphaAuth OTP for ${phone}: ${code}`);
    return { dev: true };
  }

  const smsApi = getApi();

  return new Promise((resolve, reject) => {
    smsApi.Send(
      {
        message: `AlphaAuth\nکد تأیید شما: ${code}`,
        sender: process.env.KAVENEGAR_SENDER,
        receptor: phone,
      },
      (response) => resolve(response),
      (error) => reject(error),
    );
  });
}

module.exports = { sendOtpSms };
