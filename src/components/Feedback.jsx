import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bug,
  ImagePlus,
  Lightbulb,
  MessageSquare,
  Paintbrush,
  ShieldAlert,
  X,
  Zap,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './Feedback.css';

const CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'ui', label: 'UI / Design', icon: Paintbrush },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'safety', label: 'Privacy / Safety', icon: ShieldAlert },
  { id: 'other', label: 'Other', icon: MessageSquare },
];

const MAX_SCREENSHOTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content: base64,
        preview: result,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function Feedback() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const initialCategory = useMemo(() => {
    const fromQuery = (searchParams.get('category') || '').toLowerCase();
    return CATEGORIES.some((c) => c.id === fromQuery) ? fromQuery : '';
  }, [searchParams]);

  const [category, setCategory] = useState(initialCategory);
  const [name, setName] = useState(searchParams.get('name') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const appMeta = useMemo(() => ({
    source: searchParams.get('source') || 'web',
    platform: searchParams.get('platform') || '',
    version: searchParams.get('version') || '',
  }), [searchParams]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setErrorMsg('');
    const remaining = MAX_SCREENSHOTS - screenshots.length;
    if (remaining <= 0) {
      setErrorMsg(`You can attach up to ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }

    const next = [];
    for (const file of files.slice(0, remaining)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMsg('Screenshots must be PNG, JPG, WEBP, or GIF.');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg('Each screenshot must be under 5MB.');
        continue;
      }
      try {
        next.push(await fileToBase64(file));
      } catch {
        setErrorMsg('Could not read one of the images. Please try again.');
      }
    }

    if (next.length) {
      setScreenshots((prev) => [...prev, ...next].slice(0, MAX_SCREENSHOTS));
    }
  };

  const removeScreenshot = (index) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    if (!category) {
      setErrorMsg('Please select a category.');
      return;
    }
    if (!email.trim() || !message.trim()) {
      setErrorMsg('Email and message are required.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          screenshots: screenshots.map(({ name: fileName, type, content }) => ({
            name: fileName,
            type,
            content,
          })),
          meta: appMeta,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong.');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Could not connect to server. Please try again.');
    }
  };

  const resetForm = () => {
    setCategory(initialCategory);
    setName(searchParams.get('name') || '');
    setEmail(searchParams.get('email') || '');
    setMessage('');
    setScreenshots([]);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="feedback-page">
      <header className="feedback-header container">
        <Link to="/" className="feedback-logo">
          ORBIT
        </Link>
        <ThemeToggle />
      </header>

      <div className="feedback-shell">
        <div className="feedback-gradient feedback-gradient--1" />
        <div className="feedback-gradient feedback-gradient--2" />

        <div className="feedback-card">
          {status === 'success' ? (
            <div className="feedback-success">
              <div className="feedback-success-icon" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="feedback-title">Thanks for the feedback</h1>
              <p className="feedback-subtitle">
                We got your message{email ? <> at <strong>{email}</strong></> : null}. The Orbit team will review it soon.
              </p>
              <div className="feedback-success-actions">
                <button type="button" className="feedback-submit" onClick={resetForm}>
                  Send another
                </button>
                <Link to="/" className="feedback-secondary-link">
                  <ArrowLeft size={16} />
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="feedback-eyebrow">Help us improve</p>
              <h1 className="feedback-title">Send feedback</h1>
              <p className="feedback-subtitle">
                Report a bug, request a feature, or share anything that would make Orbit better.
                Screenshots are optional, but helpful when you have them.
              </p>

              {(appMeta.platform || appMeta.version) && (
                <p className="feedback-meta">
                  From app
                  {appMeta.platform ? ` · ${appMeta.platform}` : ''}
                  {appMeta.version ? ` · v${appMeta.version}` : ''}
                </p>
              )}

              <form className="feedback-form" onSubmit={handleSubmit}>
                <fieldset className="feedback-field">
                  <legend className="feedback-label">Category</legend>
                  <div className="feedback-categories" role="radiogroup" aria-label="Feedback category">
                    {CATEGORIES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={category === id}
                        className={`feedback-category ${category === id ? 'is-selected' : ''}`}
                        onClick={() => setCategory(id)}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="feedback-row">
                  <div className="feedback-field">
                    <label className="feedback-label" htmlFor="feedback-name">Name <span className="feedback-optional">(optional)</span></label>
                    <input
                      id="feedback-name"
                      className="feedback-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                  <div className="feedback-field">
                    <label className="feedback-label" htmlFor="feedback-email">Email</label>
                    <input
                      id="feedback-email"
                      className="feedback-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="feedback-field">
                  <label className="feedback-label" htmlFor="feedback-message">Details</label>
                  <textarea
                    id="feedback-message"
                    className="feedback-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What happened? What were you trying to do? Any steps to reproduce?"
                    rows={6}
                    required
                    maxLength={4000}
                  />
                </div>

                <div className="feedback-field">
                  <span className="feedback-label">
                    Screenshots <span className="feedback-optional">(optional · up to {MAX_SCREENSHOTS})</span>
                  </span>

                  <div className="feedback-screenshots">
                    {screenshots.map((shot, index) => (
                      <div key={`${shot.name}-${index}`} className="feedback-shot">
                        <img src={shot.preview} alt={`Screenshot ${index + 1}`} />
                        <button
                          type="button"
                          className="feedback-shot-remove"
                          onClick={() => removeScreenshot(index)}
                          aria-label={`Remove screenshot ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {screenshots.length < MAX_SCREENSHOTS && (
                      <button
                        type="button"
                        className="feedback-upload"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus size={20} />
                        <span>Add image</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    multiple
                    hidden
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>

                {errorMsg && <p className="feedback-error">{errorMsg}</p>}

                <button type="submit" className="feedback-submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? (
                    <span className="feedback-spinner" />
                  ) : (
                    'Submit feedback'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
