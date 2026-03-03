import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Community.css';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Aria Chen',
    handle: '@ariachen',
    text: 'I moved to a new city and felt super isolated. ORBIT connected me with a hiking group and now we meet every weekend. Best app ever!',
    avatar: 'A',
    gradient: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
  },
  {
    name: 'Marcus J.',
    handle: '@marcusj_',
    text: 'As someone who works from home, ORBIT has been a game changer. I actually have a social life again — genuine friends, not just online ones.',
    avatar: 'M',
    gradient: 'linear-gradient(135deg, #C4B5FD, #818CF8)',
  },
  {
    name: 'Priya Nakamura',
    handle: '@priya.n',
    text: 'The local events feature is *chef\'s kiss*. Found a pottery class, a book club, and a coffee tasting — all within my first week.',
    avatar: 'P',
    gradient: 'linear-gradient(135deg, #5EEAD4, #34D399)',
  },
  {
    name: 'Devon Park',
    handle: '@devonpark',
    text: 'No cringe ice-breakers, no algorithm tricks. ORBIT just puts you in the right place at the right time with the right people.',
    avatar: 'D',
    gradient: 'linear-gradient(135deg, #FFB347, #F59E0B)',
  },
];

const stats = [
  { value: '2.4K+', label: 'Waitlist signups' },
  { value: '50+', label: 'Cities planned' },
  { value: '89%', label: 'Want offline connections' },
  { value: '∞', label: 'Real memories to make' },
];

export default function Community() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.community__header', {
        y: 40, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.8,
        scrollTrigger: {
          trigger: '.community__header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });

      gsap.fromTo('.community__card', {
        y: 40, opacity: 0, scale: 0.96,
      }, {
        y: 0, opacity: 1, scale: 1, duration: 0.6,
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.community__grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });

      gsap.fromTo('.community__stat', {
        y: 20, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.community__stats',
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="community" id="community">
      <div className="container">
        <div className="community__header">
          <span className="section-label">Community</span>
          <h2 className="community__title">
            People are already<br />
            <span className="gradient-text">buzzing about ORBIT</span>
          </h2>
          <p className="community__subtitle">
            Hear from early adopters who can't wait to reconnect with the real world.
          </p>
        </div>

        <div className="community__grid">
          {testimonials.map((t) => (
            <div key={t.handle} className="community__card">
              <div className="community__card-header">
                <div className="community__card-avatar" style={{ background: t.gradient }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="community__card-name">{t.name}</p>
                  <p className="community__card-handle">{t.handle}</p>
                </div>
              </div>
              <p className="community__card-text">{t.text}</p>
              <div className="community__card-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFB347" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="community__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="community__stat">
              <span className="community__stat-value">{stat.value}</span>
              <span className="community__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
