import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, MapPin, TrendingUp, Activity, RefreshCw, 
  Download, ChevronLeft, Calendar, Search, 
  Globe, MessageSquareText, Bug,
  Lightbulb, Paintbrush, Zap, ShieldAlert, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// ORBIT Brand Colors (from website design system)
const COLORS = ['#FF6B6B', '#C4B5FD', '#5EEAD4', '#FFB347', '#818CF8'];
const DASHBOARD_POLL_MS = 15000;

const FEEDBACK_META = {
  bug: { label: 'Bug Report', color: '#FF6B6B', icon: Bug },
  feature: { label: 'Feature Request', color: '#C4B5FD', icon: Lightbulb },
  ui: { label: 'UI / Design', color: '#5EEAD4', icon: Paintbrush },
  performance: { label: 'Performance', color: '#FFB347', icon: Zap },
  safety: { label: 'Privacy / Safety', color: '#818CF8', icon: ShieldAlert },
  other: { label: 'Other', color: '#9CA3B0', icon: MessageSquareText },
};

// ─── Dynamic Geocoding via OpenStreetMap Nominatim (free, no API key) ───
const GEO_CACHE_KEY = 'orbit_geo_cache';

function loadGeoCache() {
  try {
    return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}');
  } catch { return {}; }
}

function saveGeoCache(cache) {
  localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
}

async function geocodeCity(cityName) {
  const cache = loadGeoCache();
  const key = cityName.toLowerCase().trim();
  if (cache[key]) return cache[key];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'OrbitLandingPage/1.0' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache[key] = coords;
      saveGeoCache(cache);
      return coords;
    }
  } catch (err) {
    console.warn(`Geocoding failed for "${cityName}":`, err);
  }
  return null;
}

async function geocodeAllCities(cityStats) {
  const results = [];
  for (const city of cityStats) {
    const coords = await geocodeCity(city.city);
    if (coords) {
      results.push({ ...city, lat: coords.lat, lng: coords.lng });
    }
    // Wait 1.1s between requests to respect Nominatim's rate limit
    await new Promise(r => setTimeout(r, 1100));
  }
  return results;
}

