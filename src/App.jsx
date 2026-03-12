import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Gallery from "./components/Gallery";
import HowItWorks from "./components/HowItWorks";
import Community from "./components/Community";
import FAQ from "./components/FAQ";
import Waitlist from "./components/Waitlist";
import Footer from "./components/Footer";
import WaitlistModal from "./components/WaitlistModal";
import DiscoverMap from "./components/DiscoverMap";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./components/Dashboard"));
const Login = lazy(() => import("./components/Login"));
const NotFound = lazy(() => import("./components/NotFound"));

gsap.registerPlugin(ScrollTrigger);

function LandingPage({ onJoinWaitlist }) {
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Cleanup ScrollTrigger on unmount
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      <Navbar onJoinWaitlist={onJoinWaitlist} />
      <main>
        <Hero onJoinWaitlist={onJoinWaitlist} />
        <Gallery />
        <Features />
        <DiscoverMap />
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
      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading...</div>}>
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
          <Route
            path="/dashboard"
            element={<Navigate to="/orbit-admin" replace />}
          />
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <WaitlistModal isOpen={isModalOpen} onClose={closeModal} />
    </Router>
  );
}
