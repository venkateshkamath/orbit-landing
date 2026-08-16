import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bug,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Lightbulb,
  MessageSquareText,
  Paintbrush,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './FeedbackDetail.css';

const FEEDBACK_META = {
  bug: { label: 'Bug Report', color: '#FF6B6B', icon: Bug },
  feature: { label: 'Feature Request', color: '#C4B5FD', icon: Lightbulb },
  ui: { label: 'UI / Design', color: '#5EEAD4', icon: Paintbrush },
  performance: { label: 'Performance', color: '#FFB347', icon: Zap },
  safety: { label: 'Privacy / Safety', color: '#818CF8', icon: ShieldAlert },
  other: { label: 'Other', color: '#9CA3B0', icon: MessageSquareText },
};

export default function FeedbackDetail() {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeShot, setActiveShot] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setActiveShot(0);

    fetch(`/api/feedback/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load feedback.');
        if (!cancelled) setFeedback(data.feedback);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load feedback.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const meta = FEEDBACK_META[feedback?.category] || FEEDBACK_META.other;
  const Icon = meta.icon;
  const shots = feedback?.screenshots?.length
    ? feedback.screenshots
    : feedback?.has_screenshot
      ? [`/api/feedback/${feedback.id}/screenshot`]
      : [];

  const goPrev = () => {
    setActiveShot((prev) => (prev - 1 + shots.length) % shots.length);
  };

  const goNext = () => {
    setActiveShot((prev) => (prev + 1) % shots.length);
  };

  return (
    <div className="feedback-detail-page">
      <header className="feedback-detail-header container">
        <Link to="/" className="feedback-detail-logo">ORBIT</Link>
        <ThemeToggle />
      </header>

      <div className="feedback-detail-shell">
        <div className="feedback-detail-card">
          <div className="feedback-detail-top">
            <Link to="/orbit-admin" className="feedback-detail-back">
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
            <span className="feedback-detail-id">#{id}</span>
          </div>

          {loading && <p className="feedback-detail-status">Loading feedback…</p>}
          {error && !loading && <p className="feedback-detail-error">{error}</p>}

          {!loading && !error && feedback && (
            <>
              <div className="feedback-detail-title-row">
                <span className="feedback-detail-badge" style={{ '--badge-color': meta.color }}>
                  <Icon size={14} />
                  {meta.label}
                </span>
                <div className="feedback-detail-date">
                  <Calendar size={14} />
                  {feedback.created_at
                    ? new Date(feedback.created_at).toLocaleString()
                    : '—'}
                </div>
              </div>

              <h1 className="feedback-detail-title">Feedback details</h1>

              <div className="feedback-detail-grid">
                <div className="feedback-detail-field">
                  <span className="feedback-detail-label">Name</span>
                  <p>{feedback.name || '—'}</p>
                </div>
                <div className="feedback-detail-field">
                  <span className="feedback-detail-label">Email</span>
                  <p><a href={`mailto:${feedback.email}`}>{feedback.email}</a></p>
                </div>
                <div className="feedback-detail-field">
                  <span className="feedback-detail-label">Source</span>
                  <p>{feedback.source || '—'}</p>
                </div>
                <div className="feedback-detail-field">
                  <span className="feedback-detail-label">Platform</span>
                  <p>{feedback.platform || '—'}</p>
                </div>
                <div className="feedback-detail-field">
                  <span className="feedback-detail-label">App version</span>
                  <p>{feedback.app_version ? `v${feedback.app_version}` : '—'}</p>
                </div>
                <div className="feedback-detail-field">
                  <span className="feedback-detail-label">Category</span>
                  <p>{meta.label}</p>
                </div>
              </div>

              <div className="feedback-detail-field feedback-detail-message">
                <span className="feedback-detail-label">Message</span>
                <p>{feedback.message || '—'}</p>
              </div>

              <div className="feedback-detail-field">
                <span className="feedback-detail-label">
                  <ImageIcon size={14} /> Screenshots
                  {shots.length > 0 ? ` (${shots.length})` : ''}
                </span>
                {shots.length > 0 ? (
                  <div className="feedback-carousel">
                    <div className="feedback-carousel-main">
                      {shots.length > 1 && (
                        <button
                          type="button"
                          className="feedback-carousel-nav feedback-carousel-nav--prev"
                          onClick={goPrev}
                          aria-label="Previous screenshot"
                        >
                          <ChevronLeft size={20} />
                        </button>
                      )}

                      <a
                        className="feedback-detail-shot"
                        href={shots[activeShot]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          key={shots[activeShot]}
                          src={shots[activeShot]}
                          alt={`Feedback screenshot ${activeShot + 1}`}
                        />
                      </a>

                      {shots.length > 1 && (
                        <button
                          type="button"
                          className="feedback-carousel-nav feedback-carousel-nav--next"
                          onClick={goNext}
                          aria-label="Next screenshot"
                        >
                          <ChevronRight size={20} />
                        </button>
                      )}
                    </div>

                    {shots.length > 1 && (
                      <>
                        <div className="feedback-carousel-counter">
                          {activeShot + 1} / {shots.length}
                        </div>
                        <div className="feedback-carousel-dots" role="tablist" aria-label="Screenshot slides">
                          {shots.map((shot, index) => (
                            <button
                              key={shot}
                              type="button"
                              role="tab"
                              aria-selected={index === activeShot}
                              className={`feedback-carousel-dot ${index === activeShot ? 'is-active' : ''}`}
                              onClick={() => setActiveShot(index)}
                              aria-label={`Show screenshot ${index + 1}`}
                            />
                          ))}
                        </div>
                        <div className="feedback-carousel-thumbs">
                          {shots.map((shot, index) => (
                            <button
                              key={`thumb-${shot}`}
                              type="button"
                              className={`feedback-carousel-thumb ${index === activeShot ? 'is-active' : ''}`}
                              onClick={() => setActiveShot(index)}
                            >
                              <img src={shot} alt={`Thumbnail ${index + 1}`} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="feedback-detail-muted">No screenshot attached.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
