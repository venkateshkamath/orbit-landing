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

// ─── Brevo HTTP API (replaces SMTP — no port issues) ────────
const sendBrevoEmail = async ({ from, fromName, to, subject, html, text, attachments }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ BREVO_API_KEY not set. Skipping email.');
    return null;
  }

  const body = {
    sender: { name: fromName || 'ORBIT', email: from || 'hello@joinorbit.org' },
    to: [{ email: to }],
    subject,
  };
  if (html) body.htmlContent = html;
  if (text) body.textContent = text;
  if (attachments) body.attachment = attachments;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Brevo API error: ${data.message || JSON.stringify(data)}`);
  }
  return data;
};

// ─── Build welcome email HTML ────────────────────────────────
const buildWelcomeEmail = (email) => {
  const username = email.split('@')[0];
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #030303; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #09090b; border: 1px solid #1a1a24; border-radius: 12px; overflow: hidden; margin-top: 40px;">
    
    <!-- Header -->
    <div style="padding: 50px 40px; text-align: center; border-bottom: 1px solid #1a1a24;">
      <div style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 0.3em; margin-bottom: 15px; margin-left: 0.3em;">
        ORBIT
      </div>
      <div style="height: 2px; width: 40px; background: linear-gradient(90deg, #FF6B6B, #C4B5FD, #5EEAD4); margin: 0 auto 15px;"></div>
      <div style="font-size: 10px; font-weight: 600; color: #64748b; letter-spacing: 0.3em; text-transform: uppercase;">
        Connect Offline &middot; Live More
      </div>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px;">
      <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 25px;">You're in the Orbit 🎉</h1>
      
      <p style="font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0 0 20px;">Hey ${username}</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 30px;">
        Welcome to the inner circle. We're building a world where real-world proximity sparks genuine human connection. You're among the first to witness the shift from screens to scenes.
      </p>
      
      <div style="margin-bottom: 35px;">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #5EEAD4; margin-right: 12px; margin-bottom: 2px;"></span>
          <span style="font-size: 14px; color: #cbd5e1;">Priority access to local proximity events.</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #C4B5FD; margin-right: 12px; margin-bottom: 2px;"></span>
          <span style="font-size: 14px; color: #cbd5e1;">Instant discovery of like-minded communities nearby.</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #FF6B6B; margin-right: 12px; margin-bottom: 2px;"></span>
          <span style="font-size: 14px; color: #cbd5e1;">The chance to reclaim shared physical space.</span>
        </div>
      </div>
      
      <div style="border-left: 2px solid #1a1a24; padding-left: 15px; margin-bottom: 20px;">
        <p style="font-size: 14px; font-style: italic; color: #64748b; margin: 0;">
          "The best connections never happened behind a keyboard."
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ─── Send welcome email ─────────────────────────────────────
const sendWelcomeEmail = async (email) => {
  try {
    const result = await sendBrevoEmail({
      to: email.toLowerCase(),
      subject: "Welcome to the ORBIT Waitlist! 🚀",
      html: buildWelcomeEmail(email),
    });
    console.log(`📧 Email sent to ${email} (ID: ${result?.messageId || 'ok'})`);
    return result;
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
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const testEmail = 'venkykamath2000@gmail.com';
    const result = await sendWelcomeEmail(testEmail);
    console.log('🧪 Test result:', JSON.stringify(result));
    res.json({ success: true, brevoResponse: result, time: new Date().toISOString() });
  } catch (err) {
    console.error('🧪 Test error:', err.message);
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

    const targetEmail = process.env.EXPORT_EMAIL || 'irenik.tech@gmail.com';

    await sendBrevoEmail({
      fromName: 'Orbit Waitlist',
      to: targetEmail,
      subject: `Orbit Export ${new Date().toISOString().split('T')[0]}`,
      text: 'Attached is the data export.',
      attachments: [{ name: 'orbit_waitlist.csv', content: Buffer.from(csvContent).toString('base64') }]
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

    const targetEmail = process.env.EXPORT_EMAIL;
    if (!targetEmail) return;

    await sendBrevoEmail({
      fromName: 'Orbit Waitlist',
      to: targetEmail,
      subject: 'Scheduled Orbit Export',
      text: 'Scheduled export attached.',
      attachments: [{ name: 'scheduled_export.csv', content: Buffer.from(csvContent).toString('base64') }]
    });

    console.log('✅ Scheduled export sent.');
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});

export default app;
