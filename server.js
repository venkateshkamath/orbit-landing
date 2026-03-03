import express from 'express';
import cors from 'cors';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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

// ─── Serve the Vite build (production) ────────────────────
app.use(express.static(path.join(__dirname, 'dist')));

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
    const { email, city } = req.body;

    if (!email || !city) {
      return res.status(400).json({ error: 'Email and city are required.' });
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

    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: email.toLowerCase(), city }])
      .select();

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to save. Please try again.' });
    }

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ New signup: ${email} from ${city} (Total: ${count})`);

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

    const cityCounts = allData.reduce((acc, row) => {
      acc[row.city] = (acc[row.city] || 0) + 1;
      return acc;
    }, {});
    const cityStats = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const dailyCounts = allData.reduce((acc, row) => {
      const date = new Date(row.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const growthData = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);

    res.json({ totalCount: total, cityStats, growthData, recentSignups: allData });
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

// ─── Health check (for external uptime pings) ────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'alive',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ─── SPA fallback: serve index.html for all non-API routes ──
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 ORBIT running on port ${PORT}`);
  console.log(`📊 Database: Supabase (${SUPABASE_URL})`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
