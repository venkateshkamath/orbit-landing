import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import './WaitlistModal.css';

export default function WaitlistModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [localCities, setLocalCities] = useState([]); // from DB
  const [searching, setSearching] = useState(false);
  const cityInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch local cities once on mount (popular cities)
  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => setLocalCities(d.cities || []))
      .catch(() => {});
  }, []);

  // Filter & fetch global cities as user types
  const handleCityChange = useCallback((val) => {
    setCity(val);
    setHighlightIdx(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length === 0) {
      setCitySuggestions(localCities.slice(0, 8));
      setShowDropdown(localCities.length > 0);
      setSearching(false);
      return;
    }

    setSearching(true);
    setShowDropdown(true);

    debounceRef.current = setTimeout(async () => {
      try {
        // Query OpenStreetMap for real global cities
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&featuretype=city&limit=5`, {
          headers: { 'Accept-Language': 'en-US,en;q=0.9' }
        });
        const data = await res.json();
        
        // Extract clean city and country names (e.g., "Paris, Île-de-France, France" -> "Paris, France")
        const globalCities = data.map(d => {
             const parts = d.display_name.split(',');
             const city = parts[0].trim();
             const country = parts.length > 1 ? parts[parts.length - 1].trim() : '';
             return country ? `${city}, ${country}` : city;
        });
        
        // Merge with local matches
        const q = val.toLowerCase();
        const localMatches = localCities.filter(c => c.toLowerCase().includes(q));
        
        const merged = [...new Set([...globalCities, ...localMatches])].slice(0, 8);
        setCitySuggestions(merged);
      } catch (err) {
        // Fallback to local only on network error
        const q = val.toLowerCase();
        const localMatches = localCities.filter(c => c.toLowerCase().includes(q));
        setCitySuggestions(localMatches.slice(0, 8));
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce
  }, [localCities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        cityInputRef.current && !cityInputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleCityKeyDown = (e) => {
    if (!showDropdown || citySuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => (prev < citySuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => (prev > 0 ? prev - 1 : citySuggestions.length - 1));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      selectCity(citySuggestions[highlightIdx]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const selectCity = (name) => {
    setCity(name);
    setShowDropdown(false);
    setHighlightIdx(-1);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Animate in
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)', delay: 0.1 }
      );
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.97, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        setStatus('idle');
        setEmail('');
        setCity('');
        setAge('');
        setErrorMsg('');
        setShowDropdown(false);
        onClose();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !city || !age || status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');
    setShowDropdown(false);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city, age }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong.');
        return;
      }

      setStatus('success');
      // Success animation
      gsap.fromTo('.modal__success',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    } catch (err) {
      setStatus('error');
      setErrorMsg('Could not connect to server. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={handleClose}>
      <div ref={modalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal__close" onClick={handleClose} aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Decorative gradient blobs */}
        <div className="modal__decor modal__decor--1"></div>
        <div className="modal__decor modal__decor--2"></div>

        {status !== 'success' ? (
          <div className="modal__body">
            <div className="modal__brand">ORBIT</div>

            <h2 className="modal__title"><span className="gradient-text">Join the Waitlist</span></h2>
            <p className="modal__subtitle">
              Be among the first to experience ORBIT. We'll notify you when we launch in your city.
            </p>

            <form className="modal__form" onSubmit={handleSubmit}>
              <div className="modal__field">
                <label className="modal__label" htmlFor="modal-email">Email Address</label>
                <div className="modal__input-wrap">
                  <svg className="modal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="modal-email"
                    className="modal__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal__field modal__field--city" style={{ position: 'relative' }}>
                <label className="modal__label" htmlFor="modal-city">Your City</label>
                <div className="modal__input-wrap">
                  <svg className="modal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    ref={cityInputRef}
                    type="text"
                    id="modal-city"
                    className="modal__input"
                    placeholder="Search your city…"
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    onFocus={() => handleCityChange(city)}
                    onKeyDown={handleCityKeyDown}
                    required
                    autoComplete="off"
                  />
                  {searching && (
                    <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                       <span className="modal__spinner" style={{ display: 'block', width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#C4B5FD', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#C4B5FD', borderRadius: '50%' }}></span>
                    </div>
                  )}
                </div>
                {showDropdown && citySuggestions.length > 0 && (
                  <div ref={dropdownRef} className="city-dropdown">
                    {citySuggestions.map((name, i) => (
                      <div
                        key={name}
                        className={`city-dropdown__item ${i === highlightIdx ? 'city-dropdown__item--active' : ''}`}
                        onClick={() => selectCity(name)}
                        onMouseEnter={() => setHighlightIdx(i)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="modal-age">Age Range</label>
                <div className="modal__input-wrap">
                  <svg className="modal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <select
                    id="modal-age"
                    className="modal__input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your age range</option>
                    <option value="16-25">16 - 25</option>
                    <option value="26-35">26 - 35</option>
                    <option value="36-45">36 - 45</option>
                    <option value="46-60">46 - 60</option>
                    <option value="60+">Above 60</option>
                  </select>
                </div>
              </div>

              {errorMsg && (
                <p className="modal__error">{errorMsg}</p>
              )}

              <button type="submit" className="modal__submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                  <span className="modal__spinner" style={{display: 'block'}}></span>
                ) : (
                  <>
                    Get Early Access
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="modal__disclaimer">No spam, ever. We respect your inbox.</p>
          </div>
        ) : (
          <div className="modal__body modal__success">
            <div className="modal__success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="modal__title">You're on the list! 🎉</h2>
            <p className="modal__subtitle">
              We'll notify you at <strong>{email}</strong> when ORBIT launches.
            </p>
            <button className="modal__submit" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
