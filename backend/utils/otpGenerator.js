// utils/otpGenerator.js
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

const setOTP = (user) => {
  const otp = generateOTP();
  user.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  return otp;
};

module.exports = { generateOTP, setOTP };