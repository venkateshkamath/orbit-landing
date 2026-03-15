import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Gallery.css";

gsap.registerPlugin(ScrollTrigger);

const imageUrls = [
  "https://images.pexels.com/photos/4453153/pexels-photo-4453153.jpeg",
  "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg",
  "https://img.freepik.com/premium-photo/group-four-indian-friends-outdoors-smiling-laughing-tree_53876-1077347.jpg",
  "https://images.pexels.com/photos/8818592/pexels-photo-8818592.jpeg",
];

const images = [
  {
    id: 1,
    src: imageUrls[0],
    alt: "Friends laughing together at sunset",
    caption: "Reclaim your evening",
    span: "large",
  },
  {
    id: 2,
    src: imageUrls[1],
    alt: "People connecting over coffee",
    caption: "Share real moments",
    span: "wide",
  },
  {
    id: 3,
    src: imageUrls[2],
    alt: "Group having fun outdoors",
    caption: "Find your tribe",
    span: "small",
  },
  {
    id: 4,
    src: imageUrls[3],
    alt: "Friends at cafe laughing",
    caption: "Laugh louder",
    span: "small",
  },
];

export default function Gallery() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".gallery__header",
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gallery__header",
            start: "top 85%",
          },
        },
      );

      // Bento box stagger animation
      gsap.fromTo(
        ".bento-item",
        {
          y: 40,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 90%",
          },
        },
      );
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
          <h2 className="gallery__title">
            Find Your People
            <br />
            <span className="gradient-text">Closer Than You Think.</span>
          </h2>
          <p className="gallery__subtitle">
            Orbit is about the moments that happen when you put your phone down
            and look up. Find like-minded people. Build your orbit. Go meet
            them. Real people. Real places. Real experiences.
          </p>
        </div>

        <div className="bento-grid">
          {images.map((img) => (
            <div key={img.id} className={`bento-item bento-item--${img.span}`}>
              <div className="bento-item__inner">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                />
                <div className="bento-overlay">
                  <div className="bento-overlay__content">
                    <span className="bento-overlay__icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
