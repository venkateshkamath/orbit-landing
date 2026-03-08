import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ CRITICAL: SUPABASE_URL and SUPABASE_KEY must be provided in environment variables.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

app.use(cors());
app.use(express.json());

// ─── City name normalizer (top-level utility) ─────────────
const toTitleCase = (str) =>
  str.trim().replace(/\s+/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// ─── Serve the Vite build (production) ────────────────────
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// POST /api/admin/login — secure backend login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(500).json({ success: false, error: 'Admin credentials not configured on server.' });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: 'orbit_secure_session_token_' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});


// ─── Build welcome email HTML ────────────────────────────────
const buildWelcomeEmail = (email) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ORBIT</title>
</head>
<body style="margin:0;padding:0;background-color:#020205;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <div style="background-color:#020205;padding:40px 16px;">
    <div style="max-width:540px;margin:0 auto;">

      <!-- ═══ PREMIUM HEADER ═══ -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#090911;border:1px solid rgba(255,255,255,0.04);border-radius:24px 24px 0 0;overflow:hidden;">
        <tr>
          <td style="padding:60px 40px 50px;text-align:center;">
            <!-- Logo Section -->
            <div style="margin-bottom:12px;">
              <span style="font-size:38px;font-weight:900;letter-spacing:0.22em;color:#FFFFFF;display:inline-block;padding-left:0.2em;">O R B I T</span>
            </div>
            <div style="width:50px;height:2px;background:linear-gradient(90deg, #FF6B6B, #C4B5FD, #5EEAD4);margin:0 auto 16px;"></div>
            <p style="margin:0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#4B5563;font-weight:700;">CONNECT OFFLINE · LIVE MORE</p>
          </td>
        </tr>
      </table>

      <!-- ═══ RADAR VISUAL ═══ -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05050A;border-left:1px solid rgba(255,255,255,0.04);border-right:1px solid rgba(255,255,255,0.04);">
        <tr>
          <td style="padding:0 40px;text-align:center;">
             <!-- Simplified Radar SVG for Email -->
             <svg width="180" height="180" viewBox="0 0 180 180" style="margin:0 auto;display:block;">
                <circle cx="90" cy="90" r="2" fill="#FFFFFF" fill-opacity="0.8">
                  <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="90" cy="90" r="25" stroke="#7C3AED" stroke-opacity="0.2" fill="none" />
                <circle cx="90" cy="90" r="50" stroke="#7C3AED" stroke-opacity="0.1" fill="none" />
                <circle cx="90" cy="90" r="75" stroke="#7C3AED" stroke-opacity="0.05" fill="none" />
                <!-- Orbiting Nodes -->
                <circle cx="130" cy="60" r="4" fill="#FF6B6B" fill-opacity="0.9" />
                <circle cx="40" cy="110" r="5" fill="#5EEAD4" fill-opacity="0.8" />
                <circle cx="100" cy="150" r="3" fill="#C4B5FD" fill-opacity="0.9" />
             </svg>
          </td>
        </tr>
      </table>

      <!-- ═══ MAIN CONTENT ═══ -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05050A;border-left:1px solid rgba(255,255,255,0.04);border-right:1px solid rgba(255,255,255,0.04);">
        <tr>
          <td style="padding:40px 45px 50px;">
            <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#F3F4F6;text-align:center;">You're in the Orbit 🎉</h2>
            
            <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#D1D5DB;line-height:1.6;">
              Hey ${email.split('@')[0]}
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#9CA3AF;font-weight:400;">
              Welcome to the inner circle. We're building a world where real-world proximity sparks genuine human connection. You're among the first to witness the shift from screens to scenes.
            </p>

            <!-- Feature Checklist -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
              <tr>
                <td style="padding-bottom:16px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:top;padding-top:4px;"><div style="width:6px;height:6px;background:#5EEAD4;border-radius:50%;margin-right:12px;"></div></td>
                      <td style="font-size:14px;color:#D1D5DB;">Priority access to local proximity events.</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:top;padding-top:4px;"><div style="width:6px;height:6px;background:#C4B5FD;border-radius:50%;margin-right:12px;"></div></td>
                      <td style="font-size:14px;color:#D1D5DB;">Instant discovery of like-minded communities nearby.</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:top;padding-top:4px;"><div style="width:6px;height:6px;background:#FF6B6B;border-radius:50%;margin-right:12px;"></div></td>
                      <td style="font-size:14px;color:#D1D5DB;">The chance to reclaim shared physical space.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;font-weight:500;color:#6B7280;font-style:italic;line-height:1.6;border-left:2px solid rgba(124, 58, 237, 0.3);padding-left:16px;">
              "The best connections never happened behind a keyboard."
            </p>
          </td>
        </tr>
      </table>

      <!-- ═══ PROFESSIONAL FOOTER ═══ -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#090911;border:1px solid rgba(255,255,255,0.04);border-top:none;border-radius:0 0 24px 24px;">
        <tr>
          <td style="padding:45px 40px;text-align:center;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#F3F4F6;letter-spacing:0.05em;">O R B I T</p>
            <p style="margin:0 0 20px;font-size:12px;color:#4B5563;line-height:1.6;max-width:300px;margin-left:auto;margin-right:auto;">
              A movement towards meaningful human presence. Built for those who crave the real world.
            </p>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.03);padding-top:24px;">
                   <a href="https://joinorbit.org" style="color:#A78BFA;text-decoration:none;font-weight:600;font-size:13px;">Visit Website</a>
                   <span style="color:#1F2937;margin:0 10px;">|</span>
                   <span style="color:#374151;font-size:12px;">© ${new Date().getFullYear()} ORBIT</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

    </div>
  </div>

