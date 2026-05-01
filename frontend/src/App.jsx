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
import VillageSquare from './components/DesignSystem/Organisms/VillageSquare';
import DocumentViewer from './components/DesignSystem/Organisms/DocumentViewer';
import NeighborlyPulse from './components/Panels/NeighborlyPulse';
import ElectionMorning from './components/PollDay/ElectionMorning';
import FiveYearLedger from './components/Results/FiveYearLedger';
import DynamicHome from './components/Home/DynamicHome';
import SafetyNet from './components/SafetyNet/SafetyNet';

import Layout from './components/DesignSystem/Organisms/Layout';
import Drawer from './components/DesignSystem/Molecules/Drawer';
import { useLanguage } from './hooks/useLanguage';
import { useKidsMode } from './hooks/useKidsMode';
import { useConstituency } from './hooks/useConstituency';
import { useCivicTracker } from './hooks/useCivicTracker';
import './App.css';

export default function App() {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const { selected, loading, error, findConstituency, findByPincode, findByDistrict, clearSelection, allConstituencies } = useConstituency();
  const { trackFeature } = useCivicTracker();

  const [activeDrawer, setActiveDrawer] = useState(null);
  const [readerDocument, setReaderDocument] = useState(null);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    return () => document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const handleLocationSelect = (lat, lng, expectedFeatureProps) => {
    findConstituency(lat, lng, expectedFeatureProps);
  };

  const navItems = [
    { id: 'timeline', label: t('nav_timeline'), icon: 'Calendar', active: activeDrawer === 'timeline' },
    { id: 'evm', label: isKidsMode ? 'The Great Beep!' : t('nav_evm'), icon: 'Vote', active: activeDrawer === 'evm' },
    { id: 'impact', label: isKidsMode ? 'Fun Facts!' : t('nav_impact'), icon: isKidsMode ? 'Zap' : 'BarChart3', active: activeDrawer === 'impact' },
    { id: 'village', label: isKidsMode ? 'Ask Anything!' : 'Village Square', icon: 'MessagesSquare', active: activeDrawer === 'village' },
    { id: 'ledger', label: isKidsMode ? 'Promise Book' : 'Promise Ledger', icon: 'BookText', active: activeDrawer === 'ledger' },
  ];

  const handleNavClick = (id) => {
    setActiveDrawer(prev => prev === id ? null : id);
    trackFeature(id);
  };

  return (
    <Layout 
      navItems={navItems} 
      onNavItemClick={handleNavClick}
      highContrast={highContrast}
      onContrastToggle={() => setHighContrast(!highContrast)}
    >
      <ElectionMorning userState={selected?.state || ''} />

      <main className="h-full w-full relative">
        <IndiaMap
          onLocationSelect={handleLocationSelect}
          selectedConstituency={selected}
        />

        {selected && !isKidsMode && (
          <NeighborPanel constituency={selected} onClose={clearSelection} />
        )}

        {!selected && !error && (
          <DynamicHome
            onNavigate={(target) => handleNavClick(target)}
            constituency={selected}
            onScrollProgress={(progress) => {
              // Trigger map zoom if user scrolls down significantly
              if (progress > 0.4 && progress < 0.8) {
                // We'll handle this in IndiaMap via a new prop
                window.dispatchEvent(new CustomEvent('map-immersive-zoom', { detail: { progress } }));
              }
            }}
          />
        )}

        {error && (
          <SafetyNet
            error={error}
            onPincodeSearch={findByPincode}
            onDistrictSelect={findByDistrict}
            constituencies={allConstituencies}
            onDismiss={clearSelection}
          />
        )}

        {selected?.approximate && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-sm text-amber-800 shadow-lg z-40">
            📍 Approximate location — results may vary. <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">Verify on ECI</a>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 text-white">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="font-bold tracking-wide">{t('map_locating')}</span>
          </div>
        )}
      </main>

      {/* ── Predictive Navigation Drawers ── */}
      <Drawer 
        isOpen={activeDrawer === 'timeline'} 
        onClose={() => setActiveDrawer(null)} 
        title={t('nav_timeline')}
      >
        <TimelineBar />
      </Drawer>

      <Drawer 
        isOpen={activeDrawer === 'evm'} 
        onClose={() => setActiveDrawer(null)} 
        title={isKidsMode ? 'The Great Beep!' : t('nav_evm')}
      >
        {isKidsMode ? <GreatBeep onClose={() => setActiveDrawer(null)} /> : <EVMSimulator onClose={() => setActiveDrawer(null)} />}
      </Drawer>

      <Drawer 
        isOpen={activeDrawer === 'impact'} 
        onClose={() => setActiveDrawer(null)} 
        title={isKidsMode ? 'Fun Facts!' : t('nav_impact')}
      >
        {isKidsMode ? (
          <ImpactCalculator constituency={selected} onClose={() => setActiveDrawer(null)} />
        ) : (
          <PowerMeter constituency={selected} onClose={() => setActiveDrawer(null)} />
        )}
      </Drawer>

      <Drawer 
        isOpen={activeDrawer === 'village'} 
        onClose={() => setActiveDrawer(null)} 
        title={isKidsMode ? 'Ask Anything!' : 'Village Square'}
      >
        <VillageSquare
          onClose={() => setActiveDrawer(null)}
          onOpenDocument={(doc) => setReaderDocument(doc)}
        />
      </Drawer>

      <Drawer 
        isOpen={activeDrawer === 'ledger'} 
        onClose={() => setActiveDrawer(null)} 
        title={isKidsMode ? 'Promise Book' : 'Promise Ledger'}
      >
        <FiveYearLedger onClose={() => setActiveDrawer(null)} />
      </Drawer>

      {/* Document Reader - also a Drawer for consistency */}
      <Drawer
        isOpen={!!readerDocument}
        onClose={() => setReaderDocument(null)}
        title={readerDocument?.title || 'Legal Document'}
      >
        {readerDocument && (
          <DocumentViewer
            documentId={readerDocument.documentId}
            query={readerDocument.query}
            onClose={() => setReaderDocument(null)}
          />
        )}
      </Drawer>

      <NeighborlyPulse />
    </Layout>
  );
}
