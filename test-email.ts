import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'olurichardisaac@gmail.com',
    pass: 'cvkxboockxbdcjgz',
  },
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"Trovia Team" <olurichardisaac@gmail.com>',
      to: 'test@example.com', // Replace with a valid email address for testing
      subject: 'Test Email',
      text: 'This is a test email from Trovia.',
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

testEmail();