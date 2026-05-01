import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { useCivicTracker } from '../../hooks/useCivicTracker';
import Icon from '../DesignSystem/Atoms/Icon';
import Button from '../DesignSystem/Atoms/Button';
import './FiveYearLedger.css';

/**
 * FIVE-YEAR PROMISE LEDGER
 * ========================
 * Post-election promise tracker. Creates an autonomous accountability system
 * by locking winning manifestos for 1,825 days.
 */

const STATUS_OPTIONS = [
  { key: 'not_started', label: 'Not Started', icon: 'Timer', color: '#6B6F90' },
  { key: 'in_progress', label: 'In Progress', icon: 'Hammer', color: '#F39C12' },
  { key: 'delivered', label: 'Delivered', icon: 'CheckCircle2', color: '#2ECC71' },
  { key: 'modified', label: 'Modified', icon: 'RefreshCcw', color: '#3498DB' },
  { key: 'unfulfilled', label: 'Unfulfilled', icon: 'XCircle', color: '#E74C3C' },
];

const SAMPLE_PROMISES = [
  {
    constituency: 'Mumbai North',
    winner: 'Candidate A (Party A)',
    promises: [
      { topic: 'Healthcare', text: 'Build 3 new primary health centers in Borivali and Dahisar within 2 years', category: 'Activity' },
      { topic: 'Roads', text: 'Complete the Western Express Highway expansion by 2028', category: 'Truck' },
      { topic: 'Water', text: '24x7 water supply to all wards by 2029', category: 'Droplets' },
    ],
  },
  {
    constituency: 'Pune',
    winner: 'Candidate A (Party A)',
    promises: [
      { topic: 'Infrastructure', text: 'Complete Metro Line 3 by 2027', category: 'Train' },
      { topic: 'Environment', text: 'Restore local river ecosystems', category: 'Leaf' },
      { topic: 'Safety', text: 'CCTV network for all public parks', category: 'Shield' },
    ],
  }
];

export default function FiveYearLedger({ onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const { getLedger, saveLedgerEntry, updateLedgerStatus } = useCivicTracker();

  const [activeTab, setActiveTab] = useState(0);
  const [ledger, setLedger] = useState(() => getLedger());
  const [showSeedPrompt, setShowSeedPrompt] = useState(() => getLedger().length === 0);

  const daysSinceElection = useMemo(() => {
    const electionDay = new Date('2026-05-04');
    const today = new Date();
    return Math.max(0, Math.floor((today - electionDay) / (1000 * 60 * 60 * 24)));
  }, []);

  const yearsRemaining = useMemo(() => {
    return Math.max(0, 5 - Math.floor(daysSinceElection / 365));
  }, [daysSinceElection]);

  const handleSeedLedger = useCallback(() => {
    SAMPLE_PROMISES.forEach((constituency) => {
      constituency.promises.forEach((promise) => {
        saveLedgerEntry({
          constituency: constituency.constituency,
          winner: constituency.winner,
          topic: promise.topic,
          text: promise.text,
          category: promise.category,
        });
      });
    });
    setLedger(getLedger());
    setShowSeedPrompt(false);
  }, [saveLedgerEntry, getLedger]);

  const handleStatusChange = useCallback((index, newStatus) => {
    const updated = updateLedgerStatus(index, newStatus);
    setLedger([...updated]);
  }, [updateLedgerStatus]);

  const grouped = useMemo(() => {
    const map = {};
    ledger.forEach((entry, idx) => {
      const key = entry.constituency || 'General';
      if (!map[key]) map[key] = [];
      map[key].push({ ...entry, originalIndex: idx });
    });
    return Object.entries(map);
  }, [ledger]);

  const stats = useMemo(() => {
    const total = ledger.length;
    const delivered = ledger.filter((e) => e.status === 'Delivered').length;
    const inProgress = ledger.filter((e) => e.status === 'In Progress').length;
    const unfulfilled = ledger.filter((e) => e.status === 'Unfulfilled').length;
    return { total, delivered, inProgress, unfulfilled };
  }, [ledger]);

  return (
    <div className="ledger-view space-y-8 p-1">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Icon name="BookText" size={32} className="text-blue-900" />
            {isKidsMode ? 'Kingdom Promise Book' : '5-Year Promise Ledger'}
          </h2>
          <p className="text-slate-600 font-medium">
            {isKidsMode ? 'Track what the leaders promised to build!' : 'Autonomous accountability system for 2026-2031 cycle.'}
          </p>
        </div>
      </header>

      {/* Accountability Timer */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
           <Icon name="Timer" size={120} />
        </div>
        <div className="relative z-10 space-y-4">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
             <span>Cycle Launch: May 4, 2026</span>
             <span>Expiration: May 2031</span>
           </div>
           <div className="h-3 bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-blue-400"
               initial={{ width: 0 }}
               animate={{ width: `${Math.min((daysSinceElection / (365 * 5)) * 100, 100)}%` }}
               transition={{ duration: 1 }}
             />
           </div>
           <div className="flex items-center gap-3">
              <span className="text-4xl font-black">{yearsRemaining} Years</span>
              <span className="text-sm font-bold opacity-60">Remaining in Term</span>
           </div>
        </div>
      </div>

      {/* Ledger Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'slate' },
            { label: 'Done', value: stats.delivered, color: 'emerald' },
            { label: 'Active', value: stats.inProgress, color: 'amber' },
            { label: 'Missed', value: stats.unfulfilled, color: 'red' }
          ].map(s => (
            <div key={s.label} className={`bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm`}>
               <p className={`text-xl font-black text-${s.color}-600`}>{s.value}</p>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {showSeedPrompt && (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-10 text-center space-y-4">
           <Icon name="Database" size={48} className="mx-auto text-blue-300" />
           <p className="font-bold text-blue-900">Your accountability ledger is currently empty.</p>
           <Button onClick={handleSeedLedger} size="lg" className="px-8">
             Ingest Winning Manifestos
           </Button>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {grouped.map(([name], idx) => (
              <button
                key={name}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === idx ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-400'}`}
              >
                {name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter w-fit flex items-center gap-2">
                 <Icon name="Trophy" size={12} />
                 Winning Candidate: {grouped[activeTab][1]?.[0]?.winner}
              </div>

              <div className="grid gap-3">
                {grouped[activeTab][1].map((entry) => (
                  <div key={entry.originalIndex} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <Icon name={entry.category || 'Target'} size={14} className="text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.topic}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-800 leading-relaxed">{entry.text}</p>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</span>
                       <div className="flex gap-1.5">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s.key}
                              className={`p-2 rounded-lg transition-all ${entry.status === s.label ? 'shadow-inner' : 'hover:bg-slate-50'}`}
                              style={{ 
                                background: entry.status === s.label ? `${s.color}20` : 'transparent',
                                color: entry.status === s.label ? s.color : '#cbd5e1'
                              }}
                              onClick={() => handleStatusChange(entry.originalIndex, s.label)}
                              title={s.label}
                            >
                              <Icon name={s.icon} size={18} />
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
