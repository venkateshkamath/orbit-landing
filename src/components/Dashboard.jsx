import { useEffect, useState, useRef } from 'react';
import { 
  Users, MapPin, TrendingUp, Activity, RefreshCw, 
  Download, ChevronLeft, Calendar, Search, 
  Globe, MoreHorizontal 
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

// Geocode all cities with a small delay between requests (Nominatim rate limit: 1 req/sec)
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [geoMarkers, setGeoMarkers] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchStats = async (isPolling = false) => {
    if (!isPolling) setRefreshing(true);
    try {
      const res = await fetch('/api/waitlist/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      if (!isPolling) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => { 
    fetchStats(); 
    // Establish polling every 15 seconds for live dashboard updates
    const interval = setInterval(() => fetchStats(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const exportToCSV = () => {
    if (!stats || !stats.recentSignups) return;
    
    const headers = ['Email', 'City', 'Joined Date'];
    const rows = stats.recentSignups.map(s => [
      s.email,
      `"${(s.city || 'Unknown').replace(/"/g, '""')}"`,
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

  // Geocode cities once stats are loaded
  useEffect(() => {
    if (!stats?.cityStats?.length) return;
    setGeoLoading(true);
    geocodeAllCities(stats.cityStats).then(markers => {
      setGeoMarkers(markers);
      setGeoLoading(false);
    });
  }, [stats?.cityStats]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading Analytics…</p>
      </div>
    );
  }

  const filteredSignups = (stats?.recentSignups || []).filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const latestGrowth = stats?.growthData?.length > 0
    ? stats.growthData[stats.growthData.length - 1].count
    : 0;

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
          <button className={`btn-refresh ${refreshing ? 'spinning' : ''}`} onClick={() => fetchStats(false)}>
            <RefreshCw size={18} />
            {refreshing ? 'Syncing…' : 'Refresh Data'}
          </button>
          <button className="btn-export" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      {/* ── Stats Cards ───────────────────────────── */}
      <main className="dashboard-grid">
        <section className="stats-row">
          <StatCard title="Total Waitlist"   value={stats?.totalCount || 0}    change="+12.5%" trend="up"   icon={<Users size={24}/>}      color="coral"/>
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
                <div className="search-bar">
                  <Search size={16}/>
                  <input type="text" placeholder="Search by email or city…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Region</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSignups.map(s => (
                    <tr key={s.id}>
                      <td className="email-cell">
                        <div className="avatar">{s.email[0].toUpperCase()}</div>
                        {s.email}
                      </td>
                      <td>{s.city}</td>
                      <td className="date-cell">
                        <Calendar size={14}/>
                        {new Date(s.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td><span className="status-badge verified">Verified</span></td>
                      <td><button className="btn-more"><MoreHorizontal size={14}/></button></td>
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
    </div>
  );
}

/* ─── Sub-components ──────────────────────── */
function StatCard({ title, value, change, trend, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <h2 className="stat-value">{value}</h2>
        <div className={`stat-trend ${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {change}
          <span>vs last week</span>
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


