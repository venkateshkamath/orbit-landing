/**
 * Server-rendered event share landing (OG + CTAs) for WhatsApp / App Links.
 * No custom URL schemes in WhatsApp-facing copy.
 */

const SITE_URL = (process.env.SITE_URL || 'https://www.joinorbit.org').replace(/\/$/, '');
const ORBIT_API_URL = (process.env.ORBIT_API_URL || 'https://api.joinorbit.org').replace(/\/$/, '');
/** Play Store — package org.orbit.app. Override with PLAY_STORE_URL if listing URL differs. */
const PLAY_STORE_URL = (
  process.env.PLAY_STORE_URL ||
  'https://play.google.com/store/apps/details?id=org.orbit.app'
).trim();
/**
 * App Store listing. Set APP_STORE_URL (or ORBIT_APP_STORE_URL) once the iOS listing is live.
 * Empty → hide App Store button in server HTML until configured.
 */
const APP_STORE_URL = (
  process.env.APP_STORE_URL ||
  process.env.ORBIT_APP_STORE_URL ||
  ''
).trim();
const DEFAULT_OG_IMAGE = `${SITE_URL}/orbit-hero.png`;
const DEFAULT_TITLE = 'ORBIT — Connect Offline. Live More.';
const DEFAULT_DESCRIPTION =
  'Discover local events and real-world connections on ORBIT. Get the app to join.';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, ' ');
}

function pickString(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

function normalizeSharePayload(data, eventId) {
  if (!data || typeof data !== 'object') {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_OG_IMAGE,
      url: `${SITE_URL}/event/${encodeURIComponent(eventId)}`,
      fallback: true,
    };
  }

  const title =
    pickString(data.title, data.name, data.event_title, data.og_title) || DEFAULT_TITLE;
  const description =
    pickString(
      data.description,
      data.summary,
      data.og_description,
      data.subtitle,
      data.location && `Event in ${data.location}`,
    ) || DEFAULT_DESCRIPTION;
  const image =
    pickString(
      data.image,
      data.image_url,
      data.og_image,
      data.cover_image,
      data.cover_url,
      data.thumbnail,
      data.photo_url,
    ) || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    image,
    url: `${SITE_URL}/event/${encodeURIComponent(eventId)}`,
    fallback: false,
  };
}

export async function fetchEventShare(eventId) {
  const url = `${ORBIT_API_URL}/api/events/${encodeURIComponent(eventId)}/share/`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) {
      return normalizeSharePayload(null, eventId);
    }
    const data = await res.json();
    return normalizeSharePayload(data, eventId);
  } catch {
    return normalizeSharePayload(null, eventId);
  } finally {
    clearTimeout(timeout);
  }
}

export function renderEventShareHtml({ eventId, meta }) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeAttr(meta.image);
  const url = escapeAttr(meta.url);
  // Same-site https links never hand off to the app from inside the browser,
  // so the button uses the app scheme (Android: intent:// with Play fallback).
  const encodedId = encodeURIComponent(String(eventId || ''));
  const openHref = escapeAttr(`orbit://event/${encodedId}`);
  const androidOpenHref = escapeAttr(
    `intent://event/${encodedId}#Intent;scheme=orbit;package=org.orbit.app;` +
      `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`,
  );
  const playHref = escapeAttr(PLAY_STORE_URL);
  const appStoreHref = APP_STORE_URL ? escapeAttr(APP_STORE_URL) : '';
  const safeId = escapeHtml(eventId);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ORBIT" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <link rel="icon" type="image/png" href="/orbit-icon.png" />
  <style>
    :root {
      --bg: #0F0F1A;
      --card: #1C1C2E;
      --text: #F5F5F7;
      --muted: #A1A1B5;
      --coral: #FF6B6B;
      --lavender: #C4B5FD;
      --teal: #5EEAD4;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, rgba(196,181,253,.18), transparent 50%),
                  radial-gradient(900px 500px at 100% 0%, rgba(255,107,107,.12), transparent 45%),
                  var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 440px;
      background: color-mix(in srgb, var(--card) 88%, transparent);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,.45);
      backdrop-filter: blur(12px);
    }
    .cover {
      width: 100%;
      aspect-ratio: 1.91 / 1;
      object-fit: cover;
      background: #12121f;
      display: block;
    }
    .body { padding: 24px 24px 28px; }
    .brand {
      font-family: Outfit, Inter, system-ui, sans-serif;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(90deg, var(--coral), var(--lavender), var(--teal));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin: 0 0 12px;
      font-size: 0.95rem;
    }
    h1 {
      font-family: Outfit, Inter, system-ui, sans-serif;
      font-size: 1.55rem;
      line-height: 1.25;
      margin: 0 0 10px;
      letter-spacing: -0.02em;
    }
    p { margin: 0 0 22px; color: var(--muted); line-height: 1.5; font-size: 0.98rem; }
    .actions { display: flex; flex-direction: column; gap: 10px; }
    a.btn {
      display: block;
      text-align: center;
      text-decoration: none;
      border-radius: 999px;
      padding: 14px 18px;
      font-weight: 600;
      font-size: 0.98rem;
    }
    a.btn-primary {
      color: #0F0F1A;
      background: linear-gradient(90deg, var(--coral), var(--lavender));
    }
    a.btn-secondary {
      color: var(--text);
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
    }
    .hint { margin-top: 16px; font-size: 0.8rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <main class="card">
    <img class="cover" src="${image}" alt="" />
    <div class="body">
      <p class="brand">ORBIT</p>
      <h1>${title}</h1>
      <p>${description}</p>
      <div class="actions">
        <a class="btn btn-primary" id="open-in-orbit" href="${openHref}" data-android-href="${androidOpenHref}">Open in Orbit</a>
        <script>(function(){var a=document.getElementById("open-in-orbit");if(a&&/Android/i.test(navigator.userAgent)){a.setAttribute("href",a.getAttribute("data-android-href"));}})();</script>
        <a class="btn btn-secondary" href="${playHref}">Get it on Google Play</a>
        ${appStoreHref ? `<a class="btn btn-secondary" href="${appStoreHref}">Download on the App Store</a>` : ''}
      </div>
      <p class="hint">Event ${safeId}</p>
    </div>
  </main>
</body>
</html>`;
}

export { SITE_URL, ORBIT_API_URL, DEFAULT_OG_IMAGE };
