import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Gallery.css';

gsap.registerPlugin(ScrollTrigger);

const images = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
    alt: 'Friends laughing together at sunset',
    caption: 'Reclaim your evening',
    span: 'large', 
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    alt: 'People connecting over coffee',
    caption: 'Share real moments',
    span: 'wide', 
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    alt: 'Group having fun outdoors',
    caption: 'Find your tribe',
    span: 'small',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=800&q=80',
    alt: 'Friends at cafe laughing',
    caption: 'Laugh louder',
    span: 'small', 
  }
];

export default function Gallery() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.gallery__header', {
        y: 40, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.gallery__header',
          start: 'top 85%',
        }
      });

      // Bento box stagger animation
      gsap.fromTo('.bento-item', {
        y: 40, opacity: 0, scale: 0.95
      }, {
        y: 0, opacity: 1, scale: 1, duration: 0.6,
        stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bento-grid',
          start: 'top 90%',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="gallery" id="gallery">
      {/* Dynamic background glow */}
      <div className="gallery__glow gallery__glow--1"></div>
      <div className="gallery__glow gallery__glow--2"></div>

      <div className="container">
        <div className="gallery__header">
          <span className="section-label">Real Life</span>
          <h2 className="gallery__title">
            Stop Scrolling.<br />
            <span className="gradient-text">Start Living.</span>
          </h2>
          <p className="gallery__subtitle">
            ORBIT is about the moments that happen when you finally put your phone down and look up. Discover the beauty of offline connections.
          </p>
        </div>

        <div className="bento-grid">
          {images.map((img) => (
            <div key={img.id} className={`bento-item bento-item--${img.span}`}>
              <div className="bento-item__inner">
                <img src={img.src} alt={img.alt} loading="lazy" />
                <div className="bento-overlay">
                  <div className="bento-overlay__content">
                    <span className="bento-overlay__icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </span>
                    <p className="bento-caption">{img.caption}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