</body>
</html>`;
};

// ─── Send welcome email (reusable) ────────────────────────────
const sendWelcomeEmail = async (email) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials missing. Email skipped.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"ORBIT" <${process.env.SMTP_USER}>`,
      to: email.toLowerCase(),
      subject: "Welcome to the ORBIT Waitlist! 🚀",
      html: buildWelcomeEmail(email),
    });

    console.log(`📧 Welcome email sent to ${email} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

// POST /api/waitlist — save email + city to Supabase
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, city, age } = req.body;

    if (!email || !city || !age) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const lowerEmail = email.toLowerCase();

    // ─── Normal flow (Optimized: single insert) ───────────────
    const normalizedCity = toTitleCase(city);

    // Parallelize getting count and inserting to save time
    const [insertResult, countResult] = await Promise.all([
      supabase.from('waitlist').insert([{ email: lowerEmail, city: normalizedCity, age }]).select(),
      supabase.from('waitlist').select('*', { count: 'exact', head: true })
    ]);

    if (insertResult.error) {
      if (insertResult.error.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'This email is already on the waitlist!' });
      }
      console.error('❌ Supabase Insert Error:', insertResult.error.code, insertResult.error.message, insertResult.error.details);
      return res.status(500).json({ error: `[DEBUG-V2] Failed to save: ${insertResult.error.message}` });
    }

    if (countResult.error) {
      console.warn('⚠️ Supabase Count Error:', countResult.error.message);
    }

    // Send email (Wait for it in production/serverless)
    try {
      await sendWelcomeEmail(lowerEmail);
    } catch (emailErr) {
      console.warn('⚠️ User saved but welcome email failed.');
    }

    // Send success response
    res.json({ success: true, message: "You're on the list!", total: countResult.count });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/waitlist/stats — data for analytics dashboard
app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const { data: allData, error: dbError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    const total = allData.length;

    // Normalize city names to Title Case so "mangalore" and "Mangalore" merge

    const cityCounts = allData.reduce((acc, row) => {
      const normalizedCity = toTitleCase(row.city);
      acc[normalizedCity] = (acc[normalizedCity] || 0) + 1;
      return acc;
    }, {});
    const cityStats = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    // Use ISO date for reliable sorting, short label for display
    const dailyCounts = allData.reduce((acc, row) => {
      const d = new Date(row.created_at);
      const isoDate = d.toISOString().split('T')[0]; // "2026-03-03"
      acc[isoDate] = (acc[isoDate] || 0) + 1;
      return acc;
    }, {});
    const growthData = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([isoDate, count]) => {
        const d = new Date(isoDate + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Mar 3"
        return { date: label, count };
      });

    // Normalize city names in recent signups for display consistency
    const recentSignups = allData.map(row => ({ ...row, city: toTitleCase(row.city) }));

    res.json({ totalCount: total, cityStats, growthData, recentSignups });
  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// GET /api/waitlist/count — return total signups
app.get('/api/waitlist/count', async (req, res) => {
  try {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });
    res.json({ count: count || 0 });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// GET /api/cities — unique city names for autocomplete dropdown
let citiesCache = { data: [], timestamp: 0 };
const CITIES_CACHE_TTL = 60000; // 60 seconds

app.get('/api/cities', async (req, res) => {
  try {
    const now = Date.now();
    // Serve from cache if fresh
    if (now - citiesCache.timestamp < CITIES_CACHE_TTL && citiesCache.data.length > 0) {
      const q = (req.query.q || '').toLowerCase();
      const filtered = q
        ? citiesCache.data.filter(c => c.toLowerCase().includes(q))
        : citiesCache.data;
      return res.json({ cities: filtered });
    }

    // Fetch only city column (lightweight)
    const { data, error } = await supabase
      .from('waitlist')
      .select('city');

    if (error) throw error;

    // Normalize, deduplicate, sort
    const unique = [...new Set(data.map(r => toTitleCase(r.city)))].sort();
    citiesCache = { data: unique, timestamp: now };

    const q = (req.query.q || '').toLowerCase();
    const filtered = q
      ? unique.filter(c => c.toLowerCase().includes(q))
      : unique;

    res.json({ cities: filtered });
  } catch (err) {
    console.error('❌ Cities error:', err);
    res.status(500).json({ cities: [] });
  }
});

// ─── Health check (for external uptime pings) ────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'alive',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ─── SPA fallback: serve index.html for all non-API routes ──
if (!process.env.VERCEL) {
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`\n🚀 ORBIT running on port ${PORT}`);
    console.log(`📊 Database: Supabase (${SUPABASE_URL})`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}


// POST /api/admin/email-export — generate and email CSV
app.post('/api/admin/email-export', async (req, res) => {
  try {
    const { data: allData, error: dbError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    // Generate CSV
    const headers = ['Email', 'City', 'Age', 'Joined Date'];
    const rows = allData.map(s => [
      s.email,
      `"${(s.city || 'Unknown').replace(/"/g, '""')}"`,
      s.age || 'N/A',
      new Date(s.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Create Transporter (Requires env variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const targetEmail = process.env.EXPORT_EMAIL

    // Verify SMTP config exists to prevent unhandled rejections if empty
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP_USER or SMTP_PASS not found. Email not sent.');
      return res.status(500).json({ error: 'SMTP configuration is missing on the server.' });
    }

    await transporter.sendMail({
      from: `"Orbit Waitlist" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `Orbit Waitlist Data Export - ${new Date().toISOString().split('T')[0]}`,
      text: 'Hello,\n\nAttached is the latest export of the Orbit waitlist.\n\nBest,\nOrbit Admin',
      attachments: [
        {
          filename: `orbit_waitlist_${new Date().toISOString().split('T')[0]}.csv`,
          content: csvContent,
          contentType: 'text/csv'
        }
      ]
    });

    res.json({ success: true, message: `Email triggered successfully to ${targetEmail}!` });
  } catch (err) {
    console.error('❌ Email export error:', err);
    res.status(500).json({ error: 'Failed to generate and email CSV.' });
  }
});


import cron from 'node-cron';

// ─── Automated Email Cron Job (Runs Backend Level) ────────
// Use '0 */6 * * *' to run every 6 hours and '*/5 * * * *' for 5 minutes
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running scheduled email export (every 6 hours)...');
  try {
    const { data: allData, error: dbError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    // Generate CSV
    const headers = ['Email', 'City', 'Age', 'Joined Date'];
    const rows = allData.map(s => [
      s.email,
      `"${(s.city || 'Unknown').replace(/"/g, '""')}"`,
      s.age || 'N/A',
      new Date(s.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const targetEmail = process.env.EXPORT_EMAIL || 'harshithakulal1999@gmail.com';

    await transporter.sendMail({
      from: `"Orbit Waitlist" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `Orbit Waitlist Scheduled Export - ${new Date().toISOString().split('T')[0]}`,
      text: 'Hello,\n\nAttached is the scheduled export of the Orbit waitlist.\n\nBest,\nOrbit Admin',
      attachments: [
        {
          filename: `orbit_waitlist_scheduled_${new Date().toISOString().split('T')[0]}.csv`,
          content: csvContent,
          contentType: 'text/csv'
        }
      ]
    });

    console.log(`✅ Scheduled email successfully sent to ${targetEmail}`);
  } catch (err) {
    console.error('❌ Cron email export error:', err);
  }
});

export default app;
