import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Features.css';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    image: '/feature-discover.png',
    name: 'Discover Nearby',
    role: 'Find people with shared interests in your neighborhood. No endless swiping — just real, curated connections.',
    followers: 312,
    posts: 48,
    verified: true
  },
  {
    image: '/feature-events.png',
    name: 'Join Local Events',
    role: 'Browse and join community events, meetups, and micro-hangouts happening around you — all in real time.',
    followers: 210,
    posts: 35,
    verified: true
  },
  {
    image: '/feature-circles.png',
    name: 'Build Your Circle',
    role: 'Create tight-knit groups with people who get you. Share moments, plan outings, and grow together.',
    followers: 198,
    posts: 29,
    verified: false
  }
];

export default function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo('.features__header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.features__header',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: i * 0.15,
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="features" id="features">

      <div className="container">

        <div className="features__header">
          <span className="section-label">Features</span>

          <h2 className="features__title">
            Everything you need to <br />
            <span className="gradient-text">connect offline</span>
          </h2>

          <p className="features__subtitle">
            ORBIT is built for real world connections. No algorithms deciding
            your friendships — just genuine moments.
          </p>
        </div>

        <div className="features__grid">

          {features.map((feature, i) => (

            <div
              key={feature.name}
              ref={(el) => (cardsRef.current[i] = el)}
              className="profile-card"
            >

              <img
                src={feature.image}
                alt={feature.name}
                className="profile-card__image"
              />

              <div className="profile-overlay">

                <h3 className="profile-name">
                  {feature.name}
                  {feature.verified && (
                    <span className="verified">✔</span>
                  )}
                </h3>

                <p className="profile-role">
                  {feature.role}
                </p>

                <div className="profile-meta">

                  <div className="meta-item">
                    👤 {feature.followers}
                  </div>

                  <div className="meta-item">
                    📁 {feature.posts}
                  </div>

                  <button className="follow-btn">
                    Follow +
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}