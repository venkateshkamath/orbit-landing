import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HowItWorks.css';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Tell us about your interests, passions, and what kind of connections you\'re looking for. No pressure, no perfection needed.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Discover Your Orbit',
    description: 'We surface people and events nearby that match your vibe — coffee lovers, hikers, artists, gamers, you name it.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4"/>
        <line x1="21.17" y1="8" x2="12" y2="8"/>
        <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
        <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Meet & Connect',
    description: 'Show up, say hi, and let real conversations happen. We handle the logistics so you can focus on the moment.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Grow Your Circle',
    description: 'Keep building meaningful relationships. Your orbit grows organically through shared experiences and moments.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.how__header', {
        y: 40, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.8,
        scrollTrigger: {
          trigger: '.how__header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });

      stepsRef.current.forEach((step, i) => {
        gsap.fromTo(step, {
          x: i % 2 === 0 ? -40 : 40,
          opacity: 0,
        }, {
          x: 0, opacity: 1, duration: 0.7,
          scrollTrigger: {
            trigger: step,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          }
        });
      });

      // Animate the connecting line
      gsap.fromTo('.how__connector-line', {
        scaleY: 0,
      }, {
        scaleY: 1, duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.how__steps',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="how" id="how-it-works">
      <div className="container">
        <div className="how__header">
          <span className="section-label">How it Works</span>
          <h2 className="how__title">
            From screen to<br />
            <span className="gradient-text">real life</span> in 4 steps
          </h2>
          <p className="how__subtitle">
            Getting started is effortless. No complicated onboarding, no awkward matchmaking.
          </p>
        </div>

        <div className="how__steps">
          <div className="how__connector">
            <div className="how__connector-line"></div>
          </div>

          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={el => stepsRef.current[i] = el}
              className={`how__step ${i % 2 === 0 ? 'how__step--left' : 'how__step--right'}`}
            >
              <div className="how__step-marker">
                <span className="how__step-number">{step.number}</span>
              </div>
              <div className="how__step-card">
                <div className="how__step-icon">{step.icon}</div>
                <h3 className="how__step-title">{step.title}</h3>
                <p className="how__step-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
