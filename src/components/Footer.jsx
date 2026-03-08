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
          <div className="footer__contact">
            <a href="mailto:hello@joinorbit.org" className="footer__contact-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              hello@joinorbit.org
            </a>
          </div>
        </div>
        <div className="footer__quote-container">
          <blockquote className="footer__quote">
            "The best version of you is waiting offline."
            <cite className="footer__quote-author">— The Orbit Team</cite>
          </blockquote>
        </div>
      </div>

      <div className="footer__bottom container">
        <p className="footer__copyright">
          © {new Date().getFullYear()} ORBIT. All rights reserved. Made with ❤️ for real connections.
        </p>
      </div>
    </footer>
  );
}
