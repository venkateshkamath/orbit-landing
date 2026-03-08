import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./DiscoverMap.css";

const NAMES = [
  "Arjun",
  "Aisha",
  "Rohan",
  "Meera",
  "Kabir",
  "Nisha",
  "Siddharth",
  "Ananya"
];

const DISTANCE_RANGES = [
  [900, 1100],
  [1400, 1600],
  [1900, 2100],
  [2500, 2700]
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRadarPosition(distance) {

  const maxRadarRadius = 45;
  const minRadarRadius = 12;

  const normalized = distance / 3000;

  const radarRadius =
    minRadarRadius + normalized * (maxRadarRadius - minRadarRadius);

  const angle = Math.random() * Math.PI * 2;

  const x = 50 + radarRadius * Math.cos(angle);
  const y = 50 + radarRadius * Math.sin(angle);

  return {
    top: `${y}%`,
    left: `${x}%`
  };

}

function generatePeople() {

  return DISTANCE_RANGES.map((range, i) => {

    const distance = randomBetween(range[0], range[1]);
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const position = getRadarPosition(distance);

    return {
      id: i,
      name,
      initial: name.charAt(0),
      distance,
      ...position
    }

  })

}

export default function DiscoverMap() {

  const sectionRef = useRef(null);

  const [radius, setRadius] = useState(300);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    setPeople(generatePeople());
  }, []);

  const visiblePeople = people.filter(p => p.distance <= radius);

  useEffect(() => {

    const dots = sectionRef.current.querySelectorAll(".hero__dot");

    dots.forEach((dot, i) => {

      gsap.to(dot, {
        y: 20 + i * 8,
        x: 15 + i * 5,
        duration: 5 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.4
      });

    });

  }, []);

  return (
    <section ref={sectionRef} className="orbit-section">
      {/* Background reused from HERO */}
      <div className="hero__bg hero__bg--discover">
        <div className="hero__gradient hero__gradient--1"></div>
        <div className="hero__gradient hero__gradient--2"></div>
        <div className="hero__gradient hero__gradient--3"></div>
        <div className="hero__dot hero__dot--1"></div>
        <div className="hero__dot hero__dot--2"></div>
        <div className="hero__dot hero__dot--3"></div>
        <div className="hero__dot hero__dot--4"></div>
        <div className="hero__dot hero__dot--5"></div>
      </div>
      <div className="orbit-container">
        <div className="orbit-left">
          <h2>
            See who's nearby.<br />
            Right now.
          </h2>
          <p>
            ORBIT shows you real people nearby who share your interests.
          </p>
          <div className="radius-box">
            <div className="radius-header">
              <span>DISCOVERY RADIUS</span>
              <span className="radius-value">{radius}m</span>
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
              <span>100m</span>
              <span>3km</span>
            </div>
            <p className="radius-count">
              <span>{visiblePeople.length} people</span> within your radius
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
            {people.map(person => {
              const visible = person.distance <= radius;
              return (
                <div
                  key={person.id}
                  className={`person ${visible ? "show" : "hide"}`}
                  style={{
                    top: person.top,
                    left: person.left
                  }}
                >
                  {person.initial}
                  {visible && (
                    <div className="distance">
                      {person.distance}m
                    </div>
                  )}
                </div>
              )
            })}
            <div className="nearby-badge">
              ● {visiblePeople.length} nearby
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}