// Auto-fit map bounds to markers
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map(m => [m.lat, m.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [markers, map]);
  return null;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('waitlist'); // waitlist | feedback
  const [stats, setStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [geoMarkers, setGeoMarkers] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filterCity, setFilterCity] = useState('all');
  const [filterAge, setFilterAge] = useState('all');

  const fetchStats = async (isPolling = false) => {
    if (!isPolling) setRefreshing(true);
    try {
      const res = await fetch('/api/waitlist/stats', { cache: 'no-store' });
      const data = await res.json();
      setStats((prev) => (
        prev && JSON.stringify(prev) === JSON.stringify(data) ? prev : data
      ));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      if (!isPolling) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const fetchFeedback = async (isPolling = false) => {
    if (!isPolling) setRefreshing(true);
    try {
      const res = await fetch('/api/feedback/stats', { cache: 'no-store' });
      const data = await res.json();
      setFeedbackStats((prev) => (
        prev && JSON.stringify(prev) === JSON.stringify(data) ? prev : data
      ));
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      if (!isPolling) setRefreshing(false);
    }
  };

  const refreshActive = (isPolling = false) => {
    if (activeTab === 'feedback') return fetchFeedback(isPolling);
    return fetchStats(isPolling);
  };

  useEffect(() => { 
    fetchStats();
    fetchFeedback(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback' && !feedbackStats) fetchFeedback();
  }, [activeTab]);

  // Silent background polling — no spinners, filters, or scroll disruption
  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      fetchStats(true);
      fetchFeedback(true);
    };
    const id = setInterval(tick, DASHBOARD_POLL_MS);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const exportToCSV = () => {
    if (activeTab === 'feedback') {
      if (!feedbackStats?.recentFeedback?.length) return;
      const headers = ['Category', 'Name', 'Email', 'Message', 'Screenshots', 'Source', 'Platform', 'Version', 'Submitted'];
      const rows = feedbackStats.recentFeedback.map(f => [
        FEEDBACK_META[f.category]?.label || f.category,
        `"${(f.name || '').replace(/"/g, '""')}"`,
        f.email,
        `"${(f.message || '').replace(/"/g, '""')}"`,
        f.screenshot_count || 0,
        f.source || '',
        f.platform || '',
        f.app_version || '',
        f.created_at ? new Date(f.created_at).toLocaleString() : '',
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orbit_feedback_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!stats || !stats.recentSignups) return;
    
    const headers = ['Email', 'City', 'Age', 'Joined Date'];
    const rows = stats.recentSignups.map(s => [
      s.email,
      `"${(s.city || 'Unknown').replace(/"/g, '""')}"`,
      s.age || 'N/A',
      new Date(s.created_at).toLocaleString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orbit_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Geocode only when city composition actually changes (not on every poll)
  const cityStatsKey = JSON.stringify(
    (stats?.cityStats || []).map((c) => [c.city, c.count])
  );

  useEffect(() => {
    if (!stats?.cityStats?.length) return;
    let cancelled = false;
    setGeoLoading(true);
    geocodeAllCities(stats.cityStats).then((markers) => {
      if (cancelled) return;
      setGeoMarkers(markers);
      setGeoLoading(false);
    });
    return () => { cancelled = true; };
  }, [cityStatsKey]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading Analytics…</p>
      </div>
    );
  }

  const filteredSignups = (stats?.recentSignups || []).filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === 'all' || s.city === filterCity;
    const matchesAge = filterAge === 'all' || s.age === filterAge;
    return matchesSearch && matchesCity && matchesAge;
  });

  // Extract unique filter options from data
  const uniqueCities = [...new Set((stats?.cityStats || []).map(s => s.city))].sort();
  const ageOptions = ["16-25", "26-35", "36-45", "46-60", "60+"];

  const latestGrowth = stats?.growthData?.length > 0
    ? stats.growthData[stats.growthData.length - 1].count
    : 0;

  const filteredFeedback = (feedbackStats?.recentFeedback || []).filter((f) => {
    const haystack = `${f.email} ${f.name || ''} ${f.message || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(feedbackSearch.toLowerCase());
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const feedbackPieData = (feedbackStats?.categoryStats || []).filter((c) => c.count > 0);

  return (
    <div className="dashboard-container">
      {/* ── Header ────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-left">
          <a href="/" className="back-link">
            <ChevronLeft size={20} />
            Back to Site
          </a>
          <div className="title-group">
            <h1>ORBIT Analytics <span className="version-badge">v2</span></h1>
            <p>Real-time campaign performance & user acquisition</p>
          </div>
        </div>
        <div className="header-actions">
          <button className={`btn-refresh ${refreshing ? 'spinning' : ''}`} onClick={() => refreshActive(false)}>
            <RefreshCw size={18} />
            {refreshing ? 'Syncing…' : 'Refresh Data'}
          </button>
          <button className="btn-export" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <nav className="dashboard-tabs" aria-label="Dashboard sections">
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'waitlist' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('waitlist')}
        >
          <Users size={16} />
          Waitlist
          <span className="dashboard-tab-count">{stats?.totalSignups || 0}</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'feedback' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquareText size={16} />
          Feedback
          <span className="dashboard-tab-count">{feedbackStats?.total || 0}</span>
        </button>
      </nav>

      {activeTab === 'waitlist' ? (
      <main className="dashboard-grid">
        <section className="stats-row">
          <StatCard title="Total Waitlist"   value={stats?.totalSignups || 0}    change="+12.5%" trend="up"   icon={<Users size={24}/>}      color="coral"/>
          <StatCard title="Active Cities"    value={stats?.cityStats?.length || 0} change="+2 new" trend="up"   icon={<MapPin size={24}/>}     color="lavender"/>
          <StatCard title="Avg. Conv Rate"   value="3.2%"                     change="-0.4%"  trend="down" icon={<Activity size={24}/>}   color="teal"/>
          <StatCard title="Growth Velocity"  value={`${latestGrowth}/day`}    change="+4.2%"  trend="up"   icon={<TrendingUp size={24}/>} color="amber"/>
        </section>

        {/* ── Charts ──────────────────────────────── */}
        <section className="charts-row">
          <div className="chart-card main-chart">
            <div className="card-header">
              <h3>Waitlist Growth</h3>
              <div className="card-period">Last 7 Days</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.growthData || []}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C4B5FD" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ background:'#1C1C2E', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#F0F0F5' }}/>
                <Area type="monotone" dataKey="count" stroke="#C4B5FD" strokeWidth={3} fillOpacity={1} fill="url(#grad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card mini-chart">
            <div className="card-header">
              <h3>City Distribution</h3>
              <Globe size={18} color="#9CA3B0"/>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats?.cityStats || []} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="count" nameKey="city">
                  {(stats?.cityStats || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background:'#1C1C2E', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#F0F0F5' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend-scroll">
              {(stats?.cityStats || []).map((c, i) => (
                <div key={c.city} className="legend-item">
                  <span className="dot" style={{ background: COLORS[i % COLORS.length] }}/>
                  <span className="label">{c.city}</span>
                  <span className="val">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Global Map (Leaflet — dynamic geocoding) ───── */}
        <section className="map-section">
          <div className="map-card">
            <div className="card-header">
              <div className="header-info">
                <h3>Global Heatmap</h3>
                <p>Live signup origins across the globe {geoLoading && <span className="geo-status">· Geocoding cities…</span>}</p>
              </div>
              <Globe size={18} color="#9CA3B0"/>
            </div>
            <div className="map-viewport">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                minZoom={2}
                maxZoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <FitBounds markers={geoMarkers} />
                {geoMarkers.map((marker, i) => {
                  const radius = Math.max(6, Math.min(marker.count * 4, 25));
                  return (
                    <CircleMarker
                      key={marker.city}
                      center={[marker.lat, marker.lng]}
                      radius={radius}
                      pathOptions={{
                        color: '#FF6B6B',
                        fillColor: '#FF6B6B',
                        fillOpacity: 0.35,
                        weight: 2,
                        opacity: 0.8,
                      }}
                    >
                      <MapTooltip
                        direction="top"
                        offset={[0, -radius]}
                        className="orbit-map-tooltip"
                      >
                        <strong>{marker.city}</strong><br />
                        {marker.count} signup{marker.count !== 1 ? 's' : ''}
                      </MapTooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
              <div className="map-overlay">
                <div className="map-stat">
                  <h4>Top Region</h4>
                  <p>{stats?.cityStats?.[0]?.city || 'N/A'}</p>
                </div>
                <div className="map-stat">
                  <h4>Cities Reached</h4>
                  <p>{geoMarkers.length} of {stats?.cityStats?.length || 0}</p>
                </div>
                <div className="map-stat">
                  <h4>Live Tracking</h4>
                  <div className="pulse-indicator">
                    <div className="pulse"></div>
                    <span>Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Signups Table & System Health ───────── */}
        <section className="activity-row">
          <div className="activity-card">
            <div className="card-header">
              <div className="header-search">
                <h3>Recent Signups</h3>
                <div className="advanced-filters">
                  <div className="search-bar">
                    <Search size={16}/>
                    <input type="text" placeholder="Search email…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                  </div>
                  
                  <select className="filter-select" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                    <option value="all">All Regions</option>
                    {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select className="filter-select" value={filterAge} onChange={e => setFilterAge(e.target.value)}>
                    <option value="all">All Ages</option>
                    {ageOptions.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table>
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Region</th>
                    <th>Age</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSignups.map(s => (
                    <tr key={s.id}>
                      <td className="email-cell">
                        <div className="avatar" style={{ background: COLORS[s.id % COLORS.length] }}>{s.email[0].toUpperCase()}</div>
                        <span className="email-text">{s.email}</span>
                      </td>
                      <td>{s.city}</td>
                      <td><div className="age-cell">{s.age === '34-35' ? '26-35' : (s.age || '—')}</div></td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={14}/>
                          {s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}
                        </div>
                      </td>
                      <td><span className="status-badge verified">Verified</span></td>
                    </tr>
                  ))}
                  {filteredSignups.length === 0 && (
                    <tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'#6B7280'}}>No signups found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="system-card">
            <div className="card-header">
              <h3>System Health</h3>
              <div className="status-dot online"></div>
            </div>
            <div className="health-metrics">
              <HealthItem label="API Latency"   value="48ms" status="excellent"/>
              <HealthItem label="Supabase Sync" value="Live" status="good"/>
              <HealthItem label="Uptime"        value="99.9%" status="good"/>
              <div className="server-info">
                <p>Node.js v22 · Express</p>
                <div className="bar-group">
                  <div className="bar active" style={{width:'60%'}}/>
                  <div className="bar" style={{width:'20%'}}/>
                  <div className="bar" style={{width:'20%'}}/>
                </div>
                <span>Server utilization: 42%</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      ) : (
      <main className="dashboard-grid">
        <section className="stats-row feedback-stats-row">
          <StatCard
            title="Total Feedback"
            value={feedbackStats?.total || 0}
            change={`${feedbackStats?.last24h || 0} today`}
            trend="up"
            icon={<MessageSquareText size={24} />}
            color="lavender"
            comparisonLabel=""
          />
          <StatCard
            title="Bug Reports"
            value={feedbackStats?.bugs || 0}
            change={`${feedbackStats?.total ? Math.round(((feedbackStats.bugs || 0) / feedbackStats.total) * 100) : 0}% of total`}
            trend={(feedbackStats?.bugs || 0) > 0 ? 'down' : 'up'}
            icon={<Bug size={24} />}
            color="coral"
            comparisonLabel=""
          />
          <StatCard
            title="Feature Requests"
            value={feedbackStats?.features || 0}
            change="product ideas"
            trend="up"
            icon={<Lightbulb size={24} />}
            color="amber"
            comparisonLabel=""
          />
          <StatCard
            title="With Screenshots"
            value={feedbackStats?.withScreenshots || 0}
            change="visual reports"
            trend="up"
            icon={<ImageIcon size={24} />}
            color="teal"
            comparisonLabel=""
          />
        </section>

        <section className="feedback-category-row">
          {(feedbackStats?.categoryStats || Object.keys(FEEDBACK_META).map((id) => ({
            id,
            label: FEEDBACK_META[id].label,
            count: 0,
          }))).map((cat) => {
            const meta = FEEDBACK_META[cat.id] || FEEDBACK_META.other;
            const Icon = meta.icon;
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`feedback-cat-chip ${isActive ? 'is-active' : ''}`}
                style={{ '--chip-color': meta.color }}
                onClick={() => setFilterCategory(isActive ? 'all' : cat.id)}
              >
                <span className="feedback-cat-chip-icon"><Icon size={16} /></span>
                <span className="feedback-cat-chip-label">{meta.label}</span>
                <span className="feedback-cat-chip-count">{cat.count}</span>
              </button>
            );
          })}
        </section>

        <section className="charts-row">
          <div className="chart-card main-chart feedback-breakdown-card">
            <div className="card-header">
              <h3>Category Breakdown</h3>
              <div className="card-period">Click a type to filter</div>
            </div>
            <div className="feedback-breakdown-list">
              {(feedbackStats?.categoryStats || []).map((cat) => {
                const meta = FEEDBACK_META[cat.id] || FEEDBACK_META.other;
                const Icon = meta.icon;
                const pct = feedbackStats?.total
                  ? Math.round((cat.count / feedbackStats.total) * 100)
                  : 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`feedback-breakdown-item ${filterCategory === cat.id ? 'is-active' : ''}`}
                    onClick={() => setFilterCategory(filterCategory === cat.id ? 'all' : cat.id)}
                  >
                    <div className="feedback-breakdown-top">
                      <span className="feedback-breakdown-label">
                        <Icon size={15} style={{ color: meta.color }} />
                        {meta.label}
                      </span>
                      <span className="feedback-breakdown-count">{cat.count}</span>
                    </div>
                    <div className="feedback-breakdown-bar">
                      <div
                        className="feedback-breakdown-fill"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                    <span className="feedback-breakdown-pct">{pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="chart-card mini-chart">
            <div className="card-header">
              <h3>By Category</h3>
              <MessageSquareText size={18} color="#9CA3B0" />
            </div>
            {feedbackPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={feedbackPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="label"
                    >
                      {feedbackPieData.map((entry) => (
                        <Cell key={entry.id} fill={FEEDBACK_META[entry.id]?.color || '#9CA3B0'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#1C1C2E', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#F0F0F5' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend-scroll">
                  {feedbackPieData.map((c) => (
                    <div key={c.id} className="legend-item">
                      <span className="dot" style={{ background: FEEDBACK_META[c.id]?.color || '#9CA3B0' }}/>
                      <span className="label">{c.label}</span>
                      <span className="val">{c.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="feedback-empty">No feedback categories yet.</div>
            )}
          </div>
        </section>

        <section className="activity-row feedback-activity-row">
          <div className="activity-card feedback-activity-card">
            <div className="card-header">
              <div className="header-search">
                <h3>All Feedback</h3>
                <div className="advanced-filters">
                  <div className="search-bar">
                    <Search size={16}/>
                    <input
                      type="text"
                      placeholder="Search email or message…"
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="filter-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(FEEDBACK_META).map(([id, meta]) => (
                      <option key={id} value={id}>{meta.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="table-container feedback-table-wrap">
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Screenshot</th>
                    <th>Source</th>
                    <th>Platform</th>
                    <th>Version</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map((f) => {
                    const meta = FEEDBACK_META[f.category] || FEEDBACK_META.other;
                    return (
                      <tr key={f.id}>
                        <td className="feedback-id-cell">#{f.id}</td>
                        <td>
                          <span className="feedback-badge" style={{ '--badge-color': meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td>{f.name || '—'}</td>
                        <td className="email-cell">
                          <span className="email-text">{f.email}</span>
                        </td>
                        <td>
                          <p className="feedback-message">{f.message || '—'}</p>
                        </td>
                        <td>
                          {f.has_screenshot ? (
                            <a
                              className="feedback-thumb"
                              href={`/feedback/${f.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={`/api/feedback/${f.id}/screenshot/0`}
                                alt={`Screenshot for feedback ${f.id}`}
                              />
                              {(f.screenshot_count || 0) > 1 && (
                                <span className="feedback-thumb-count">+{f.screenshot_count - 1}</span>
                              )}
                            </a>
                          ) : (
                            <span className="feedback-meta-pill">None</span>
                          )}
                        </td>
                        <td>{f.source || '—'}</td>
                        <td>{f.platform || '—'}</td>
                        <td>{f.app_version ? `v${f.app_version}` : '—'}</td>
                        <td>
                          <div className="date-cell">
                            <Calendar size={14}/>
                            {f.created_at
                              ? new Date(f.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
                              : '—'}
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/feedback/${f.id}`}
                            className="feedback-open-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFeedback.length === 0 && (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
                        No feedback found. Submissions from /feedback will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────── */
function StatCard({ title, value, change, trend, icon, color, comparisonLabel = 'vs last week' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <h2 className="stat-value">{value}</h2>
        <div className={`stat-trend ${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {change}
          {comparisonLabel ? <span>{comparisonLabel}</span> : null}
        </div>
      </div>
    </div>
  );
}

function HealthItem({ label, value, status }) {
  return (
    <div className="health-item">
      <div className="health-info">
        <span className="health-label">{label}</span>
        <span className="health-value">{value}</span>
      </div>
      <div className={`health-bar ${status}`}/>
    </div>
  );
}


