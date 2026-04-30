import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import IndiaMap from './components/Map/IndiaMap';
import NeighborPanel from './components/Panels/NeighborPanel';
import TimelineBar from './components/Panels/TimelineBar';
import EVMSimulator from './components/EVM/EVMSimulator';
import ShadowBallot from './components/EVM/ShadowBallot';
import GreatBeep from './components/EVM/GreatBeep';
import ImpactCalculator from './components/Panels/ImpactCalculator';
import PowerMeter from './components/Panels/PowerMeter';
import VillageSquare from './components/Panels/VillageSquare';
import NeighborlyPulse from './components/Panels/NeighborlyPulse';
import ElectionMorning from './components/PollDay/ElectionMorning';
import FiveYearLedger from './components/Results/FiveYearLedger';
import DynamicHome from './components/Home/DynamicHome';
import SafetyNet from './components/SafetyNet/SafetyNet';
import LanguageSwitcher from './components/LanguageSwitcher';
import KidsModeToggle from './components/KidsModeToggle';
import { useLanguage } from './hooks/useLanguage';
import { useKidsMode } from './hooks/useKidsMode';
import { useConstituency } from './hooks/useConstituency';
import { useCivicTracker } from './hooks/useCivicTracker';
import './App.css';

// ── Nav button animation config ──
const navBtnMotion = {
  whileHover: { scale: 1.05, y: -1 },
  whileTap: { scale: 0.95, y: 2 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export default function App() {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const { selected, loading, error, findConstituency, findByPincode, findByDistrict, clearSelection, allConstituencies } = useConstituency();
  const { trackFeature } = useCivicTracker();

  const [showEVM, setShowEVM] = useState(false);
  const [showShadowBallot, setShowShadowBallot] = useState(false);
  const [showGreatBeep, setShowGreatBeep] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showPowerMeter, setShowPowerMeter] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showVillageSquare, setShowVillageSquare] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    return () => document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const handleLocationSelect = (lat, lng, expectedFeatureProps) => {
    findConstituency(lat, lng, expectedFeatureProps);
  };

  // DynamicHome navigation dispatcher
  const handleDynamicNav = useCallback((target) => {
    switch (target) {
      case 'evm': setShowEVM(true); trackFeature('EVMSimulator'); break;
      case 'greatBeep': setShowGreatBeep(true); trackFeature('GreatBeep'); break;
      case 'impact': setShowImpact(true); trackFeature('ImpactCalculator'); break;
      case 'power': setShowPowerMeter(true); trackFeature('PowerMeter'); break;
      case 'ledger': setShowLedger(true); trackFeature('FiveYearLedger'); break;
      case 'map': /* already on map */ break;
      default: break;
    }
  }, [trackFeature]);

  return (
    <div className="app-layout">
      {/* ── Election Morning Greeting (date-triggered) ── */}
      <ElectionMorning userState={selected?.state || ''} />

      {/* ── Top Navigation Bar ── */}
      <header className="app-header glass-panel">
        <div className="header-left">
          <div className="app-logo">
            <motion.span
              className="logo-icon"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {isKidsMode ? '🏰' : '🏘️'}
            </motion.span>
            <div className="logo-text">
              <h1 className="logo-title">{t('app_title')}</h1>
              <p className="logo-subtitle">{t('app_subtitle')}</p>
            </div>
          </div>
        </div>

        <nav className="header-nav" role="navigation" aria-label="Main navigation">
          <motion.button
            className={`nav-btn ${showTimeline ? 'active' : ''}`}
            onClick={() => { setShowTimeline(!showTimeline); trackFeature('Timeline'); }}
            {...navBtnMotion}
            aria-label={t('nav_timeline')}
          >
            <span className="nav-icon" aria-hidden="true">📅</span>
            <span className="nav-label">{t('nav_timeline')}</span>
          </motion.button>

          <motion.button
            className="nav-btn"
            onClick={() => {
              if (isKidsMode) { setShowGreatBeep(true); trackFeature('GreatBeep'); }
              else { setShowEVM(true); trackFeature('EVMSimulator'); }
            }}
            {...navBtnMotion}
            aria-label={isKidsMode ? 'The Great Beep!' : t('nav_evm')}
          >
            <span className="nav-icon" aria-hidden="true">{isKidsMode ? '🎪' : '🗳️'}</span>
            <span className="nav-label">{isKidsMode ? 'The Great Beep!' : t('nav_evm')}</span>
          </motion.button>

          {isKidsMode && (
            <motion.button
              className="nav-btn"
              onClick={() => { setShowShadowBallot(true); trackFeature('ShadowBallot'); }}
              {...navBtnMotion}
              aria-label={t('kids_shadow_title')}
            >
              <span className="nav-icon" aria-hidden="true">🎭</span>
              <span className="nav-label">{t('kids_shadow_title')}</span>
            </motion.button>
          )}

          <motion.button
            className="nav-btn"
            onClick={() => {
              if (isKidsMode) { setShowImpact(true); trackFeature('ImpactCalculator'); }
              else { setShowPowerMeter(true); trackFeature('PowerMeter'); }
            }}
            disabled={!selected && !isKidsMode}
            {...navBtnMotion}
            aria-label={isKidsMode ? 'Fun Facts!' : t('nav_impact')}
          >
            <span className="nav-icon" aria-hidden="true">{isKidsMode ? '⚡' : '📊'}</span>
            <span className="nav-label">{isKidsMode ? 'Fun Facts!' : t('nav_impact')}</span>
          </motion.button>

          <motion.button
            className="nav-btn"
            onClick={() => { setShowVillageSquare(true); trackFeature('VillageSquare'); }}
            {...navBtnMotion}
            aria-label={isKidsMode ? 'Ask Anything!' : 'Village Square'}
          >
            <span className="nav-icon" aria-hidden="true">🏘️</span>
            <span className="nav-label">{isKidsMode ? 'Ask Anything!' : 'Village Square'}</span>
          </motion.button>

          <motion.button
            className="nav-btn"
            onClick={() => { setShowLedger(true); trackFeature('FiveYearLedger'); }}
            {...navBtnMotion}
            aria-label={isKidsMode ? 'Promise Book' : 'Promise Ledger'}
          >
            <span className="nav-icon" aria-hidden="true">📒</span>
            <span className="nav-label">{isKidsMode ? 'Promise Book' : 'Promise Ledger'}</span>
          </motion.button>
        </nav>

        <div className="header-right">
          <button
            className={`contrast-toggle ${highContrast ? 'active' : ''}`}
            onClick={() => setHighContrast((prev) => !prev)}
            aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
          >
            {highContrast ? '◐ Contrast' : '◑ Contrast'}
          </button>
          <KidsModeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      {/* ── Map Area ── */}
      <main className="app-map-area" role="main">
        <IndiaMap
          onLocationSelect={handleLocationSelect}
          selectedConstituency={selected}
        />

        {/* Neighbor Info Panel (Adult mode only) */}
        {selected && !isKidsMode && (
          <NeighborPanel constituency={selected} onClose={clearSelection} />
        )}

        {/* Dynamic Home — Contextual Hero */}
        {!selected && !error && (
          <DynamicHome
            onNavigate={handleDynamicNav}
            constituency={selected}
          />
        )}

        {/* Safety Net — Graceful Degradation */}
        {error && (
          <SafetyNet
            error={error}
            onPincodeSearch={findByPincode}
            onDistrictSelect={findByDistrict}
            constituencies={allConstituencies}
            onDismiss={clearSelection}
          />
        )}

        {/* Approximate location badge */}
        {selected?.approximate && (
          <div className="approx-badge" role="status">
            📍 Approximate location — results may vary. <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">Verify on ECI</a>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="map-loading" role="status" aria-live="polite">
            <div className="map-loading-spinner" />
            <span>{t('map_locating')}</span>
          </div>
        )}
      </main>

      {/* ── Timeline Drawer ── */}
      {showTimeline && (
        <motion.div
          className="timeline-drawer"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <TimelineBar />
          <button className="timeline-dismiss" onClick={() => setShowTimeline(false)} aria-label="Close timeline">✕</button>
        </motion.div>
      )}

      {/* ── Modals ── */}
      {showEVM && <EVMSimulator onClose={() => setShowEVM(false)} />}
      {showShadowBallot && <ShadowBallot onClose={() => setShowShadowBallot(false)} />}
      {showGreatBeep && <GreatBeep onClose={() => setShowGreatBeep(false)} />}
      {showImpact && selected && (
        <ImpactCalculator constituency={selected} onClose={() => setShowImpact(false)} />
      )}
      {showPowerMeter && (
        <PowerMeter constituency={selected} onClose={() => setShowPowerMeter(false)} />
      )}
      {showVillageSquare && <VillageSquare onClose={() => setShowVillageSquare(false)} />}
      {showLedger && <FiveYearLedger onClose={() => setShowLedger(false)} />}

      {/* ── Misinformation Firewall Footer ── */}
      <NeighborlyPulse />

      {/* ── Disclaimer Footer ── */}
      <div className="app-disclaimer" role="contentinfo">
        <span>ℹ️ {t('disclaimer')}</span>
      </div>
    </div>
  );
}
