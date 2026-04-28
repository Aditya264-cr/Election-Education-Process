import { useState } from 'react';
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
import LanguageSwitcher from './components/LanguageSwitcher';
import KidsModeToggle from './components/KidsModeToggle';
import { useLanguage } from './hooks/useLanguage';
import { useKidsMode } from './hooks/useKidsMode';
import { useConstituency } from './hooks/useConstituency';
import './App.css';

export default function App() {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const { selected, loading, findConstituency, clearSelection } = useConstituency();

  const [showEVM, setShowEVM] = useState(false);
  const [showShadowBallot, setShowShadowBallot] = useState(false);
  const [showGreatBeep, setShowGreatBeep] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showPowerMeter, setShowPowerMeter] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showVillageSquare, setShowVillageSquare] = useState(false);

  const handleLocationSelect = (lat, lng) => {
    findConstituency(lat, lng);
  };

  return (
    <div className="app-layout">
      {/* ── Top Navigation Bar ── */}
      <header className="app-header glass-panel">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">{isKidsMode ? '🏰' : '🏘️'}</span>
            <div className="logo-text">
              <h1 className="logo-title">{t('app_title')}</h1>
              <p className="logo-subtitle">{t('app_subtitle')}</p>
            </div>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-btn ${showTimeline ? 'active' : ''}`}
            onClick={() => setShowTimeline(!showTimeline)}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-label">{t('nav_timeline')}</span>
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              if (isKidsMode) {
                setShowGreatBeep(true);
              } else {
                setShowEVM(true);
              }
            }}
          >
            <span className="nav-icon">{isKidsMode ? '🎪' : '🗳️'}</span>
            <span className="nav-label">{isKidsMode ? 'The Great Beep!' : t('nav_evm')}</span>
          </button>
          {isKidsMode && (
            <button
              className="nav-btn"
              onClick={() => setShowShadowBallot(true)}
            >
              <span className="nav-icon">🎭</span>
              <span className="nav-label">{t('kids_shadow_title')}</span>
            </button>
          )}
          <button
            className="nav-btn"
            onClick={() => {
              if (isKidsMode) {
                setShowImpact(true);
              } else {
                setShowPowerMeter(true);
              }
            }}
            disabled={!selected && !isKidsMode}
          >
            <span className="nav-icon">{isKidsMode ? '⚡' : '📊'}</span>
            <span className="nav-label">{isKidsMode ? 'Fun Facts!' : t('nav_impact')}</span>
          </button>
          <button
            className="nav-btn"
            onClick={() => setShowVillageSquare(true)}
          >
            <span className="nav-icon">🏘️</span>
            <span className="nav-label">{isKidsMode ? 'Ask Anything!' : 'Village Square'}</span>
          </button>
        </nav>

        <div className="header-right">
          <KidsModeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      {/* ── Map Area ── */}
      <main className="app-map-area">
        <IndiaMap
          onLocationSelect={handleLocationSelect}
          selectedConstituency={selected}
        />

        {/* Neighbor Info Panel (Adult mode only) */}
        {selected && !isKidsMode && (
          <NeighborPanel
            constituency={selected}
            onClose={clearSelection}
          />
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="map-loading">
            <div className="map-loading-spinner" />
            <span>{t('map_locating')}</span>
          </div>
        )}
      </main>

      {/* ── Timeline Drawer ── */}
      {showTimeline && (
        <div className="timeline-drawer animate-fadeInUp">
          <TimelineBar />
          <button
            className="timeline-dismiss"
            onClick={() => setShowTimeline(false)}
          >✕</button>
        </div>
      )}

      {/* ── Modals ── */}
      {showEVM && <EVMSimulator onClose={() => setShowEVM(false)} />}
      {showShadowBallot && <ShadowBallot onClose={() => setShowShadowBallot(false)} />}
      {showGreatBeep && <GreatBeep onClose={() => setShowGreatBeep(false)} />}
      {showImpact && selected && (
        <ImpactCalculator
          constituency={selected}
          onClose={() => setShowImpact(false)}
        />
      )}
      {showPowerMeter && (
        <PowerMeter
          constituency={selected}
          onClose={() => setShowPowerMeter(false)}
        />
      )}
      {showVillageSquare && (
        <VillageSquare onClose={() => setShowVillageSquare(false)} />
      )}

      {/* ── Misinformation Firewall Footer ── */}
      <NeighborlyPulse />

      {/* ── Disclaimer Footer ── */}
      <div className="app-disclaimer">
        <span>ℹ️ {t('disclaimer')}</span>
      </div>
    </div>
  );
}
