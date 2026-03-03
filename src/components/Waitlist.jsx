import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Waitlist.css';

gsap.registerPlugin(ScrollTrigger);

export default function Waitlist({ onJoinWaitlist }) {
  const sectionRef = useRef(null);


  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.waitlist__card', {
        y: 50, opacity: 0, scale: 0.97,
      }, {
        y: 0, opacity: 1, scale: 1, duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.waitlist__card',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);



  return (
    <section ref={sectionRef} className="waitlist" id="waitlist">
      <div className="container">
        <div className="waitlist__card">
          {/* Decorative elements */}
          <div className="waitlist__decor waitlist__decor--1"></div>
          <div className="waitlist__decor waitlist__decor--2"></div>
          <div className="waitlist__decor waitlist__decor--3"></div>

          <div className="waitlist__content">
            <span className="section-label" style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white' }}>
              Join the Waitlist
            </span>
            <h2 className="waitlist__title">
              Ready to leave<br />the algorithm behind?
            </h2>
            <p className="waitlist__subtitle">
              Be among the first to experience ORBIT. Join our waitlist and help shape the future of real-world connections.
            </p>

            {/* CTA button to open modal */}
            <button className="waitlist__btn" onClick={onJoinWaitlist} id="waitlist-submit">
              Get Early Access
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <p className="waitlist__disclaimer">
              No spam, ever. We respect your inbox as much as your time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
