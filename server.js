import dotenv from 'dotenv';
dotenv.config();

// 🛡️ CRITICAL: Force Node.js to prefer IPv4 for ALL DNS lookups.
// This fixes the ENETUNREACH IPv6 error on Render/cloud environments.
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

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

// ─── Nodemailer Transporter (Brevo SMTP Relay) ──────────────
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Brevo uses STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
  });
};

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
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d14; border: 1px solid #1a1a24; border-radius: 12px; overflow: hidden; margin-top: 40px;">
    <div style="padding: 40px 40px 20px; text-align: center;">
      <div style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 30px;">
        <span style="background: linear-gradient(135deg, #FF6B6B 0%, #C4B5FD 50%, #5EEAD4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #C4B5FD;">ORBIT</span>
      </div>
      <div style="margin: 20px 0 40px;">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style="margin: 0 auto;">
          <circle cx="60" cy="60" r="58" stroke="#1a1a24" stroke-width="1"/>
          <circle cx="60" cy="60" r="40" stroke="#1a1a24" stroke-width="1"/>
          <circle cx="60" cy="60" r="22" stroke="#1a1a24" stroke-width="1"/>
          <circle cx="60" cy="60" r="4" fill="#C4B5FD" opacity="0.8"/>
          <path d="M60 2 L60 118" stroke="#1a1a24" stroke-width="0.5"/>
          <path d="M2 60 L118 60" stroke="#1a1a24" stroke-width="0.5"/>
        </svg>
      </div>
      <h1 style="font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">You're in Orbit, ${username}</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 auto; max-width: 460px;">
        Welcome to the next generation of social proximity. We're building a world where connection is measured by distance, not just data.
      </p>
    </div>
    <div style="padding: 0 40px 40px;">
      <div style="background: linear-gradient(180deg, #16161f 0%, #0d0d14 100%); border: 1px solid #1a1a24; border-radius: 12px; padding: 32px; text-align: center;">
        <div style="display: inline-block; padding: 6px 12px; border-radius: 20px; background-color: rgba(94, 234, 212, 0.1); color: #5EEAD4; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">
          Early Access Secured
        </div>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          We'll notify you as soon as we launch in your city. Get ready to experience what's happening right around you, in real-time.
        </p>
        <a href="https://joinorbit.org" style="display: inline-block; background: linear-gradient(135deg, #FF6B6B 0%, #C4B5FD 100%); color: #ffffff; padding: 14px 28px; border-radius: 8px; font-family: 'Outfit', sans-serif; font-weight: 600; text-decoration: none; font-size: 15px; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);">
          Explore the Vision
        </a>
      </div>
    </div>
    <div style="padding: 30px 40px; border-top: 1px solid #1a1a24; text-align: center;">
      <p style="color: #64748b; font-size: 13px; margin: 0;">&copy; 2026 ORBIT Proximity Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

