import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.footer__inner > *', {
        y: 20, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 95%',
          toggleActions: 'play none none reverse',
        }
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-text">ORBIT</span>
          </div>
          <p className="footer__tagline">
            Connecting people in the real world.
            <br />One orbit at a time.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="footer__social" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="footer__social" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.84a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.25z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__links-title">Product</h4>
          <a href="#features" className="footer__link">Features</a>
          <a href="#how-it-works" className="footer__link">How it Works</a>
          <a href="#waitlist" className="footer__link">Join Waitlist</a>
          <a href="#faq" className="footer__link">FAQ</a>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__links-title">Company</h4>
          <a href="#" className="footer__link">About</a>
          <a href="#" className="footer__link">Blog</a>
          <a href="#" className="footer__link">Careers</a>
          <a href="#" className="footer__link">Press</a>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__links-title">Legal</h4>
          <a href="#" className="footer__link">Privacy Policy</a>
          <a href="#" className="footer__link">Terms of Service</a>
          <a href="#" className="footer__link">Cookie Policy</a>
        </div>
      </div>

      <div className="footer__bottom container">
        <p className="footer__copyright">
          © 2026 ORBIT. All rights reserved. Made with ❤️ for real connections.
        </p>
      </div>
    </footer>
  );
}
