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
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY is missing from environment variables!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const toTitleCase = (str) =>
  str.trim().replace(/\s+/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

if (!process.env.VERCEL) {
  // Use long-term caching for static assets (JS, CSS, images) but no-cache for HTML
  app.use(express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));
}

// ─── Resend HTTP API (instant delivery, replaces Brevo) ────────
const sendResendEmail = async ({ from, fromName, to, subject, html, text, attachments }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not set. Skipping email.');
    return null;
  }

  const senderName = fromName || 'ORBIT';
  const senderEmail = from || 'hello@joinorbit.org';

  const body = {
    from: `${senderName} <${senderEmail}>`,
    to: [to],
    subject,
  };
  if (html) body.html = html;
  if (text) body.text = text;
  if (attachments) {
    body.attachments = attachments.map(att => ({
      filename: att.name || 'attachment.csv',
      content: att.content
    }));
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend API error: ${data.message || JSON.stringify(data)}`);
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
    
    <!-- Footer -->
    <div style="padding: 30px 40px; border-top: 1px solid #1a1a24; text-align: center; background-color: #09090b;">
      <div style="font-size: 14px; font-weight: 800; color: #ffffff; letter-spacing: 0.4em; margin-bottom: 12px; margin-left: 0.4em;">
        O R B I T
      </div>
      <p style="font-size: 12px; line-height: 1.6; color: #64748b; margin: 0 auto 16px; max-width: 400px;">
        A movement towards meaningful human presence. Built for those who crave the real world.
      </p>
      <p style="font-size: 12px; color: #475569; margin: 0;">
        <a href="https://joinorbit.org" style="color: #5EEAD4; text-decoration: none;">Visit Website</a> &nbsp;|&nbsp; &copy; 2026 ORBIT
      </p>
    </div>
  </div>
</body>
</html>`;
};

// ─── Send welcome email ─────────────────────────────────────
const sendWelcomeEmail = async (email) => {
  try {
    const result = await sendResendEmail({
      to: email.toLowerCase(),
      subject: "Welcome to the ORBIT Waitlist! 🚀",
      html: buildWelcomeEmail(email),
    });
    console.log(`📧 Email sent to ${email} (ID: ${result?.id || 'ok'})`);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw error;
  }
};

// ─── POST /api/admin/login ──────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(500).json({ success: false, error: 'Admin credentials not configured on server' });
  }

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

    // Send email (MUST be awaited on Vercel/Serverless, or it kills the process before completing)
    try {
      await sendWelcomeEmail(lowerEmail);
    } catch (err) {
      console.warn('⚠️ User saved, but email failed (e.g., quota/sandbox):', err.message);
    }

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
 
// ─── GET /api/waitlist/count ────────────────────────────────
app.get('/api/waitlist/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ count: 0, error: err.message });
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
        id: r.id,
        email: r.email,
        city: toTitleCase(r.city || 'Unknown'),
        age: r.age,
        created_at: r.created_at
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

// ─── GET /api/cities/search — city autocomplete ─────────────
app.get('/api/cities/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ cities: [] });

  const searchLocal = async () => {
    try {
      const { data } = await supabase.from('waitlist').select('city');
      const all = [...new Set((data || []).map(r => toTitleCase(r.city || '')))];
      return all.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
    } catch {
      return [];
    }
  };

  const searchPhoton = async () => {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lang=en`,
      { headers: { 'User-Agent': 'OrbitLanding/1.0 (hello@joinorbit.org)' } }
    );
    if (!response.ok) throw new Error(`Photon HTTP ${response.status}`);
    const data = await response.json();
    const allowed = new Set(['city', 'town', 'village', 'municipality', 'hamlet']);
    const cities = (data.features || [])
      .map((f) => f.properties || {})
      .filter((p) => {
        const kind = (p.osm_value || p.type || '').toLowerCase();
        return allowed.has(kind) || allowed.has((p.type || '').toLowerCase());
      })
      .map((p) => {
        const city = p.name || p.city;
        const country = p.country || '';
        if (!city) return null;
        return country ? `${city}, ${country}` : city;
      })
      .filter(Boolean);
    return [...new Set(cities)].slice(0, 6);
  };

  const apiKey = process.env.GEODB_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(q)}&limit=6&sort=-population&types=CITY`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
          },
        }
      );
      const data = await response.json();
      const cities = (data.data || []).map(c => `${c.city}, ${c.country}`);
      if (cities.length) return res.json({ cities });
    } catch (err) {
      console.error('❌ GeoDB Cities error:', err.message);
    }
  }

  try {
    const cities = await searchPhoton();
    if (cities.length) return res.json({ cities });
  } catch (err) {
    console.error('❌ Photon Cities error:', err.message);
  }

  const local = await searchLocal();
  res.json({ cities: local });
});

