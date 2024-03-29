/* eslint-disable max-len */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendOtp = async function(email, otp) {
  const mailOption = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP for email Verification',
    text: `your otp for ${email} is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

const requestApproval = async function(email) {
  const mailOption = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Artist Approval Notification',
    // eslint-disable-next-line max-len
    text: 'Dear User,\n\nYour request to become an artist has been received and is currently under review by the admin. Please wait patiently for further updates.\n\nBest regards,\nThe Admin Team',
  };
  try {
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

const approveUser = async function(email) {
  try {
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Artist Request Has Been Approved',
      // eslint-disable-next-line max-len
      text: 'Dear user,\n\nYour request to become an artist has been approved by the admin. Congratulations! You can now access artist features on our platform.\n\nBest regards,\nThe Admin Team',
    };
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

const declineUser = async function(email) {
  try {
    const mailOption ={
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Artist Request Has Been Declined',
      // eslint-disable-next-line max-len
      text: 'Dear user,\n\nYour request to become an artist has been declined by the admin. Sorry... Better luck next time.\n\nBest regards,\nThe Admin Team',
    };
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

const requestBandJoin = async function(email) {
  try {
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Invitation to Join Band',
      html: `<p>Dear artist,</p><p>You have been invited to join a band by the band admin. Please follow the <a href="http://localhost:4200/artist/notification">link</a> provided to accept the invitation and join the band.</p><p>Best regards,<br>The Band Team</p>`,
    };
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

const acceptedBandInvitaion = async function(email) {
  try {
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Invitation to Join Band',
      html: `<p>Dear artist,</p><p>The artist you are requested to join the band has accepted your request.</p><p>Best regards<br></p>`,
    };
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

const declinedBandInvitaion = async function(email) {
  try {
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Invitation to Join Band',
      html: `<p>Dear artist,</p><p>The artist you are requested to join the band has declined your request.</p><p>Best regards<br></p>`,
    };
    await transporter.sendMail(mailOption);
  } catch (err) {
    res.json({message: err.message || 'Error in sending OTP'});
  }
};

module.exports = {
  sendOtp,
  approveUser,
  requestApproval,
  declineUser,
  requestBandJoin,
  acceptedBandInvitaion,
  declinedBandInvitaion,
};
