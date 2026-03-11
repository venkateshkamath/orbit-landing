import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Community.css';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Anish Shetty',
    handle: '@anishshetty',
    text: 'I wasn’t expecting much when I first tried ORBIT, but it actually helped me connect with people who share the same interests as me. The events feel natural and not forced like most networking apps.',
    avatar: 'A',
    gradient: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
  },
  {
    name: `Sneha D'Souza`,
    handle: '@sneha_dsouza',
    text: 'What I like most about ORBIT is how easy it is to discover things happening around you. I’ve already joined a couple of small events and met some really nice people.',
    avatar: 'S',
    gradient: 'linear-gradient(135deg, #C4B5FD, #818CF8)',
  },
  {
    name: 'Rohit Pai',
    handle: '@rohitpai',
    text: 'Most apps focus on chatting online, but ORBIT actually helps you meet people in real life. It feels refreshing and much more meaningful.',
    avatar: 'R',
    gradient: 'linear-gradient(135deg, #5EEAD4, #34D399)',
  },
  {
    name: 'Karan Patel',
    handle: '@karanp',
    text: 'I joined ORBIT just out of curiosity, but it quickly became something I use regularly. It’s simple, well designed, and makes socializing feel effortless.',
    avatar: 'K',
    gradient: 'linear-gradient(135deg, #FFB347, #F59E0B)',
  },
];

const stats = [
  { value: '300+', label: 'Waitlist signups' },
  { value: '5+', label: 'Cities planned' },
  { value: '89%', label: 'Want offline connections' },
  { value: '∞', label: 'Real memories to make' },
];

export default function Community() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.community__header',
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.community__header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.community__card',
        {
          y: 40,
          opacity: 0,
          scale: 0.96,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.community__grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.community__stat',
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.community__stats',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="community" id="community">
      <div className="container">
        <div className="community__header">
          <span className="section-label">Community</span>
          <h2 className="community__title">
            People are already
            <br />
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
              {/* <div className="community__card-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFB347" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div> */}
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
