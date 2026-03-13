import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./DiscoverMap.css";

gsap.registerPlugin(ScrollTrigger);

const NAMES = [
  "Arjun",
  "Aisha",
  "Rohan",
  "Meera",
  "Kabir",
  "Nisha",
  "Siddharth",
  "Ananya",
];

const GRADIENTS = [
  "linear-gradient(135deg,#FF6B6B,#FFB347)",
  "linear-gradient(135deg,#C4B5FD,#818CF8)",
  "linear-gradient(135deg,#5EEAD4,#34D399)",
  "linear-gradient(135deg,#FFB347,#F59E0B)",
];

const DISTANCE_RANGES = [
  [900, 1100],
  [1400, 1600],
  [1900, 2100],
  [2500, 2700],
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRadarPosition(distance) {
  const maxRadarRadius = 45;
  const minRadarRadius = 12;

  const maxDistance = 3000;

  const normalized = distance / maxDistance;

  const radarRadius =
    minRadarRadius + normalized * (maxRadarRadius - minRadarRadius);

  const angle = Math.random() * Math.PI * 2;

  const x = 50 + radarRadius * Math.cos(angle);
  const y = 50 + radarRadius * Math.sin(angle);

  return { top: `${y}%`, left: `${x}%` };
}

function generatePeople() {
  return DISTANCE_RANGES.map((range, i) => {
    const distance = randomBetween(range[0], range[1]);
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const gradient = GRADIENTS[i % GRADIENTS.length];
    const position = getRadarPosition(distance);

    return {
      id: i,
      name,
      gradient,
      initial: name.charAt(0),
      distance,
      ...position,
    };
  });
}

export default function DiscoverMap() {
  const sectionRef = useRef(null);

  const [radius, setRadius] = useState(300);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    setPeople(generatePeople());
  }, []);

  const visiblePeople = people.filter((p) => p.distance <= radius);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".orbit-left",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".orbit-left",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        ".radar",
        { scale: 0.92, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          delay: 0.15,
          scrollTrigger: {
            trigger: ".radar",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="orbit-section">
      <div className="orbit-container">
        <div className="orbit-left">
          <h2 className="features__title">
            See who's nearby.
            <br />
            <span className="gradient-text">Right now.</span>
          </h2>

          <p className="orbit-subtitle">
            ORBIT shows you real people nearby, who share your interests.
          </p>

          <div className="radius-box">
            <div className="radius-header">
              <span className="radius-label">Discovery Radius</span>

              <span className="radius-value gradient-text">{radius}m</span>
            </div>

            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="radius-slider"
            />

            <div className="radius-scale">
              <span className="radius-scale-text">100m</span>
              <span className="radius-scale-text">3km</span>
            </div>

            <p className="radius-count">
              <span className="gradient-text">
                {visiblePeople.length} {visiblePeople.length === 1 ? 'person' : 'people'}
              </span>
              <span className="radius-count-text"> within your radius</span>
            </p>
          </div>
        </div>

        <div className="orbit-right">
          <div className="radar">
            <div className="ring ring1"></div>
            <div className="ring ring2"></div>
            <div className="ring ring3"></div>
            <div className="ring ring4"></div>

            <div className="you">You</div>

            {people.map((person) => {
              const visible = person.distance <= radius;

              return (
                <div
                  key={person.id}
                  className={`person ${visible ? "show" : "hide"}`}
                  style={{
                    top: person.top,
                    left: person.left,
                    background: person.gradient,
                  }}
                >
                  {person.initial}

                  {visible && (
                    <div className="distance">{person.distance}m</div>
                  )}
                </div>
              );
            })}

            <div className="nearby-badge">● {visiblePeople.length} nearby</div>
          </div>
        </div>
      </div>
    </section>
  );
}
