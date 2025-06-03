import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import nodemailer from 'nodemailer';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

// interface ApiResponse {
//   message?: string;
//   error?: string;
// }

const dbPromise = open({
  filename: './waitlist.db',
  driver: sqlite3.Database,
});

async function initDb() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

initDb().catch(console.error);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'olurichardisaac@gmail.com',
    pass: process.env.SMTP_PASS || 'cvkxboockxbdcjgz',
  },
});

const sendConfirmationEmail = async (email: string) => {
  const mailOptions = {
    from: '"Trovia.ng" <no-reply@trovia.ng>',
    to: email,
    subject: 'Welcome to Trovia.ng Waitlist – Let’s Get Started! 😄',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #1a3c34; font-size: 24px; margin: 0; }
          .content { color: #333333; line-height: 1.5; font-size: 16px; }
          .content p { margin: 0 0 15px; }
          .highlight { color: #1a3c34; font-weight: bold; }
          .button { display: inline-block; background-color: #1a3c34; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 500; margin: 5px; }
          .button:hover { background-color: #2e5b52; }
          .fun-section { background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top:  “

20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Trovia.ng! 🎉</h1>
          </div>
          <div class="content">
            <p>Guess what? I’m as happy as you are right now maybe even happier, because you’ve just joined the Trovia.ng waitlist! We’re both doing a little happy dance 🕺💃.</p>
            <p>At Trovia.ng, we’re building a <span class="highlight">hyper local job platform</span> to connect Nigerian communities. Need a plumber in your area? Want to hire a local artisan? Or maybe you’re an artisan looking for gigs? We’ve got you covered! You can post jobs, and artisans can find work easy peasy.</p>
            <p>But wait, there’s more! Our <span class="highlight">marketplace</span> lets you buy and sell seamlessly, without any stress or hassle. Need a new hammer for your DIY project? Or want to sell that extra chair? We make it happen, no wahala!</p>
            <div class="fun-section">
              <p><strong>Quick question:</strong> What’s the first thing you’d love to do on Trovia.ng?</p>
              <p>Reply to this email and let us know! We’re all ears 👂.</p>
            </div>
            <p>We’ll keep you in the loop with our launch updates and early access details, so you can start connecting with your community soon. Stay tuned for the big reveal!</p>
          </div>
          <div class="footer">
            <p>🔒 Your information is secure and will never be shared.</p>
            <p>© 2025 Trovia.ng. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received body:', body);
    const { email } = schema.parse(body);
    console.log('Parsed email:', email);
    const db = await dbPromise;
    console.log('Database connected');

    const existing = await db.get('SELECT email FROM subscribers WHERE email = ?', [email]);
    if (existing) {
      console.log('Email already exists:', email);
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
    }

    await db.run('INSERT INTO subscribers (email) VALUES (?)', [email]);
    console.log('Email inserted:', email);

    await sendConfirmationEmail(email);
    console.log('Confirmation email sent to:', email);

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}