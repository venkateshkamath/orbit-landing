import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Features.css";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "/feature-discover.png",
    title: "Discover Nearby",
    description:
      "Find people with shared interests in your neighborhood. No endless swiping — just real, curated connections.",
    tag: "Discovery",
    color: "#FF6B6B",
  },
  {
    icon: "/feature-events.png",
    title: "Join Local Events",
    description:
      "Browse and join community events, meetups, and micro-hangouts happening around you — all in real time.",
    tag: "Events",
    color: "#C4B5FD",
  },
  {
    icon: "/feature-circles.png",
    title: "Build Your Circle",
    description:
      "Create tight-knit groups with people who get you. Share moments, plan outings, and grow together.",
    tag: "Community",
    color: "#5EEAD4",
  },
];

export default function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section header animation
      gsap.fromTo(
        ".features__header",
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".features__header",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Cards stagger animation
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            y: 60,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: i * 0.15,
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
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
            Everything you need to
            <br />
            <span className="gradient-text">connect offline</span>
          </h2>
          <p className="features__subtitle">
            ORBIT is built for real-world connections. No algorithms deciding
            your friendships — just genuine moments.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => (cardsRef.current[i] = el)}
              className="features__card"
              style={{ "--card-accent": feature.color }}
            >
              <div className="features__card-image-wrap">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="features__card-image"
                  loading="lazy"
                />
                <div
                  className="features__card-image-glow"
                  style={{
                    background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
                  }}
                ></div>
              </div>
              <div className="features__card-content">
                <span
                  className="features__card-tag"
                  style={{
                    color: feature.color,
                    background: `${feature.color}12`,
                  }}
                >
                  {feature.tag}
                </span>
                <h3 className="features__card-title">{feature.title}</h3>
                <p className="features__card-desc">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
