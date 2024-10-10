const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendConfirmationEmail(email, confirmationLink) {
  const message = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Confirmation',
    html: `
      <p>Please click the link below to confirm your email:</p>
      <a href="${confirmationLink}">Confirm Email</a>
    `,
  };

  await transporter.sendMail(message);
}

async function sendResetEmail(email, resetLink) {
  const message = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `
      <p>Please click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `,
  };

  await transporter.sendMail(message);
}

module.exports = {
  sendConfirmationEmail,
  sendResetEmail,
};
