import Head from 'next/head';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css';
import { getUser, signIn, isLocalDev } from '../utils/auth';

/* Typewriter strings */
const PHRASES = [
  'Maximize profit margins.',
  'Outsmart competitors.',
  'Price with confidence.',
  'Turn data into decisions.',
];

/* Animated counter hook */
function useCounter(target, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('checking');
  const [signingIn, setSigningIn] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [countersReady, setCountersReady] = useState(false);
  const localDev = isLocalDev();
  const typingRef = useRef(null);
  const spotlightRef = useRef(null);

  /* ── Cursor spotlight tracking ── */
  const handleMouseMove = useCallback((e) => {
    const el = spotlightRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  /* ── Auth check ── */
  useEffect(() => {
    async function checkAuth() {
      const user = await getUser();
      if (user) { router.replace('/dashboard'); return; }
      setAuthStatus('ready');
      setTimeout(() => setCountersReady(true), 400);
    }
    checkAuth();
  }, [router]);

  /* ── Typewriter effect ── */
  useEffect(() => {
    if (authStatus !== 'ready') return;
    const current = PHRASES[phraseIndex];
    const speed = deleting ? 40 : 70;

    typingRef.current = setTimeout(() => {
      if (!deleting) {
        if (phrase.length < current.length) {
          setPhrase(current.slice(0, phrase.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1600);
        }
      } else {
        if (phrase.length > 0) {
          setPhrase(phrase.slice(0, -1));
        } else {
          setDeleting(false);
          setPhraseIndex(i => (i + 1) % PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(typingRef.current);
  }, [phrase, deleting, phraseIndex, authStatus]);

  /* Animated counters */
  const c1 = useCounter(1247, 1400, countersReady);
  const c2 = useCounter(94,   1000, countersReady);
  const c3 = useCounter(18,   1200, countersReady);

  function handleSignIn() { setSigningIn(true); signIn(); }

  return (
    <>
      <Head>
        <title>Fiamma AI Pricing Strategist — Sign In</title>
        <meta name="description" content="Sign in to Fiamma AI Pricing Strategist with your company Microsoft account." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Layered background */}
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.bgGrid} aria-hidden="true" />

      {/* Floating orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.orb3} aria-hidden="true" />

      {/* Cursor spotlight overlay */}
      <div ref={spotlightRef} className={styles.spotlight} aria-hidden="true" />

      <main className={styles.page}>

        {/* ── HERO ── */}
        <section className={styles.hero} aria-label="Product title">
          <div className={styles.heroEyebrow}>Powered by AI</div>

          <h1 className={styles.heroTitle}>
            AI <span className={styles.heroTitleAccent}>Pricing Strategist</span>
          </h1>

          {/* Typewriter */}
          <div className={styles.typewriterRow} aria-live="polite">
            <span className={styles.typewriterText}>{phrase}</span>
            <span className={styles.cursor} aria-hidden="true">|</span>
          </div>

          {/* Animated stats */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{c1.toLocaleString()}+</span>
              <span className={styles.heroStatLabel}>Pricing decisions made</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{c2}%</span>
              <span className={styles.heroStatLabel}>Avg margin accuracy</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{c3}s</span>
              <span className={styles.heroStatLabel}>Avg time to quote</span>
            </div>
          </div>
        </section>

        {/* ── LOGIN CARD ── */}
        <div className={styles.card}>
          {authStatus === 'checking' ? (
            <div className={styles.loadingState} role="status">
              <div className={styles.spinner} aria-hidden="true" />
              <p className={styles.loadingText}>Checking authentication&hellip;</p>
            </div>
          ) : (
            <>
              <p className={styles.cardLabel}>Sign in to continue to your workspace</p>

              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>Continue with</span>
                <div className={styles.dividerLine} />
              </div>

              <button
                className={styles.btnMicrosoft}
                onClick={handleSignIn}
                disabled={signingIn}
                aria-label="Sign in with Microsoft"
              >
                {signingIn ? (
                  <>
                    <div className={styles.spinnerSmall} aria-hidden="true" />
                    Redirecting to Microsoft&hellip;
                  </>
                ) : (
                  <>
                    <div className={styles.msIcon} aria-hidden="true">
                      <span className={styles.msRed} />
                      <span className={styles.msGreen} />
                      <span className={styles.msBlue} />
                      <span className={styles.msYellow} />
                    </div>
                    Sign in with Microsoft
                  </>
                )}
              </button>

              {localDev && (
                <div className={styles.devNotice} role="note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p>
                    <strong>Local dev:</strong> Auth requires the{' '}
                    <a href="https://azure.github.io/static-web-apps-cli/" target="_blank" rel="noreferrer">SWA CLI</a>{' '}
                    or Azure deployment.
                  </p>
                </div>
              )}

              <div className={styles.security} role="note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p className={styles.securityText}>
                  <strong>Authorised personnel only.</strong>{' '}
                  Restricted to Fiamma employees. Protected by Microsoft&#39;s enterprise security.
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── BRAND BOX ── */}
        <div className={styles.brand} aria-label="Fiamma brand">
          <div className={styles.brandMark} aria-hidden="true">F</div>
          <div className={styles.brandTextBlock}>
            <span className={styles.brandName}>Fiamma Holdings Berhad</span>
            <span className={styles.brandSub}>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>

      </main>
    </>
  );
}