// ─── GET /api/health ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

// ─── POST /api/feedback ─────────────────────────────────────
const FEEDBACK_CATEGORIES = new Set(['bug', 'feature', 'ui', 'performance', 'safety', 'other']);
const FEEDBACK_CATEGORY_LABELS = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  ui: 'UI / Design',
  performance: 'Performance',
  safety: 'Privacy / Safety',
  other: 'Other',
};
const FEEDBACK_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const FEEDBACK_MAX_SCREENSHOTS = 3;
const FEEDBACK_MAX_BYTES = 5 * 1024 * 1024;

app.post('/api/feedback', async (req, res) => {
  try {
    const {
      category,
      name = '',
      email,
      message,
      screenshots = [],
      meta = {},
    } = req.body || {};

    if (!category || !FEEDBACK_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'Please select a valid category.' });
    }
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email.' });
    }

    const trimmedMessage = String(message).trim();
    if (trimmedMessage.length < 10) {
      return res.status(400).json({ error: 'Please share a bit more detail (at least 10 characters).' });
    }
    if (trimmedMessage.length > 4000) {
      return res.status(400).json({ error: 'Message is too long (max 4000 characters).' });
    }

    if (!Array.isArray(screenshots) || screenshots.length > FEEDBACK_MAX_SCREENSHOTS) {
      return res.status(400).json({ error: `You can attach up to ${FEEDBACK_MAX_SCREENSHOTS} screenshots.` });
    }

    const safeScreenshots = [];
    for (const shot of screenshots) {
      if (!shot || typeof shot.content !== 'string') {
        return res.status(400).json({ error: 'Invalid screenshot attachment.' });
      }
      const type = shot.type || 'image/png';
      if (!FEEDBACK_IMAGE_TYPES.has(type)) {
        return res.status(400).json({ error: 'Screenshots must be PNG, JPG, WEBP, or GIF.' });
      }
      // Rough base64 size check (~4/3 of binary)
      const approxBytes = Math.floor((shot.content.length * 3) / 4);
      if (approxBytes > FEEDBACK_MAX_BYTES) {
        return res.status(400).json({ error: 'Each screenshot must be under 5MB.' });
      }
      const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];
      const safeName = String(shot.name || `screenshot.${ext}`).replace(/[^\w.\-]+/g, '_').slice(0, 80);
      safeScreenshots.push({
        name: safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`,
        type,
        content: shot.content,
      });
    }

    const trimmedName = String(name || '').trim().slice(0, 120);
    const lowerEmail = email.toLowerCase().trim();
    const source = String(meta.source || 'web').slice(0, 40);
    const platform = String(meta.platform || '').slice(0, 40);
    const version = String(meta.version || '').slice(0, 40);
    const categoryLabel = FEEDBACK_CATEGORY_LABELS[category] || category;

    const screenshotUrls = safeScreenshots.map(
      (shot) => `data:${shot.type};base64,${shot.content}`
    );
    // Store one or many screenshots as JSON in the screenshot column (legacy: single data URL still supported)
    const screenshotValue = screenshotUrls.length === 0
      ? null
      : screenshotUrls.length === 1
        ? screenshotUrls[0]
        : JSON.stringify(screenshotUrls);

    // Matches Supabase feedback table: screenshot = image data URL or JSON array of data URLs
    const feedbackRow = {
      category,
      name: trimmedName || null,
      email: lowerEmail,
      message: trimmedMessage,
      screenshot: screenshotValue,
      source,
      platform: platform || null,
      app_version: version || null,
    };

    const { data: inserted, error: dbError } = await supabase
      .from('feedback')
      .insert([feedbackRow])
      .select('id')
      .single();
    if (dbError) {
      console.error('❌ Feedback DB insert failed:', dbError.message);
      return res.status(500).json({
        error: `Could not save feedback to database: ${dbError.message}`,
      });
    }

    const targetEmail = process.env.FEEDBACK_EMAIL || process.env.EXPORT_EMAIL || 'hello@joinorbit.org';
    const metaLines = [
      `Category: ${categoryLabel}`,
      trimmedName ? `Name: ${trimmedName}` : null,
      `Email: ${lowerEmail}`,
      `Source: ${source}`,
      platform ? `Platform: ${platform}` : null,
      version ? `App version: ${version}` : null,
      `Screenshots: ${safeScreenshots.length}`,
    ].filter(Boolean).join('\n');

    try {
      await sendResendEmail({
        fromName: 'Orbit Feedback',
        to: targetEmail,
        subject: `[Orbit Feedback] ${categoryLabel}`,
        text: `${metaLines}\n\n${trimmedMessage}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#1a1a2e;">
            <h2 style="margin:0 0 12px;">New Orbit feedback</h2>
            <p style="margin:0 0 8px;"><strong>Category:</strong> ${categoryLabel}</p>
            ${trimmedName ? `<p style="margin:0 0 8px;"><strong>Name:</strong> ${trimmedName}</p>` : ''}
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${lowerEmail}</p>
            <p style="margin:0 0 8px;"><strong>Source:</strong> ${source}${platform ? ` · ${platform}` : ''}${version ? ` · v${version}` : ''}</p>
            <p style="margin:0 0 16px;white-space:pre-wrap;">${trimmedMessage.replace(/</g, '&lt;')}</p>
            <p style="margin:0;color:#6b7280;font-size:13px;">${safeScreenshots.length} screenshot(s) attached</p>
          </div>
        `,
        attachments: safeScreenshots.length
          ? safeScreenshots.map((shot) => ({ name: shot.name, content: shot.content }))
          : undefined,
      });
    } catch (mailErr) {
      console.warn('⚠️ Feedback saved, but email failed:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Feedback received. Thank you!',
      id: inserted?.id,
    });
  } catch (err) {
    console.error('❌ Feedback error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

const parseScreenshotList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.length > 0);
  }
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string' && item.length > 0);
      }
    } catch {
      // fall through to single-image handling
    }
  }
  return [trimmed];
};

const mapFeedbackRow = (r, { includeScreenshot = false } = {}) => {
  const shots = parseScreenshotList(r.screenshot);
  const count = shots.length;
  return {
    id: r.id,
    category: r.category || 'other',
    name: r.name || '',
    email: r.email || '',
    message: r.message || '',
    has_screenshot: count > 0,
    screenshot_count: count,
    screenshot: includeScreenshot && count > 0 ? shots[0] : null,
    screenshots: includeScreenshot
      ? shots.map((_, index) => `/api/feedback/${r.id}/screenshot/${index}`)
      : [],
    source: r.source || 'web',
    platform: r.platform || '',
    app_version: r.app_version || '',
    created_at: r.created_at,
  };
};

const parseScreenshotDataUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
};

const sendFeedbackScreenshot = async (req, res) => {
  try {
    const id = req.params.id;
    const index = Number.parseInt(req.params.index ?? '0', 10);
    if (!Number.isFinite(index) || index < 0) {
      return res.status(400).json({ error: 'Invalid screenshot index.' });
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('screenshot')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    const shots = parseScreenshotList(data?.screenshot);
    const shot = shots[index];
    if (!shot) return res.status(404).json({ error: 'Screenshot not found.' });

    const parsed = parseScreenshotDataUrl(shot);
    if (!parsed) {
      if (/^https?:\/\//i.test(shot)) return res.redirect(shot);
      return res.status(404).json({ error: 'Screenshot format not supported.' });
    }

    res.set('Content-Type', parsed.contentType);
    res.set('Cache-Control', 'private, max-age=3600');
    res.send(parsed.buffer);
  } catch (err) {
    console.error('❌ Feedback screenshot error:', err.message);
    res.status(500).json({ error: 'Failed to load screenshot.' });
  }
};

// ─── GET /api/feedback/stats ────────────────────────────────
app.get('/api/feedback/stats', async (req, res) => {
  try {
    const { data: allData, error: dbError } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Feedback stats error:', dbError.message);
      return res.status(500).json({
        error: `Failed to fetch feedback: ${dbError.message}`,
        total: 0,
        last24h: 0,
        withScreenshots: 0,
        bugs: 0,
        features: 0,
        categoryStats: ['bug', 'feature', 'ui', 'performance', 'safety', 'other'].map((id) => ({
          id,
          label: FEEDBACK_CATEGORY_LABELS[id],
          count: 0,
        })),
        recentFeedback: [],
      });
    }

    const rows = allData || [];

    const now = Date.now();
    const last24h = rows.filter(r => (now - new Date(r.created_at).getTime()) < 24 * 60 * 60 * 1000).length;
    const withScreenshots = rows.filter(r => Boolean(r.screenshot)).length;

    const categoryOrder = ['bug', 'feature', 'ui', 'performance', 'safety', 'other'];
    const categoryCounts = rows.reduce((acc, row) => {
      const key = FEEDBACK_CATEGORIES.has(row.category) ? row.category : 'other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const categoryStats = categoryOrder.map((id) => ({
      id,
      label: FEEDBACK_CATEGORY_LABELS[id],
      count: categoryCounts[id] || 0,
    }));

    res.json({
      total: rows.length,
      last24h,
      withScreenshots,
      bugs: categoryCounts.bug || 0,
      features: categoryCounts.feature || 0,
      categoryStats,
      recentFeedback: rows.map((r) => mapFeedbackRow(r, { includeScreenshot: false })),
    });
  } catch (err) {
    console.error('❌ Feedback stats error:', err.message);
    res.status(500).json({
      error: 'Failed to fetch feedback.',
      total: 0,
      last24h: 0,
      withScreenshots: 0,
      bugs: 0,
      features: 0,
      categoryStats: ['bug', 'feature', 'ui', 'performance', 'safety', 'other'].map((id) => ({
        id,
        label: FEEDBACK_CATEGORY_LABELS[id],
        count: 0,
      })),
      recentFeedback: [],
    });
  }
});

// ─── GET /api/feedback/:id ──────────────────────────────────
app.get('/api/feedback/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Feedback not found.' });

    res.json({ feedback: mapFeedbackRow(data, { includeScreenshot: true }) });
  } catch (err) {
    console.error('❌ Feedback detail error:', err.message);
    res.status(500).json({ error: 'Failed to load feedback.' });
  }
});

// ─── GET /api/feedback/:id/screenshot ───────────────────────
app.get('/api/feedback/:id/screenshot', sendFeedbackScreenshot);
app.get('/api/feedback/:id/screenshot/:index', sendFeedbackScreenshot);

// ─── SPA fallback + listen ──────────────────────────────────
if (!process.env.VERCEL) {
  app.get(/.*/, (req, res) => {
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

    await sendResendEmail({
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

    await sendResendEmail({
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
