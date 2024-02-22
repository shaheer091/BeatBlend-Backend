const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// eslint-disable-next-line require-jsdoc
const sendOtp = async function(email, otp) {
  console.log(email, otp);
  const mailOption = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP for email Verification',
    text: `your otp for ${email} is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOption);
    console.log('mailsended');
  } catch (err) {
    console.log(err);
  }
};

const requestApproval = async function(email) {
  console.log(email);
  const mailOption = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Artist Approval Notification',
    // eslint-disable-next-line max-len
    text: 'Dear User,\n\nYour request to become an artist has been received and is currently under review by the admin. Please wait patiently for further updates.\n\nBest regards,\nThe Admin Team',
  };
  try {
    await transporter.sendMail(mailOption);
    console.log('approval mail send');
  } catch (err) {
    console.log(err);
  }
};

const approveUser = async function(email) {
  try {
    console.log(email);
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Artist Request Has Been Approved',
      // eslint-disable-next-line max-len
      text: 'Dear user,\n\nYour request to become an artist has been approved by the admin. Congratulations! You can now access artist features on our platform.\n\nBest regards,\nThe Admin Team',
    };
    await transporter.sendMail(mailOption);
    console.log('approval mail send');
  } catch (err) {
    console.log(err);
  }
};

const declineUser = async function(email) {
  try {
    console.log(email);
    const mailOption ={
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Artist Request Has Been Declined',
      // eslint-disable-next-line max-len
      text: 'Dear user,\n\nYour request to become an artist has been declined by the admin. Sorry... Better luck next time.\n\nBest regards,\nThe Admin Team',
    };
    await transporter.sendMail(mailOption);
    console.log('decline mail send');
  } catch (err) {
    console.log(err);
  }
};


module.exports = {
  sendOtp,
  approveUser,
  requestApproval,
  declineUser,
};
