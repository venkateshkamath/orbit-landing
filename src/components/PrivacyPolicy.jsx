import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy-wrapper">
      <header className="privacy-policy-header container">
        <Link to="/" className="privacy-policy-logo">
          ORBIT
        </Link>
        <ThemeToggle />
      </header>

      <div className="privacy-policy-container">
        <div className="privacy-policy-gradient gradient-1"></div>
        <div className="privacy-policy-gradient gradient-2"></div>

        <div className="privacy-policy-content">
          <div className="privacy-policy-icon-wrapper">
            <Shield size={64} className="privacy-policy-icon" />
          </div>

          <p className="privacy-policy-badge">Coming Soon</p>

          <h1 className="privacy-policy-title">Privacy Policy</h1>

          <p className="privacy-policy-text">
            We're putting the finishing touches on our privacy policy.
            Check back soon for details on how Orbit protects your data.
          </p>

          <Link to="/" className="privacy-policy-button">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
