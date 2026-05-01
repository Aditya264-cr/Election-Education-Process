import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import Icon from '../DesignSystem/Atoms/Icon';
import './TimelineBar.css';

const ELECTION_PHASES = [
  { key: 'registration', icon: 'FileEdit', kidsIcon: 'Ticket', start: '2026-01-15', end: '2026-03-20' },
  { key: 'nomination', icon: 'UserPlus', kidsIcon: 'Sword', start: '2026-03-21', end: '2026-04-01' },
  { key: 'campaign', icon: 'Megaphone', kidsIcon: 'Music', start: '2026-04-02', end: '2026-04-07' },
  { 
    key: 'polling', 
    icon: 'Fingerprint', 
    kidsIcon: 'Castle', 
    start: '2026-04-09', 
    end: '2026-04-29',
    detail: 'Apr 9 (Assam/Kerala) • Apr 23 (TN/WB-1) • Apr 29 (WB-2)'
  },
  { key: 'counting', icon: 'Binary', kidsIcon: 'Sparkles', start: '2026-05-04', end: '2026-05-04' },
  { key: 'results', icon: 'Trophy', kidsIcon: 'Trophy', start: '2026-05-05', end: '2026-05-05' },
];

export default function TimelineBar({ pcName }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [flowData, setFlowData] = useState(null);
  const [showFlow, setShowFlow] = useState(false);

  // Fetch flow prediction if we have a pcName
  useEffect(() => {
    if (pcName) {
      fetch(`/api/timeline/flow-prediction?pc_name=${pcName}`)
        .then(res => res.json())
        .then(data => setFlowData(data))
        .catch(err => console.error("Flow prediction failed", err));
    }
  }, [pcName]);

  const phases = useMemo(() => {
    const now = new Date();
    return ELECTION_PHASES.map((phase) => {
      const start = new Date(phase.start);
      const end = new Date(phase.end);
      let status = 'upcoming';
      if (now > end) status = 'completed';
      else if (now >= start) status = 'active';
      
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      
      return {
        ...phase,
        label: t(`timeline_${phase.key}`),
        status,
        daysLeft: diff,
      };
    });
  }, [t]);

  const isPollingDay = phases.find(p => p.key === 'polling')?.status === 'active';

  return (
    <div className={`timeline-container space-y-8 ${isKidsMode ? 'kids' : ''}`}>
      <header className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Icon name="Calendar" size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {isKidsMode ? 'The Adventure Timeline' : t('timeline_title')}
          </h3>
        </div>
        {isPollingDay && flowData && (
          <button 
            onClick={() => setShowFlow(!showFlow)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showFlow ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {showFlow ? 'Hide Flow' : 'Show Flow Navigator'}
          </button>
        )}
      </header>

      {/* ── Flow Navigator Heat-map (Autonomous Feature) ── */}
      <AnimatePresence>
        {showFlow && flowData && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-6 shadow-2xl border border-white/10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                    <Icon name="Timer" size={16} />
                    Flow Prediction: {pcName}
                  </h4>
                  <p className="text-xs text-slate-400">Best time to visit: <strong className="text-white">{flowData.best_slot}</strong></p>
                </div>
                {flowData.neighbor_alert && (
                   <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                     <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Heat Alert</span>
                   </div>
                )}
              </div>

              <div className="flex gap-1.5 h-12">
                {flowData.hourly_flow.map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 rounded-md relative group cursor-help"
                    style={{ 
                      backgroundColor: h.is_recommended ? '#0D1D7B' : (h.status === 'Busy' ? '#ef4444' : '#3b82f6'),
                      opacity: 0.3 + (h.score / 10) * 0.7
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-white text-slate-900 text-[9px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap">
                        {h.time_slot}: {h.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">
                <span>7:00 AM</span>
                <span>12:00 PM</span>
                <span>6:00 PM</span>
              </div>

              {flowData.neighbor_alert && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3">
                  <Icon name="Info" size={16} className="text-blue-400 shrink-0" />
                  <p className="text-[10px] leading-relaxed text-slate-300 font-medium">
                    {flowData.neighbor_alert.message}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pt-12 pb-20">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
        
        <div className="flex justify-between relative">
          {phases.map((phase, idx) => (
            <div key={phase.key} className="flex flex-col items-center gap-4 relative z-10 w-16">
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${phase.status === 'active' ? 'bg-blue-600 text-white shadow-lg scale-110' : phase.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
                 <Icon name={isKidsMode ? phase.kidsIcon : phase.icon} size={20} />
               </div>
               <div className="text-center space-y-1">
                 <p className={`text-[10px] font-bold whitespace-nowrap ${phase.status === 'active' ? 'text-blue-600' : 'text-slate-500'}`}>{phase.label}</p>
                 {phase.status === 'active' && (
                   <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">{phase.daysLeft} days left</p>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
