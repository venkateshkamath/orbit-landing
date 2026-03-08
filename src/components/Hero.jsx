import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Hero.css';

export default function Hero({ onJoinWaitlist }) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const badgeRef = useRef(null);
  const visualRef = useRef(null);
  const [waitlistCount, setWaitlistCount] = useState(2438); // Base "vibe" count

  useEffect(() => {
    // Fetch live count from our Supabase-backed server
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/waitlist/count');
        const data = await res.json();
        if (data.count > 0) {
          // Add real signups on top of our launch base
          setWaitlistCount(2438 + data.count);
        }
      } catch (err) {
        console.warn('Could not fetch live waitlist count:', err);
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(badgeRef.current,
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.4 }
      )
      .fromTo(titleRef.current.children,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
        '-=0.3'
      )
      .fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(ctaRef.current.children,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
        '-=0.3'
      )
      .fromTo(visualRef.current,
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1 },
        '-=0.4'
      );

      // Orbit ring rotations
      gsap.to('.orbit-ring--1', { rotation: 360, duration: 18, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-ring--2', { rotation: -360, duration: 24, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-ring--3', { rotation: 360, duration: 30, repeat: -1, ease: 'none', transformOrigin: 'center center' });

      // Pulse the center
      gsap.to('.orbit-center', {
        scale: 1.1, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      // Counter-rotate the person icons so they stay upright
      gsap.to('.orbit-person--1', { rotation: -360, duration: 18, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-person--2', { rotation: 360, duration: 24, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-person--3', { rotation: -360, duration: 30, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-person--4', { rotation: -360, duration: 18, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-person--5', { rotation: 360, duration: 24, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.orbit-person--6', { rotation: -360, duration: 30, repeat: -1, ease: 'none', transformOrigin: 'center center' });

      // Floating dots
      const dots = heroRef.current.querySelectorAll('.hero__dot');
      dots.forEach((dot, i) => {
        gsap.to(dot, {
          y: `${15 + i * 5}`,
          x: `${10 + i * 3}`,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="hero" id="hero">
      {/* Background decorations */}
      <div className="hero__bg">
        <div className="hero__gradient hero__gradient--1"></div>
        <div className="hero__gradient hero__gradient--2"></div>
        <div className="hero__gradient hero__gradient--3"></div>
        <div className="hero__dot hero__dot--1"></div>
        <div className="hero__dot hero__dot--2"></div>
        <div className="hero__dot hero__dot--3"></div>
        <div className="hero__dot hero__dot--4"></div>
        <div className="hero__dot hero__dot--5"></div>
      </div>

      <div className="hero__content container">
        <div ref={badgeRef} className="hero__badge" style={{ opacity: 0 }}>
          <span className="hero__badge-dot"></span>
          Launching Soon — Be the First
        </div>

        <h1 ref={titleRef} className="hero__title">
          <span className="hero__title-line">Find your people.</span>
          <span className="hero__title-line">
            <span className="gradient-text">Build your orbit.</span>
          </span>
        </h1>

        <p ref={subtitleRef} className="hero__subtitle" style={{ opacity: 0 }}>
          ORBIT helps you discover local events, meet like-minded people,
          and build friendships that exist beyond the screen.
        </p>

        <div ref={ctaRef} className="hero__cta-group">
          <button className="hero__cta hero__cta--primary" onClick={onJoinWaitlist}>
            Join the Waitlist
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="hero__cta hero__cta--secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
            See How it Works
          </button>
        </div>

        
      </div>
    </section>
  );
}
