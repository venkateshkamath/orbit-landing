import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FAQ.css';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  // {
  //   q: 'Is ORBIT a dating app?',
  //   a: 'Not at all! ORBIT is about building genuine friendships and community connections. Whether you\'re looking for hiking buddies, study partners, or just someone to grab coffee with — we\'ve got you covered.',
  // },
  {
    q: 'How does ORBIT match people?',
    a: 'We use interest-based discovery, not algorithms. You tell us what you\'re into, and we show you events and people nearby who share your passions. No tricks, no manipulation.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. Privacy is at our core. Your exact location is never shared, your conversations are encrypted, and we never sell your data. Period.',
  },
  {
    q: 'When is ORBIT launching?',
    a: 'We\'re in early development and planning a beta launch in select cities soon. Join the waitlist to be among the first to try it — and to help shape the product!',
  },
  {
    q: 'Is ORBIT free?',
    a: 'The core experience will always be free. We\'re exploring premium features like enhanced event discovery and group tools, but connecting with people will never cost a thing.',
  },
  {
    q: 'What cities will ORBIT be available in?',
    a: 'We\'re starting in major metros and college towns. If you join the waitlist, you can vote for your city and help us prioritize our rollout!',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  const answerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(answerRef.current, {
        height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out',
      });
    } else {
      gsap.to(answerRef.current, {
        height: 0, opacity: 0, duration: 0.3, ease: 'power2.in',
      });
    }
  }, [isOpen]);

  return (
    <div className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}>
      <button className="faq__question" onClick={onToggle}>
        <span>{faq.q}</span>
        <div className="faq__icon">
          <span className="faq__icon-line faq__icon-line--h"></span>
          <span className="faq__icon-line faq__icon-line--v"></span>
        </div>
      </button>
      <div ref={answerRef} className="faq__answer-wrap" style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
        <p className="faq__answer">{faq.a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const sectionRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq__header', {
        y: 40, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.8,
        scrollTrigger: {
          trigger: '.faq__header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });

      gsap.fromTo('.faq__item', {
        y: 20, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.5,
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.faq__list',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="faq" id="faq">
      <div className="hero__bg--discover">
        <div className="hero__gradient hero__gradient--1"></div>
        <div className="hero__gradient hero__gradient--2"></div>
        <div className="hero__gradient hero__gradient--3"></div>
        <div className="hero__dot hero__dot--1"></div>
        <div className="hero__dot hero__dot--2"></div>
        <div className="hero__dot hero__dot--3"></div>
        <div className="hero__dot hero__dot--4"></div>
        <div className="hero__dot hero__dot--5"></div>
      </div>
      <div className="container">
        <div className="faq__header">
          <span className="section-label">FAQ</span>
          <h2 className="faq__title">
            Got questions?<br />
            <span className="gradient-text">We got answers</span>
          </h2>
        </div>

        <div className="faq__list">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
