const nodemailer=require('nodemailer');

const transporter=nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// eslint-disable-next-line require-jsdoc
const sendOtp=async function(email, otp) {
  console.log(email);
  const mailOption={
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP for email Verification',
    text: `your otp is ${otp}`,
  };

  await transporter.sendMail(mailOption).then(()=>{
    console.log('mailsended');
  });
};

module.exports=sendOtp;
