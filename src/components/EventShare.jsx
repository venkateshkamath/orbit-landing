import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './EventShare.css';

const API_BASE = (import.meta.env.VITE_ORBIT_API_URL || 'https://api.joinorbit.org').replace(
  /\/$/,
  '',
);
const PLAY_STORE_URL =
  import.meta.env.VITE_PLAY_STORE_URL ||
  'https://play.google.com/store/apps/details?id=org.orbit.app';
const APP_STORE_URL =
  import.meta.env.VITE_APP_STORE_URL || import.meta.env.VITE_ORBIT_APP_STORE_URL || '';

const FALLBACK = {
  title: 'ORBIT — Connect Offline. Live More.',
  description:
    'Discover local events and real-world connections on ORBIT. Get the app to join.',
  image: '/orbit-hero.png',
};

function pickString(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

export default function EventShare() {
  const { id } = useParams();
  const [meta, setMeta] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/events/${encodeURIComponent(id)}/share/`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('share fetch failed');
        const data = await res.json();
        if (cancelled) return;
        setMeta({
          title:
            pickString(data.title, data.name, data.event_title, data.og_title) || FALLBACK.title,
          description:
            pickString(
              data.description,
              data.summary,
              data.og_description,
              data.subtitle,
            ) || FALLBACK.description,
          image:
            pickString(
              data.image,
              data.image_url,
              data.og_image,
              data.cover_image,
              data.cover_url,
              data.thumbnail,
              data.photo_url,
            ) || FALLBACK.image,
        });
      } catch {
        if (!cancelled) setMeta(FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const pageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/event/${encodeURIComponent(id || '')}`
      : `/event/${encodeURIComponent(id || '')}`;

  return (
    <div className="event-share-wrapper">
      <header className="event-share-header container">
        <Link to="/" className="event-share-logo">
          ORBIT
        </Link>
        <ThemeToggle />
      </header>

      <div className="event-share-container">
        <div className="event-share-gradient gradient-1" />
        <div className="event-share-gradient gradient-2" />

        <article className="event-share-card">
          <img
            className="event-share-cover"
            src={meta.image}
            alt=""
            onError={(e) => {
              e.currentTarget.src = FALLBACK.image;
            }}
          />
          <div className="event-share-body">
            <p className="event-share-brand">ORBIT</p>
            <h1 className="event-share-title">{loading ? 'Loading event…' : meta.title}</h1>
            <p className="event-share-text">{meta.description}</p>
            <div className="event-share-actions">
              <a className="event-share-btn event-share-btn--primary" href={pageUrl}>
                Open in Orbit
              </a>
              <a
                className="event-share-btn event-share-btn--secondary"
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get it on Google Play
              </a>
              {APP_STORE_URL ? (
                <a
                  className="event-share-btn event-share-btn--secondary"
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download on the App Store
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
