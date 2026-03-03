import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Gallery from './components/Gallery';
import HowItWorks from './components/HowItWorks';
import Community from './components/Community';
import FAQ from './components/FAQ';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';
import WaitlistModal from './components/WaitlistModal';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

gsap.registerPlugin(ScrollTrigger);

function LandingPage({ onJoinWaitlist }) {
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Cleanup ScrollTrigger on unmount
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <>
      <Navbar onJoinWaitlist={onJoinWaitlist} />
      <main>
        <Hero onJoinWaitlist={onJoinWaitlist} />
        <Gallery />
        <Features />
        <HowItWorks />
        <Community />
        <FAQ />
        <Waitlist onJoinWaitlist={onJoinWaitlist} />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onJoinWaitlist={openModal} />} />
        <Route 
          path="/orbit-admin" 
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          } 
        />
        {/* Redirect old dashboard link to admin */}
        <Route path="/dashboard" element={<Navigate to="/orbit-admin" replace />} />
      </Routes>
      <WaitlistModal isOpen={isModalOpen} onClose={closeModal} />
    </Router>
  );
}
