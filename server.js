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
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aayqbazqqfyetkwhhwnt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_xzWQowLPMrAPuExx_GYb0A_AX6NJRY0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  const ADMIN_USER = process.env.ADMIN_USER || 'orbitAdmin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'orbitAdmin3326';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: 'orbit_secure_session_token_' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

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

    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'This email is already on the waitlist!' });
    }

    const normalizedCity = toTitleCase(city);

    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: email.toLowerCase(), city: normalizedCity, age }])
      .select();

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to save. Please try again.' });
    }

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ New signup: ${email} from ${city} (Total: ${count})`);

    // ─── Trigger Nodemailer Welcome Email ─────────────────────────
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: process.env.SMTP_PORT || 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || 'hello@joinorbit.org',
          pass: process.env.SMTP_PASS || 'orbitAdmin3326*',
        },
      });

      const info = await transporter.sendMail({
        from: '"ORBIT" <hello@joinorbit.org>', // sender address
        to: email.toLowerCase(), // list of receivers
        subject: "Welcome to the ORBIT Waitlist! 🚀", // Subject line
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0d0d14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="background-color: #0d0d14; padding: 40px 20px; color: #F0F0F5;">
              <div style="max-width: 600px; margin: 0 auto; background: #161622; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.4);">
                
                <!-- Gradient Header Bar -->
                <div style="height: 6px; background: linear-gradient(90deg, #FF6B6B 0%, #C4B5FD 50%, #5EEAD4 100%);"></div>
                
                <div style="padding: 48px 40px;">
                  <!-- Brand Mark -->
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 38px; font-weight: 800; letter-spacing: 0.15em; background: linear-gradient(135deg, #FF6B6B 0%, #C4B5FD 50%, #5EEAD4 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: #C4B5FD;">ORBIT</h1>
                  </div>

                  <!-- Main Content -->
                  <h2 style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 24px; color: #FFFFFF; text-align: center;">You're on the list! 🎉</h2>
                  
                  <p style="font-size: 16px; line-height: 1.7; color: #D1D5DB; margin-bottom: 24px;">
                    Hey there,
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.7; color: #D1D5DB; margin-bottom: 32px;">
                    Thanks for joining the ORBIT waitlist! We are absolutely thrilled to have you onboard. We'll notify you securely as soon as we officially launch.
                  </p>

                  <div style="background: rgba(196, 181, 253, 0.05); border: 1px solid rgba(196, 181, 253, 0.15); border-radius: 12px; padding: 28px; text-align: center; margin: 0 0 40px 0;">
                    <p style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 600; line-height: 1.4; background: linear-gradient(90deg, #C4B5FD 0%, #5EEAD4 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: #5EEAD4;">
                      Get ready to connect offline<br/>and live more.
                    </p>
                  </div>

                  <p style="font-size: 15px; line-height: 1.7; color: #9CA3B0; margin-bottom: 40px;">
                    — Built with 🖤 by the ORBIT Team.
                  </p>

                  <!-- Footer -->
                  <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 32px; text-align: center;">
                    <p style="font-size: 13px; color: #6B7280; margin-bottom: 8px; font-family: 'Outfit', sans-serif; font-weight: 500; letter-spacing: 0.05em;">
                      ORBIT — Connect Offline. Live More.
                    </p>
                    <a href="https://joinorbit.org" style="color: #C4B5FD; text-decoration: none; font-weight: 500; font-size: 14px;">joinorbit.org</a>
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });

      console.log(`📧 Welcome email sent to ${email} (Message ID: ${info.messageId})`);
    } catch (emailErr) {
      console.error('❌ Failed to trigger email via nodemailer:', emailErr);
    }
    // ──────────────────────────────────────────────────────────

    res.json({ success: true, message: "You're on the list!", total: count });
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
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const targetEmail = 'harshithakulal1999@gmail.com';

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
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'hello@joinorbit.org',
        pass: process.env.SMTP_PASS || 'orbitAdmin3326*',
      },
    });

    const targetEmail = 'irenik.tech@gmail.com';

    await transporter.sendMail({
      from: `"Orbit Waitlist" <${process.env.SMTP_USER || 'hello@joinorbit.org'}>`,
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
