import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts';
import styles from '../styles/dashboard.module.css';
import { getUser, signOut } from '../utils/auth';

/* ── Mock pricing data (swap with real API later) ─── */
const mockPricingData = [
  { channel: 'Traditional', min: 820, optimal: 950, max: 1100, competitor: 980 },
  { channel: 'Corporate', min: 900, optimal: 1050, max: 1250, competitor: 1020 },
  { channel: 'E-Commerce', min: 780, optimal: 890, max: 1020, competitor: 860 },
  { channel: 'Project', min: 950, optimal: 1120, max: 1350, competitor: 1080 },
];

const mockReasoning = {
  recommendation: 'RM 950 (Traditional Channel)',
  confidence: 87,
  factors: [
    { label: 'Customer Purchase History', impact: 'positive', detail: 'Dealer has placed 12 orders in the last 6 months — qualifies for loyalty tier pricing.' },
    { label: 'Stock Aging', impact: 'positive', detail: 'Current stock age is 47 days. A 3–5% discount is recommended to accelerate inventory turnover.' },
    { label: 'Market Demand', impact: 'neutral', detail: 'Demand index at 72/100. Moderate demand allows for slight margin protection without losing the deal.' },
    { label: 'Competitor Pricing', impact: 'warning', detail: 'Competitor last quoted RM 980. Undercutting by RM 30 gives a competitive edge while preserving margin.' },
  ],
  summary: 'Recommended price of RM 950 balances a healthy 18.2% gross margin with a competitive position. Applying a 3% aging stock discount maintains sales velocity while staying above the minimum viable price of RM 820.',
};

const mockMetrics = [
  { label: 'Active Products', value: '142', delta: '+4 this week' },
  { label: 'Avg Margin', value: '19.4%', delta: '+1.2% vs last month' },
  { label: 'Deals Closed', value: '38', delta: 'this month' },
  { label: 'Pending Quotes', value: '7', delta: '3 expiring soon' },
];

const navItems = [
  { icon: '📊', label: 'Pricing Dashboard', active: true },
  { icon: '🧾', label: 'Quote History', active: false },
  { icon: '📦', label: 'Product Catalogue', active: false },
  { icon: '📈', label: 'Market Trends', active: false },
  { icon: '⚙️', label: 'Settings', active: false },
];

