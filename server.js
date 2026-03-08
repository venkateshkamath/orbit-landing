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
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ CRITICAL: SUPABASE_URL and SUPABASE_KEY must be provided in environment variables.');
}

// Global Supabase client
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
    
    <!-- Hero / Logo Section -->
    <div style="padding: 40px 40px 20px; text-align: center;">
      <div style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 30px;">
        <span style="background: linear-gradient(135deg, #FF6B6B 0%, #C4B5FD 50%, #5EEAD4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #C4B5FD;">ORBIT</span>
      </div>
      
      <!-- Premium Radar Visual (SVG) -->
      <div style="margin: 20px 0 40px;">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style="margin: 0 auto;">
          <circle cx="60" cy="60" r="58" stroke="#1a1a24" stroke-width="1"/>
          <circle cx="60" cy="60" r="40" stroke="#1a1a24" stroke-width="1"/>
          <circle cx="60" cy="60" r="22" stroke="#1a1a24" stroke-width="1"/>
          <circle cx="60" cy="60" r="4" fill="#C4B5FD" opacity="0.8"/>
          <path d="M60 2 L60 118" stroke="#1a1a24" stroke-width="0.5"/>
          <path d="M2 60 L118 60" stroke="#1a1a24" stroke-width="0.5"/>
          <circle cx="85" cy="45" r="3" fill="#5EEAD4" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="80" r="4" fill="#FF6B6B" opacity="0.4">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <h1 style="font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">You're in Orbit, ${username}</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 auto; max-width: 460px;">
        Welcome to the next generation of social proximity. We're building a world where connection is measured by distance, not just data.
      </p>
    </div>

    <!-- Content Card -->
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

    <!-- Footer -->
    <div style="padding: 30px 40px; border-top: 1px solid #1a1a24; text-align: center;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="color: #64748b; font-size: 13px; line-height: 1.5;">
            &copy; 2026 ORBIT Proximity Platform. All rights reserved.<br>
            <div style="margin-top: 10px;">
              <a href="https://joinorbit.org" style="color: #94a3b8; text-decoration: none; margin: 0 10px;">Website</a>
              <a href="https://joinorbit.org/privacy" style="color: #94a3b8; text-decoration: none; margin: 0 10px;">Privacy</a>
            </div>
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
  // 🛡️ Guard: Skip if credentials are missing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST) {
    console.warn(\`⚠️ SMTP configuration incomplete (Host: \${!!process.env.SMTP_HOST}, User: \${!!process.env.SMTP_USER}). Email skipped.\`);
    return null;
  }

  try {
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465, // Use SSL only for port 465
      auth: {
        user: process.env.SMTP_USER || 'hello@joinorbit.org',
        pass: process.env.SMTP_PASS || 'orbitAdmin3326*',
      },
      tls: {
        // 🧪 Crucial for cloud hosts like Render/Vercel: 
        // prevents failure if the server has issues validating the SSL/TLS cert
        rejectUnauthorized: false 
      },
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    const info = await transporter.sendMail({
      from: \`"ORBIT" <\${process.env.SMTP_USER}>\`,
      to: email.toLowerCase(),
      subject: "Welcome to the ORBIT Waitlist! 🚀",
      html: buildWelcomeEmail(email),
    });

    console.log(\`📧 Welcome email sent to \${email} (Message ID: \${info.messageId})\`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed. This is likely an SMTP config/firewall issue on the server.');
    console.error(\`--- Detail: \${error.message} ---\`);
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
      return res.status(500).json({ error: \`Failed to save: \${insertResult.error.message}\` });
    }

    if (countResult.error) {
      console.warn('⚠️ Supabase Count Error:', countResult.error.message);
    }

    // 📧 Send email (Fire-and-forget but awaited with a short timeout to prevent hanging)
    const emailTimeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 4500));
    
    try {
      const result = await Promise.race([
        sendWelcomeEmail(lowerEmail),
        emailTimeout
      ]);
      
      if (result === 'timeout') {
         console.warn('🕒 Email send exceeded 4.5s timeout. Proceeding with response.');
      }
    } catch (emailErr) {
      console.warn('⚠️ User saved but welcome email failed:', emailErr.message);
    }

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

    const totalSignups = allData.length;
    const now = Date.now();
    const last24h = allData.filter(r => (now - new Date(r.created_at).getTime()) < 24 * 60 * 60 * 1000).length;

    const cityStats = Object.entries(
      allData.reduce((acc, row) => {
        const c = toTitleCase(row.city);
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {})
    ).map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const dailyCounts = allData.reduce((acc, row) => {
      const d = new Date(row.created_at);
      const isoDate = d.toISOString().split('T')[0];
      acc[isoDate] = (acc[isoDate] || 0) + 1;
      return acc;
    }, {});
    const growthData = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([isoDate, count]) => {
        const d = new Date(isoDate + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { date: label, count };
      });

    const recentSignups = allData.slice(0, 50).map(r => ({
      email: r.email,
      city: toTitleCase(r.city),
      time: new Date(r.created_at).toLocaleString()
    }));

    res.json({
      totalSignups,
      last24h,
      cityStats,
      growthData,
      recentSignups
    });
  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET /api/cities — helper for autocomplete
let citiesCache = { data: [], timestamp: 0 };
app.get('/api/cities', async (req, res) => {
  try {
    const now = Date.now();
    if (citiesCache.data.length > 0 && (now - citiesCache.timestamp < 3600000)) {
       const q = (req.query.q || '').toLowerCase();
       const filtered = q ? citiesCache.data.filter(c => c.toLowerCase().includes(q)) : citiesCache.data;
       return res.json({ cities: filtered });
    }

    const { data, error } = await supabase.from('waitlist').select('city');
    if (error) throw error;

    const unique = [...new Set(data.map(r => toTitleCase(r.city)))].sort();
    citiesCache = { data: unique, timestamp: now };

    const q = (req.query.q || '').toLowerCase();
    const filtered = q ? unique.filter(c => c.toLowerCase().includes(q)) : unique;
    res.json({ cities: filtered });
  } catch (err) {
    console.error('❌ Cities error:', err);
    res.json({ cities: [] });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

if (!process.env.VERCEL) {
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(\`\\n🚀 ORBIT running on port \${PORT}\`);
    console.log(\`📊 Database: Supabase (\${SUPABASE_URL})\`);
    console.log(\`🌍 Environment: \${process.env.NODE_ENV || 'development'}\\n\`);
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

    const headers = ['Email', 'City', 'Age', 'Joined Date'];
    const rows = allData.map(s => [
      s.email,
      \`"\${(s.city || 'Unknown').replace(/"/g, '""')}"\`,
      s.age || 'N/A',
      new Date(s.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false }
    });

    const targetEmail = process.env.EXPORT_EMAIL;
    if (!targetEmail) {
      return res.status(500).json({ error: 'EXPORT_EMAIL not configured on server.' });
    }

    await transporter.sendMail({
      from: \`"Orbit Waitlist" <\${process.env.SMTP_USER}>\`,
      to: targetEmail,
      subject: \`Orbit Waitlist Data Export - \${new Date().toISOString().split('T')[0]}\`,
      text: 'Hello,\\n\\nAttached is the latest export of the Orbit waitlist.\\n\\nBest,\\nOrbit Admin',
      attachments: [{
        filename: \`orbit_waitlist_\${new Date().toISOString().split('T')[0]}.csv\`,
        content: csvContent,
        contentType: 'text/csv'
      }]
    });

    res.json({ success: true, message: \`Email triggered successfully to \${targetEmail}!\` });
  } catch (err) {
    console.error('❌ Email export error:', err);
    res.status(500).json({ error: 'Failed to generate and email CSV.' });
  }
});

// ─── Automated Email Cron Job (Runs Backend Level) ────────
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running scheduled email export (every 6 hours)...');
  try {
    const { data: allData, error: dbError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    const headers = ['Email', 'City', 'Age', 'Joined Date'];
    const rows = allData.map(s => [
      s.email,
      \`"\${(s.city || 'Unknown').replace(/"/g, '""')}"\`,
      s.age || 'N/A',
      new Date(s.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false }
    });

    const targetEmail = process.env.EXPORT_EMAIL;
    if (!targetEmail) return;

    await transporter.sendMail({
      from: \`"Orbit Waitlist" <\${process.env.SMTP_USER}>\`,
      to: targetEmail,
      subject: \`Orbit Waitlist Scheduled Export - \${new Date().toISOString().split('T')[0]}\`,
      text: 'Hello,\\n\\nAttached is the scheduled export of the Orbit waitlist.\\n\\nBest,\\nOrbit Admin',
      attachments: [{
        filename: \`orbit_waitlist_scheduled_\${new Date().toISOString().split('T')[0]}.csv\`,
        content: csvContent,
        contentType: 'text/csv'
      }]
    });

    console.log(\`✅ Scheduled email successfully sent to \${targetEmail}\`);
  } catch (err) {
    console.error('❌ Cron email export error:', err);
  }
});

export default app;
