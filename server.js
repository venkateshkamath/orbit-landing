import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aayqbazqqfyetkwhhwnt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheXFiYXpxcWZ5ZXRrd2hod250Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4ODIwMywiZXhwIjoyMDg4MDY0MjAzfQ.8q4s4Cf05FkK8X_4pDftFOtMAzG6ZYIRZIdLd1kSG9A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());

const toTitleCase = (str) =>
  str.trim().replace(/\s+/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// ─── Build welcome email HTML ────────────────────────────────
const buildWelcomeEmail = (email) => {
  const username = email.split('@')[0];
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d14; border: 1px solid #1a1a24;">
    <div style="padding: 40px 40px 20px; text-align: center;">
      <div style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 30px;">
        <span style="background: linear-gradient(135deg, #FF6B6B 0%, #C4B5FD 50%, #5EEAD4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #C4B5FD;">ORBIT</span>
      </div>
      <h1 style="font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px;">Welcome, ${username}</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">You're on the list! We'll notify you as soon as we launch.</p>
    </div>
  </div>
</body>
</html>`;
};

// ─── Send welcome email (reusable) ────────────────────────────
const sendWelcomeEmail = async (email) => {
  // Hardcoded fallbacks as requested
  const HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const USER = process.env.SMTP_USER || 'hello@joinorbit.org';
  const PASS = process.env.SMTP_PASS || 'orbitAdmin3326*';
  const PORT_VAL = parseInt(process.env.SMTP_PORT || '465');

  try {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT_VAL,
      secure: PORT_VAL === 465,
      auth: { user: USER, pass: PASS },
      tls: { rejectUnauthorized: false } // Essential for Render
    });

    const info = await transporter.sendMail({
      from: `"ORBIT" <${USER}>`,
      to: email.toLowerCase(),
      subject: "Welcome to the ORBIT Waitlist! 🚀",
      html: buildWelcomeEmail(email),
    });

    console.log(`📧 Welcome email sent to ${email}`);
    return info;
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    throw error;
  }
};

app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, city, age } = req.body;
    if (!email || !city || !age) return res.status(400).json({ error: 'All fields are required.' });

    const lowerEmail = email.toLowerCase();
    const normalizedCity = toTitleCase(city);

    const [insertResult, countResult] = await Promise.all([
      supabase.from('waitlist').insert([{ email: lowerEmail, city: normalizedCity, age }]).select(),
      supabase.from('waitlist').select('*', { count: 'exact', head: true })
    ]);

    if (insertResult.error) {
      if (insertResult.error.code === '23505') return res.status(409).json({ error: 'Email already on list!' });
      return res.status(500).json({ error: `Save failed: ${insertResult.error.message}` });
    }

    // Try to send email but don't block response
    sendWelcomeEmail(lowerEmail).catch(err => {
      console.warn('⚠️ Email send failed background:', err.message);
    });

    res.json({ success: true, total: countResult.count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'alive' }));

if (!process.env.VERCEL) {
  app.get('{*path}', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  app.listen(PORT, () => console.log(`🚀 ORBIT active on ${PORT}`));
}

// Admin Logic
app.post('/api/admin/email-export', async (req, res) => {
  try {
    const { data: allData } = await supabase.from('waitlist').select('*');
    const csvContent = "Email,City,Age,Joined Date\n" + allData.map(s => 
      `${s.email},"${(s.city || '').replace(/"/g, '""')}",${s.age || ''},${new Date(s.created_at).toLocaleString()}`
    ).join('\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER || 'hello@joinorbit.org', pass: process.env.SMTP_PASS || 'orbitAdmin3326*' },
      tls: { rejectUnauthorized: false }
    });

    const targetEmail = process.env.EXPORT_EMAIL || 'irenik.tech@gmail.com';
    await transporter.sendMail({
      from: `"Orbit Admin" <hello@joinorbit.org>`,
      to: targetEmail,
      subject: "Orbit Data Export",
      attachments: [{ filename: 'orbit_waitlist.csv', content: csvContent }]
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