/* ── Custom tooltip for the chart ─── */
function PriceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.chartTooltipTitle}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className={styles.chartTooltipRow}>
          {p.name}: <strong>RM {p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Impact badge ─── */
const impactConfig = {
  positive: { color: '#22c55e', label: '▲ Positive' },
  neutral:  { color: '#888',    label: '● Neutral' },
  warning:  { color: '#f59e0b', label: '▼ Watch' },
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from: 'ai', text: 'Hi! I\'m your Fiamma AI Pricing Strategist. Ask me anything about pricing, margins, or stock strategy.' }
  ]);
  const [selectedChannel, setSelectedChannel] = useState('All');
  
  /* ── Parameter States ── */
  const [targetMargin, setTargetMargin] = useState(18);
  const [orderVolume, setOrderVolume] = useState(500);
  const [strategicGoal, setStrategicGoal] = useState('Maximize Profit');
  const [customerTier, setCustomerTier] = useState('Standard');

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getUser();
      if (!currentUser) { router.replace('/'); return; }
      setUser(currentUser);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  function handleSignOut() { setSigningOut(true); signOut(); }

  function handleChatSend() {
    if (!chatInput.trim()) return;
    const userMsg = { from: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    // Placeholder AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        from: 'ai',
        text: 'This feature will connect to Microsoft AI Foundry via the Azure Function backend. Stay tuned!'
      }]);
    }, 800);
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const displayName = user?.userDetails ?? 'User';
  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <Head>
        <title>Fiamma — AI Pricing Strategist</title>
        <meta name="description" content="Fiamma AI Pricing Strategist Dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.bgGrid} aria-hidden="true" />

      <div className={styles.shell}>

        {/* ══ SIDEBAR ══ */}
        <aside className={styles.sidebar}>
          {/* Logo */}
          <div className={styles.sidebarLogo}>
            <div className={styles.logoMark}>F</div>
            <div>
              <div className={styles.logoName}>Fiamma</div>
              <div className={styles.logoTagline}>AI Pricing Strategist</div>
            </div>
          </div>

          {/* Nav */}
          <nav className={styles.sidebarNav}>
            {navItems.map(item => (
              <button
                key={item.label}
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Metrics */}
          <div className={styles.sidebarMetrics}>
            <p className={styles.sidebarMetricsTitle}>Quick Stats</p>
            {mockMetrics.map(m => (
              <div key={m.label} className={styles.metricItem}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricValue}>{m.value}</span>
                <span className={styles.metricDelta}>{m.delta}</span>
              </div>
            ))}
          </div>

          {/* User */}
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>Sales Manager</span>
            </div>
            <button className={styles.signOutBtn} onClick={handleSignOut} disabled={signingOut} title="Sign out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main className={styles.main}>

          {/* Welcome bar */}
          <div className={styles.welcomeBar}>
            <div>
              <div className={styles.welcomeEyebrow}>Welcome back</div>
              <h1 className={styles.welcomeTitle}>Hello, {displayName.split(' ')[0]} 👋</h1>
            </div>
            <div className={styles.channelFilter}>
              {['All', 'Traditional', 'Corporate', 'E-Commerce', 'Project'].map(ch => (
                <button
                  key={ch}
                  className={`${styles.filterBtn} ${selectedChannel === ch ? styles.filterBtnActive : ''}`}
                  onClick={() => setSelectedChannel(ch)}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* ── PRICING CHART ── */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Multifactor Pricing Analysis</h2>
                <p className={styles.panelSub}>Price range per sales channel — Min / Optimal / Max / Competitor</p>
              </div>
              <div className={styles.panelBadge}>Live Mock Data</div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={mockPricingData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="channel" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `RM ${v}`} domain={[700, 1400]} />
                <Tooltip content={<PriceTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#666' }} />
                <Bar dataKey="min" name="Min Price" fill="rgba(239,68,68,0.6)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimal" name="Optimal Price" fill="rgba(192,57,43,0.9)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="Max Price" fill="rgba(34,197,94,0.6)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="competitor" name="Competitor" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} strokeDasharray="5 3" />
                <ReferenceLine y={950} stroke="rgba(192,57,43,0.4)" strokeDasharray="4 4" label={{ value: 'Rec. Price', fill: '#c0392b', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </section>

          {/* ── AI STRATEGY INPUTS (PARAMETERS) ── */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>AI Strategy Inputs</h2>
                <p className={styles.panelSub}>Adjust parameters to shape the AI&#39;s pricing logic</p>
              </div>
            </div>

            <div className={styles.paramsGrid}>
              <div className={styles.paramControl}>
                <div className={styles.paramLabelRow}>
                  <label>Target Margin</label>
                  <span>{targetMargin}%</span>
                </div>
                <input 
                  type="range" min="10" max="40" step="1" 
                  value={targetMargin} 
                  onChange={e => setTargetMargin(e.target.value)} 
                  className={styles.paramSlider} 
                />
              </div>

              <div className={styles.paramControl}>
                <label className={styles.paramLabel}>Order Volume (Units)</label>
                <input 
                  type="number" min="1" 
                  value={orderVolume} 
                  onChange={e => setOrderVolume(e.target.value)} 
                  className={styles.paramInput} 
                />
              </div>

              <div className={styles.paramControl}>
                <label className={styles.paramLabel}>Strategic Goal</label>
                <select 
                  value={strategicGoal} 
                  onChange={e => setStrategicGoal(e.target.value)} 
                  className={styles.paramInput}
                >
                  <option>Maximize Profit</option>
                  <option>Move Volume / Clear Stock</option>
                  <option>Match Competitor</option>
                  <option>Aggressive Market Share</option>
                </select>
              </div>

              <div className={styles.paramControl}>
                <label className={styles.paramLabel}>Customer Tier</label>
                <select 
                  value={customerTier} 
                  onChange={e => setCustomerTier(e.target.value)} 
                  className={styles.paramInput}
                >
                  <option>Standard</option>
                  <option>Loyalty / VIP</option>
                  <option>New Acquisition</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── AI REASONING ── */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>AI Pricing Rationale</h2>
                <p className={styles.panelSub}>Why the AI recommends this price point</p>
              </div>
              <div className={styles.recommendBadge}>
                Recommended: <strong>{mockReasoning.recommendation}</strong>
                <span className={styles.confidencePill}>{mockReasoning.confidence}% confidence</span>
              </div>
            </div>

            <div className={styles.reasoningGrid}>
              {mockReasoning.factors.map(f => {
                const cfg = impactConfig[f.impact];
                return (
                  <div key={f.label} className={styles.reasoningCard}>
                    <div className={styles.reasoningCardTop}>
                      <span className={styles.reasoningLabel}>{f.label}</span>
                      <span className={styles.impactBadge} style={{ color: cfg.color, borderColor: `${cfg.color}44`, background: `${cfg.color}11` }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className={styles.reasoningDetail}>{f.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className={styles.reasoningSummary}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{mockReasoning.summary}</p>
            </div>
          </section>

        </main>
      </div>

      {/* ══ FLOATING CHAT BUTTON ══ */}
      <button
        className={`${styles.chatFab} ${chatOpen ? styles.chatFabOpen : ''}`}
        onClick={() => setChatOpen(o => !o)}
        aria-label="Open AI Pricing Assistant"
      >
        {chatOpen
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>

      {/* ══ CHAT PANEL ══ */}
      {chatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div className={styles.chatAiAvatar}>AI</div>
              <div>
                <div className={styles.chatTitle}>Pricing Assistant</div>
                <div className={styles.chatSubtitle}>Powered by Microsoft AI Foundry</div>
              </div>
            </div>
            <div className={styles.chatOnline} />
          </div>

          <div className={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`${styles.chatMsg} ${msg.from === 'user' ? styles.chatMsgUser : styles.chatMsgAi}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className={styles.chatInputRow}>
            <input
              className={styles.chatInput}
              placeholder="Ask about pricing, margins, stock…"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
            />
            <button className={styles.chatSendBtn} onClick={handleChatSend}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
