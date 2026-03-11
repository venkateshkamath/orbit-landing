import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar({ onJoinWaitlist }) {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--menu-open' : ''}`}
        id="navbar"
      >
        <div className="navbar__inner container">
          {/* Logo — always visible */}
          <a
            href="#"
            className="navbar__logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="navbar__logo-text">ORBIT</span>
          </a>

          {/* Desktop nav links (hidden on mobile) */}
          <div className="navbar__desktop-links">
            <button className="navbar__link" onClick={() => scrollTo('features')}>
              Features
            </button>
            <button className="navbar__link" onClick={() => scrollTo('how-it-works')}>
              How it Works
            </button>
            <button className="navbar__link" onClick={() => scrollTo('community')}>
              Community
            </button>
            <button className="navbar__link" onClick={() => scrollTo('faq')}>
              FAQ
            </button>
          </div>

          {/* Desktop-only actions (hidden on mobile) */}
          <div className="navbar__actions">
            <ThemeToggle />
            <button className="navbar__cta" onClick={onJoinWaitlist}>
              Join Waitlist
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu — rendered via portal to escape navbar stacking context */}
      {createPortal(
        <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
          <button className="navbar__link" onClick={() => scrollTo('features')}>
            Features
          </button>
          <button className="navbar__link" onClick={() => scrollTo('how-it-works')}>
            How it Works
          </button>
          <button className="navbar__link" onClick={() => scrollTo('community')}>
            Community
          </button>
          <button className="navbar__link" onClick={() => scrollTo('faq')}>
            FAQ
          </button>
          <div className="navbar__mobile-extras">
            <ThemeToggle />
            <button
              className="navbar__cta-mobile"
              onClick={() => {
                setMenuOpen(false);
                onJoinWaitlist();
              }}
            >
              Join Waitlist
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
