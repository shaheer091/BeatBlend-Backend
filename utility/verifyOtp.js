// require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// eslint-disable-next-line require-jsdoc
async function verityOtp(phone, otp) {
  try {
    const verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({to: `+91${phone}`, code: `${otp}`});
    return verificationCheck.status;
  } catch (error) {
    res.json({message: error.message || 'Unexpected Error'});
    throw error;
  }
}

module.exports = verityOtp;
