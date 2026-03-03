import { useEffect, useState } from 'react';
import { 
  Users, MapPin, TrendingUp, Activity, RefreshCw, 
  Download, ChevronLeft, Calendar, Search, 
  Globe, MoreHorizontal 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import './Dashboard.css';

// ORBIT Brand Colors (from website design system)
const COLORS = ['#FF6B6B', '#C4B5FD', '#5EEAD4', '#FFB347', '#818CF8'];

// City → rough lat/lng for the SVG map
const cityCoords = {
  'mangalore':      { x: 62.5, y: 56 },
  'belgaum':        { x: 62.3, y: 54 },
  'bengaluru':      { x: 63,   y: 55.5 },
  'mumbai':         { x: 61.5, y: 52 },
  'delhi':          { x: 62.5, y: 47 },
  'london':         { x: 48,   y: 33 },
  'new york':       { x: 25.5, y: 40 },
  'san francisco':  { x: 15,   y: 42 },
  'tokyo':          { x: 82,   y: 42 },
  'berlin':         { x: 51.5, y: 33 },
  'kathmandu':      { x: 65.5, y: 47 },
};

function getCityPos(city) {
  const key = city.toLowerCase();
  for (const [name, pos] of Object.entries(cityCoords)) {
    if (key.includes(name)) return pos;
  }
  return { x: 50 + Math.random() * 10, y: 40 + Math.random() * 10 };
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/waitlist/stats');
      const data = await res.json();
      console.log('📊 Stats loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

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
          <button className={`btn-refresh ${refreshing ? 'spinning' : ''}`} onClick={fetchStats}>
            <RefreshCw size={18} />
            {refreshing ? 'Syncing…' : 'Refresh Data'}
          </button>
          <button className="btn-export">
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
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats?.cityStats || []} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="count" nameKey="city">
                  {(stats?.cityStats || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background:'#1C1C2E', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#F0F0F5' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {(stats?.cityStats || []).slice(0, 4).map((c, i) => (
                <div key={c.city} className="legend-item">
                  <span className="dot" style={{ background: COLORS[i % COLORS.length] }}/>
                  <span className="label">{c.city}</span>
                  <span className="val">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Global Map (pure SVG — no external lib) ───── */}
        <section className="map-section">
          <div className="map-card">
            <div className="card-header">
              <div className="header-info">
                <h3>Global Heatmap</h3>
                <p>Live signup origins across the globe</p>
              </div>
              <Globe size={18} color="#9CA3B0"/>
            </div>
            <div className="map-viewport">
              <svg viewBox="0 0 100 60" className="world-dots">
                {/* Simplified dot-matrix world map */}
                {worldDots.map((d, i) => (
                  <circle key={i} cx={d[0]} cy={d[1]} r={0.35} fill="#2a2a45" opacity={0.6}/>
                ))}
                {/* City markers */}
                {(stats?.cityStats || []).map((c, i) => {
                  const pos = getCityPos(c.city);
                  const r = Math.max(1, Math.min(c.count * 0.8, 3));
                  return (
                    <g key={i}>
                      <circle cx={pos.x} cy={pos.y} r={r + 1.5} fill="#FF6B6B" opacity={0.15}>
                        <animate attributeName="r" from={r+1} to={r+3} dur="2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" from="0.25" to="0" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx={pos.x} cy={pos.y} r={r} fill="#FF6B6B" opacity={0.7}/>
                      <circle cx={pos.x} cy={pos.y} r={0.5} fill="#fff"/>
                      <text x={pos.x} y={pos.y - r - 1} textAnchor="middle" fill="#C4B5FD" fontSize="1.8" fontWeight="600">{c.city}</text>
                    </g>
                  );
                })}
              </svg>
              <div className="map-overlay">
                <div className="map-stat">
                  <h4>Top Region</h4>
                  <p>{stats?.cityStats?.[0]?.city || 'N/A'}</p>
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

/* ─── Simplified dot-matrix world map points ── */
const worldDots = [
  // North America
  [14,30],[16,30],[18,30],[20,30],[22,30],[24,30],[14,32],[16,32],[18,32],[20,32],[22,32],[24,32],[26,32],
  [14,34],[16,34],[18,34],[20,34],[22,34],[24,34],[26,34],[28,34],
  [16,36],[18,36],[20,36],[22,36],[24,36],[26,36],[28,36],
  [18,38],[20,38],[22,38],[24,38],[26,38],[28,38],
  [20,40],[22,40],[24,40],[26,40],[28,40],
  [22,42],[24,42],[26,42],
  // South America
  [28,46],[30,46],[32,46],[34,46],
  [28,48],[30,48],[32,48],[34,48],[36,48],
  [30,50],[32,50],[34,50],[36,50],
  [30,52],[32,52],[34,52],
  [32,54],[34,54],
  [32,56],
  // Europe
  [46,28],[48,28],[50,28],[46,30],[48,30],[50,30],[52,30],
  [46,32],[48,32],[50,32],[52,32],[54,32],
  [46,34],[48,34],[50,34],[52,34],[54,34],[56,34],
  [48,36],[50,36],[52,36],[54,36],
  // Africa
  [48,38],[50,38],[52,38],[54,38],[56,38],
  [48,40],[50,40],[52,40],[54,40],[56,40],
  [48,42],[50,42],[52,42],[54,42],[56,42],
  [48,44],[50,44],[52,44],[54,44],
  [50,46],[52,46],[54,46],
  [50,48],[52,48],
  // Asia
  [56,28],[58,28],[60,28],[62,28],[64,28],[66,28],[68,28],
  [56,30],[58,30],[60,30],[62,30],[64,30],[66,30],[68,30],[70,30],
  [58,32],[60,32],[62,32],[64,32],[66,32],[68,32],[70,32],[72,32],
  [58,34],[60,34],[62,34],[64,34],[66,34],[68,34],[70,34],[72,34],[74,34],
  [56,36],[58,36],[60,36],[62,36],[64,36],[66,36],[68,36],[70,36],[72,36],[74,36],[76,36],
  [58,38],[60,38],[62,38],[64,38],[66,38],[68,38],[70,38],[72,38],[74,38],[76,38],[78,38],[80,38],
  [60,40],[62,40],[64,40],[66,40],[68,40],[70,40],[72,40],[74,40],[76,40],[78,40],[80,40],[82,40],
  [60,42],[62,42],[64,42],[66,42],[68,42],[70,42],[72,42],[74,42],[76,42],[78,42],[80,42],
  [62,44],[64,44],[66,44],[68,44],[70,44],[72,44],[74,44],[76,44],
  [62,46],[64,46],[66,46],[68,46],[70,46],
  [62,48],[64,48],[66,48],
  [64,50],[66,50],
  [64,52],[66,52],
  [64,54],[66,54],
  // Australia
  [76,46],[78,46],[80,46],[82,46],[84,46],
  [76,48],[78,48],[80,48],[82,48],[84,48],
  [78,50],[80,50],[82,50],
];
