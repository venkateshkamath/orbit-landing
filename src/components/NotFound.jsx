import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-container">
      {/* Decorative Gradients */}
      <div className="not-found-gradient gradient-1"></div>
      <div className="not-found-gradient gradient-2"></div>

      <div className="not-found-content">
        <div className="not-found-icon-wrapper">
          <Compass size={64} className="not-found-icon" />
        </div>
        
        <h1 className="not-found-title">
          <span className="bg-gradient text-transparent bg-clip-text">404</span>
        </h1>
        
        <h2 className="not-found-subtitle">Lost in Space</h2>
        
        <p className="not-found-text">
          It looks like you've drifted off course. The page you're searching for 
          doesn't exist or has been moved to a different orbit.
        </p>

        <Link to="/" className="not-found-button">
          <ArrowLeft size={18} />
          Return to Launchpad
        </Link>
      </div>
    </div>
  );
}