// ─── Send welcome email ─────────────────────────────────────
const sendWelcomeEmail = async (email) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP not configured. Skipping email.');
    return null;
  }

  try {
    const transporter = createEmailTransporter();
    const info = await transporter.sendMail({
      from: `"ORBIT" <${process.env.SMTP_USER || 'hello@joinorbit.org'}>`,
      to: email.toLowerCase(),
      subject: "Welcome to the ORBIT Waitlist! 🚀",
      html: buildWelcomeEmail(email),
    });

    console.log(`📧 Email sent to ${email} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw error;
  }
};

// ─── POST /api/admin/login ──────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'orbitAdmin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'orbitAdmin3326';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: 'orbit_secure_session_token_' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// ─── POST /api/waitlist ─────────────────────────────────────
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, city, age } = req.body;
    if (!email || !city || !age) return res.status(400).json({ error: 'All fields are required.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });

    const lowerEmail = email.toLowerCase();
    const normalizedCity = toTitleCase(city);

    const [insertResult, countResult] = await Promise.all([
      supabase.from('waitlist').insert([{ email: lowerEmail, city: normalizedCity, age }]).select(),
      supabase.from('waitlist').select('*', { count: 'exact', head: true })
    ]);

    if (insertResult.error) {
      if (insertResult.error.code === '23505') return res.status(409).json({ error: 'This email is already on the waitlist!' });
      return res.status(500).json({ error: `Failed to save: ${insertResult.error.message}` });
    }

    // Send email in background
    sendWelcomeEmail(lowerEmail).catch(err => {
      console.warn('⚠️ User saved, email failed:', err.message);
    });

    res.json({ success: true, message: "You're on the list!", total: countResult.count || 0 });
  } catch (err) {
    console.error('❌ Waitlist error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── GET /api/test-email — send test email without DB insert ─
app.get('/api/test-email', async (req, res) => {
  try {
    const testEmail = 'venkykamath2000@gmail.com';
    await sendWelcomeEmail(testEmail);
    res.json({ success: true, message: `Test email sent to ${testEmail}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/waitlist/stats ────────────────────────────────
app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const { data: allData, error: dbError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    const totalSignups = allData.length;
    const now = Date.now();
    const last24h = allData.filter(r => (now - new Date(r.created_at).getTime()) < 24 * 60 * 60 * 1000).length;

    const cityStats = Object.entries(
      allData.reduce((acc, row) => {
        const c = toTitleCase(row.city || 'Unknown');
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {})
    ).map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const growthData = Object.entries(
      allData.reduce((acc, row) => {
        const isoDate = new Date(row.created_at).toISOString().split('T')[0];
        acc[isoDate] = (acc[isoDate] || 0) + 1;
        return acc;
      }, {})
    ).sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([isoDate, count]) => ({
        date: new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      }));

    res.json({
      totalSignups,
      last24h,
      cityStats,
      growthData,
      recentSignups: allData.slice(0, 50).map(r => ({
        email: r.email,
        city: toTitleCase(r.city || 'Unknown'),
        time: new Date(r.created_at).toLocaleString()
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─── GET /api/cities ────────────────────────────────────────
app.get('/api/cities', async (req, res) => {
  try {
    const { data, error } = await supabase.from('waitlist').select('city');
    if (error) throw error;
    const unique = [...new Set(data.map(r => toTitleCase(r.city || '')))].sort();
    res.json({ cities: unique });
  } catch (err) {
    res.json({ cities: [] });
  }
});

// ─── GET /api/health ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

// ─── SPA fallback + listen ──────────────────────────────────
if (!process.env.VERCEL) {
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`🚀 ORBIT running on port ${PORT}`);
  });
}

// ─── POST /api/admin/email-export ───────────────────────────
app.post('/api/admin/email-export', async (req, res) => {
  try {
    const { data: allData, error: dbError } = await supabase.from('waitlist').select('*');
    if (dbError) throw dbError;

    const csvContent = "Email,City,Age,Joined Date\n" + allData.map(s =>
      `${s.email},"${(s.city || '').replace(/"/g, '""')}",${s.age || ''},${new Date(s.created_at).toLocaleString()}`
    ).join('\n');

    const transporter = createEmailTransporter();
    const targetEmail = process.env.EXPORT_EMAIL || 'irenik.tech@gmail.com';

    await transporter.sendMail({
      from: `"Orbit Waitlist" <${process.env.SMTP_USER || 'hello@joinorbit.org'}>`,
      to: targetEmail,
      subject: `Orbit Export ${new Date().toISOString().split('T')[0]}`,
      text: 'Attached is the data export.',
      attachments: [{ filename: 'orbit_waitlist.csv', content: csvContent }]
    });

    res.json({ success: true, message: 'Export sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Cron Job (every 6 hours) ───────────────────────────────
cron.schedule('0 */6 * * *', async () => {
  try {
    const { data: allData } = await supabase.from('waitlist').select('*');
    if (!allData || allData.length === 0) return;

    const csvContent = "Email,City,Age,Joined Date\n" + allData.map(s =>
      `${s.email},"${(s.city || '').replace(/"/g, '""')}",${s.age || ''},${new Date(s.created_at).toLocaleString()}`
    ).join('\n');

    const transporter = createEmailTransporter();
    const targetEmail = process.env.EXPORT_EMAIL;
    if (!targetEmail) return;

    await transporter.sendMail({
      from: `"Orbit Waitlist" <${process.env.SMTP_USER || 'hello@joinorbit.org'}>`,
      to: targetEmail,
      subject: 'Scheduled Orbit Export',
      text: 'Scheduled export attached.',
      attachments: [{ filename: 'scheduled_export.csv', content: csvContent }]
    });

    console.log('✅ Scheduled export sent.');
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});

export default app;
