import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import sgMail from '@sendgrid/mail';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── SendGrid Setup ───────────────────────────────────────────
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SENDGRID_API_KEY is missing. Email features will not work.');
}

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
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d14; border: 1px solid #1a1a24; border-radius: 12px; overflow: hidden; margin-top: 40px;">
    <div style="padding: 40px 40px 20px; text-align: center;">
      <div style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 30px;">
        <span style="background: linear-gradient(135deg, #FF6B6B 0%, #C4B5FD 50%, #5EEAD4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #C4B5FD;">ORBIT</span>
      </div>
      <h1 style="font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px;">Welcome, ${username}</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 auto; max-width: 460px;">
        You're officially in Orbit! We're building the future of social proximity, and we're thrilled to have you with us.
      </p>
    </div>
    <div style="padding: 30px 40px; border-top: 1px solid #1a1a24; text-align: center; background-color: rgba(255,255,255,0.02);">
      <p style="color: #64748b; font-size: 13px; margin: 0;">&copy; 2026 ORBIT Proximity Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

// ─── Send welcome email (SendGrid) ──────────────────────────
const sendWelcomeEmail = async (email) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ Skip email: SENDGRID_API_KEY not set.');
    return;
  }

  const msg = {
    to: email.toLowerCase(),
    from: 'hello@joinorbit.org', // Must be verified in SendGrid
    subject: 'Welcome to the ORBIT Waitlist! 🚀',
    html: buildWelcomeEmail(email),
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 SendGrid: Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ SendGrid Error:', error.response ? error.response.body : error.message);
    throw error;
  }
};

app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, city, age } = req.body;
    if (!email || !city || !age) return res.status(400).json({ error: 'All fields are required.' });

    const lowerEmail = email.toLowerCase();
    const normalizedCity = toTitleCase(city);

    // Save to Supabase
    const [insertResult, countResult] = await Promise.all([
      supabase.from('waitlist').insert([{ email: lowerEmail, city: normalizedCity, age }]).select(),
      supabase.from('waitlist').select('*', { count: 'exact', head: true })
    ]);

    if (insertResult.error) {
      if (insertResult.error.code === '23505') return res.status(409).json({ error: 'Email already on list!' });
      return res.status(500).json({ error: `Save failed: ${insertResult.error.message}` });
    }

    // Trigger SendGrid email in background
    sendWelcomeEmail(lowerEmail).catch(err => {
      console.error('⚠️ Background Email Failed:', err.message);
    });

    res.json({ success: true, total: countResult.count || 0 });
  } catch (err) {
    console.error('❌ Global error:', err);
    res.status(500).json({ error: 'System error' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'alive' }));

if (!process.env.VERCEL) {
  app.get('{*path}', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  app.listen(PORT, () => console.log(`🚀 ORBIT active on ${PORT}`));
}

// Admin Logic (Export via SendGrid)
app.post('/api/admin/email-export', async (req, res) => {
  try {
    const { data: allData } = await supabase.from('waitlist').select('*');
    const csvContent = "Email,City,Age,Joined Date\n" + allData.map(s => 
      `${s.email},"${(s.city || '').replace(/"/g, '""')}",${s.age || ''},${new Date(s.created_at).toLocaleString()}`
    ).join('\n');

    const targetEmail = process.env.EXPORT_EMAIL || 'irenik.tech@gmail.com';
    
    const msg = {
      to: targetEmail,
      from: 'hello@joinorbit.org',
      subject: 'Orbit Data Export',
      text: 'Attached is the Orbit waitlist export.',
      attachments: [
        {
          content: Buffer.from(csvContent).toString('base64'),
          filename: 'orbit_waitlist.csv',
          type: 'text/csv',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Export Error:', err.response ? err.response.body : err.message);
    res.status(500).json({ error: err.message });
  }
});

// Cron Job (Export via SendGrid)
cron.schedule('0 */6 * * *', async () => {
  try {
    const { data: allData } = await supabase.from('waitlist').select('*');
    if (!allData || allData.length === 0) return;

    const csvContent = "Email,City,Age,Joined Date\n" + allData.map(s => 
      `${s.email},"${(s.city || '').replace(/"/g, '""')}",${s.age || ''},${new Date(s.created_at).toLocaleString()}`
    ).join('\n');

    const targetEmail = process.env.EXPORT_EMAIL || 'irenik.tech@gmail.com';
    
    const msg = {
      to: targetEmail,
      from: 'hello@joinorbit.org',
      subject: 'Scheduled Orbit Export',
      text: 'Scheduled CSV export attached.',
      attachments: [
        {
          content: Buffer.from(csvContent).toString('base64'),
          filename: 'scheduled_export.csv',
          type: 'text/csv',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);
    console.log('✅ Scheduled Export Sent via SendGrid');
  } catch (err) {
    console.error('❌ Cron export failed:', err.message);
  }
});

export default app;
