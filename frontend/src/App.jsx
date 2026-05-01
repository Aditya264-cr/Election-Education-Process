import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import CivicDebater from './components/EVM/CivicDebater';

import Layout from './components/DesignSystem/Organisms/Layout';
import Drawer from './components/DesignSystem/Molecules/Drawer';
import Icon from './components/DesignSystem/Atoms/Icon';
import { useLanguage } from './hooks/useLanguage';
import { useKidsMode } from './hooks/useKidsMode';
import { useConstituency } from './hooks/useConstituency';
import { useCivicTracker } from './hooks/useCivicTracker';
import rumorFirewall from './data/rumor-firewall.json';
import './App.css';

export default function App() {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const { selected, loading, error, findConstituency, findByEpic, clearSelection, allConstituencies } = useConstituency();
  const { trackFeature } = useCivicTracker();

  const [activeDrawer, setActiveDrawer] = useState(null);
  const [readerDocument, setReaderDocument] = useState(null);
  const [highContrast, setHighContrast] = useState(false);
  
  // Misinformation Firewall state
  const [activeRumor, setActiveRumor] = useState(null);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    return () => document.body.classList.remove('high-contrast');
  }, [highContrast]);

  // Simulate rumor firewall triggering for Pune area
  useEffect(() => {
    if (selected?.pc_name === 'Pune') {
       const rumor = rumorFirewall.rumors.find(r => r.id === 'polling_cancelled');
       setActiveRumor(rumor);
    } else {
       setActiveRumor(null);
    }
  }, [selected]);

  const handleLocationSelect = (lat, lng, expectedFeatureProps) => {
    findConstituency(lat, lng, expectedFeatureProps);
  };

  const navItems = [
    { id: 'timeline', label: t('nav_timeline'), icon: 'Calendar', active: activeDrawer === 'timeline' },
    { id: 'evm', label: isKidsMode ? 'The Great Beep!' : t('nav_evm'), icon: 'Fingerprint', active: activeDrawer === 'evm' },
    { id: 'debate', label: 'Civic Debate!', icon: 'Sword', active: activeDrawer === 'debate', kidsOnly: true },
    { id: 'impact', label: isKidsMode ? 'Fun Facts!' : t('nav_impact'), icon: isKidsMode ? 'Zap' : 'BarChart3', active: activeDrawer === 'impact' },
    { id: 'village', label: isKidsMode ? 'Ask Anything!' : 'Village Square', icon: 'MessagesSquare', active: activeDrawer === 'village' },
    { id: 'ledger', label: isKidsMode ? 'Promise Book' : 'Promise Ledger', icon: 'BookText', active: activeDrawer === 'ledger' },
  ].filter(item => !item.kidsOnly || (item.kidsOnly && isKidsMode));

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

        {/* Misinformation Firewall: Neighbor Alert */}
        <AnimatePresence>
          {activeRumor && (
            <motion.div 
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-24 left-8 z-[2000] max-w-sm"
            >
              <div className="bg-red-600 text-white rounded-3xl p-6 shadow-2xl shadow-red-200 border-4 border-white">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Icon name="ShieldAlert" size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black uppercase tracking-tighter text-sm">Verified Neighbor Alert</h3>
                    <p className="text-lg font-bold leading-tight">Rumor: {activeRumor.myth}</p>
                    <div className="bg-white/10 p-3 rounded-xl text-xs font-medium leading-relaxed">
                      <strong>ECI Fact:</strong> {activeRumor.fact}
                    </div>
                    <button 
                      onClick={() => setActiveRumor(null)}
                      className="text-[10px] font-black uppercase tracking-widest bg-white text-red-600 px-4 py-2 rounded-full shadow-lg"
                    >
                      Got it, thanks neighbor!
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Snapshot Hub: Contextual Drawer for Location Details */}
        <Drawer
          isOpen={!!selected && !isKidsMode}
          onClose={clearSelection}
          title={selected?.pc_name || 'Snapshot'}
          footerBadge={true}
        >
          <NeighborPanel constituency={selected} onClose={clearSelection} />
        </Drawer>

        {!selected && !error && (
          <DynamicHome
            onNavigate={(target) => handleNavClick(target)}
            constituency={selected}
            onScrollProgress={(progress) => {
              if (progress > 0.4 && progress < 0.8) {
                window.dispatchEvent(new CustomEvent('map-immersive-zoom', { detail: { progress } }));
              }
            }}
          />
        )}

        {error && (
          <SafetyNet
            error={error}
            onPincodeSearch={() => {}} // Legacy
            onDistrictSelect={() => {}} // Legacy
            onEpicSearch={findByEpic}
            constituencies={allConstituencies}
            onDismiss={clearSelection}
          />
        )}

        {selected?.approximate && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 px-6 py-3 rounded-full text-sm text-amber-800 shadow-xl z-40 flex items-center gap-3">
            <Icon name="MapPin" size={18} className="text-amber-600" />
            <span>Approximate location — results may vary.</span>
            <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-amber-900">Verify on ECI</a>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 text-white">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl font-bold tracking-tight">{t('map_locating')}</span>
              <span className="text-sm text-white/60 font-medium tracking-wide uppercase">Sovereign Audit Active</span>
            </div>
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
          <div className="p-1">
             <ImpactCalculator constituency={selected} onClose={() => setActiveDrawer(null)} />
          </div>
        ) : (
          <div className="p-1">
             <ImpactCalculator constituency={selected} onClose={() => setActiveDrawer(null)} />
          </div>
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

      <Drawer 
        isOpen={activeDrawer === 'debate'} 
        onClose={() => setActiveDrawer(null)} 
        title="Civic Debate!"
      >
        <CivicDebater onClose={() => setActiveDrawer(null)} />
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
