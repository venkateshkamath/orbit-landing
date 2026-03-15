import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Hero.css';

const formatAvatarCount = (count) => {
  if (count < 1000) {
    return `+${Math.floor(count / 100) * 100}`;
  }

  const thousands = count / 1000;
  return `+${thousands.toFixed(1).replace(/\.0$/, '')}k`;
};

export default function Hero({ onJoinWaitlist }) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const badgeRef = useRef(null);
  const visualRef = useRef(null);
  const [waitlistCount, setWaitlistCount] = useState(328); // Base "vibe" count

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
          <span className="hero__title-line">Real Connections.</span>
          <span className="hero__title-line">
            <span className="gradient-text">Not Just Followers.</span>
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

        <div ref={visualRef} className="hero__visual" style={{ opacity: 0 }}>
          {/* Pure CSS/SVG Animated Orbits */}
          <div className="orbit-system">
            <div className="orbit-center">
              <div className="orbit-center-orb">
                <span>O</span>
              </div>
            </div>

            {/* Ring 1 - smallest */}
            <div className="orbit-ring orbit-ring--1">
              <div className="orbit-person orbit-person--1" style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFB347)' }}>A</span>
              </div>
              <div className="orbit-person orbit-person--4" style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' }}>
                <span style={{ background: 'linear-gradient(135deg, #FFB347, #F59E0B)' }}>R</span>
              </div>
            </div>

            {/* Ring 2 - medium */}
            <div className="orbit-ring orbit-ring--2">
              <div className="orbit-person orbit-person--2" style={{ top: '15%', right: 0, transform: 'translate(50%, -50%)' }}>
                <span style={{ background: 'linear-gradient(135deg, #C4B5FD, #818CF8)' }}>M</span>
              </div>
              <div className="orbit-person orbit-person--5" style={{ bottom: '15%', left: 0, transform: 'translate(-50%, 50%)' }}>
                <span style={{ background: 'linear-gradient(135deg, #5EEAD4, #34D399)' }}>P</span>
              </div>
            </div>

            {/* Ring 3 - largest */}
            <div className="orbit-ring orbit-ring--3">
              <div className="orbit-person orbit-person--3" style={{ top: '50%', right: 0, transform: 'translate(50%, -50%)' }}>
                <span style={{ background: 'linear-gradient(135deg, #5EEAD4, #A78BFA)' }}>D</span>
              </div>
              <div className="orbit-person orbit-person--6" style={{ top: '50%', left: 0, transform: 'translate(-50%, -50%)' }}>
                <span style={{ background: 'linear-gradient(135deg, #FF6B6B, #C4B5FD)' }}>S</span>
              </div>
            </div>

            {/* Decorative floating dots on orbits */}
            <div className="orbit-ring orbit-ring--1">
              <div className="orbit-dot" style={{ top: '50%', right: 0, background: '#FF6B6B' }}></div>
            </div>
            <div className="orbit-ring orbit-ring--2">
              <div className="orbit-dot" style={{ bottom: 0, left: '50%', background: '#C4B5FD' }}></div>
            </div>
            <div className="orbit-ring orbit-ring--3">
              <div className="orbit-dot" style={{ top: 0, left: '30%', background: '#5EEAD4' }}></div>
            </div>
          </div>
          <div className="hero__visual-glow"></div>

          {/* social proof */}
          <div className="hero__social-proof">
            <div className="hero__avatars">
              <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFB347)' }}>V</div>
              <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #C4B5FD, #818CF8)' }}>A</div>
              <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #5EEAD4, #34D399)' }}>S</div>
              <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #FFB347, #F59E0B)' }}>R</div>
              <div className="hero__avatar hero__avatar--count">{formatAvatarCount(waitlistCount)}</div>
            </div>
            <p className="hero__social-text">{waitlistCount.toLocaleString()} people on the waitlist</p>
          </div>
        </div>
      </div>
    </section>
  );
}
