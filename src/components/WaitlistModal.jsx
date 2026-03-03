import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './WaitlistModal.css';

export default function WaitlistModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Animate in
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)', delay: 0.1 }
      );
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.97, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        setStatus('idle');
        setEmail('');
        setCity('');
        setErrorMsg('');
        onClose();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !city || status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong.');
        return;
      }

      setStatus('success');
      // Success animation
      gsap.fromTo('.modal__success',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    } catch (err) {
      setStatus('error');
      setErrorMsg('Could not connect to server. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={handleClose}>
      <div ref={modalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal__close" onClick={handleClose} aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Decorative gradient blobs */}
        <div className="modal__decor modal__decor--1"></div>
        <div className="modal__decor modal__decor--2"></div>

        {status !== 'success' ? (
          <div className="modal__body">
            <div className="modal__brand">ORBIT</div>
            <div className="modal__icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#modal-g1)" strokeWidth="2"/>
                <ellipse cx="16" cy="16" rx="9" ry="14" transform="rotate(35 16 16)" stroke="url(#modal-g2)" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="4" fill="url(#modal-g1)"/>
                <defs>
                  <linearGradient id="modal-g1" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#FF6B6B"/>
                    <stop offset="100%" stopColor="#5EEAD4"/>
                  </linearGradient>
                  <linearGradient id="modal-g2" x1="4" y1="4" x2="28" y2="28">
                    <stop offset="0%" stopColor="#C4B5FD"/>
                    <stop offset="100%" stopColor="#FF6B6B"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2 className="modal__title"><span className="gradient-text">Join the Waitlist</span></h2>
            <p className="modal__subtitle">
              Be among the first to experience ORBIT. We'll notify you when we launch in your city.
            </p>

            <form className="modal__form" onSubmit={handleSubmit}>
              <div className="modal__field">
                <label className="modal__label" htmlFor="modal-email">Email Address</label>
                <div className="modal__input-wrap">
                  <svg className="modal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="modal-email"
                    className="modal__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="modal-city">Your City</label>
                <div className="modal__input-wrap">
                  <svg className="modal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    type="text"
                    id="modal-city"
                    className="modal__input"
                    placeholder="e.g. Bangalore, Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="modal__error">{errorMsg}</p>
              )}

              <button type="submit" className="modal__submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                  <span className="modal__spinner"></span>
                ) : (
                  <>
                    Get Early Access
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="modal__disclaimer">No spam, ever. We respect your inbox.</p>
          </div>
        ) : (
          <div className="modal__body modal__success">
            <div className="modal__success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="modal__title">You're on the list! 🎉</h2>
            <p className="modal__subtitle">
              We'll notify you at <strong>{email}</strong> when ORBIT launches in <strong>{city}</strong>.
            </p>
            <button className="modal__submit" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
