import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../DesignSystem/Atoms/Icon';
import { ListenButton } from '../../hooks/useTextToSpeech';
import { useLanguage } from '../../hooks/useLanguage';
import './LiveNerveCenter.css';

export default function LiveNerveCenter({ pcName, stateName, onClose }) {
  const { lang } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = () => {
      fetch(`/api/timeline/live-results?state=${stateName}&pc_name=${pcName}`)
        .then(res => res.json())
        .then(resData => {
          if (isMounted) {
            setData(resData);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Failed to fetch live results", err);
          if (isMounted) setLoading(false);
        });
    };

    fetchResults();
    const interval = setInterval(fetchResults, 30000); // Poll every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pcName, stateName]);

  return (
    <div className="nerve-center glass-panel p-6 rounded-3xl space-y-6 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg relative">
            <Icon name="Activity" size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Live Nerve Center</h2>
            <p className="text-xs font-bold text-slate-500">{stateName} Assembly Elections 2026</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
          <Icon name="X" size={20} />
        </button>
      </header>

      {loading || !data ? (
        <div className="space-y-4">
           <div className="skeleton h-32 w-full rounded-2xl" />
           <div className="skeleton h-20 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Majority Meter */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
               <Icon name="BarChartBig" size={100} />
             </div>
             <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Race to {data.live_data.magic_number}</p>
                    <p className="text-sm font-bold text-slate-900">Total Seats: {data.live_data.total_seats}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
                      <Icon name="CheckCircle2" size={10} /> ECI Verified
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                   {Object.entries(data.live_data.leads).map(([party, seats], i) => (
                     <div key={party} className="flex items-center gap-3">
                       <span className="text-xs font-bold text-slate-700 w-24 truncate">{party}</span>
                       <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(seats / data.live_data.total_seats) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                       </div>
                       <span className="text-sm font-black text-slate-900 w-8 text-right">{seats}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Civic Oracle Insight */}
          <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800 flex gap-4 items-start relative">
             <div className="p-2 bg-white/10 rounded-lg shrink-0">
                <Icon name="Cpu" size={24} className="text-blue-300" />
             </div>
             <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-300">Civic Oracle Analysis</h4>
                  <ListenButton text={data.insight} lang={lang} />
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {data.insight}
                </p>
             </div>
             {/* 5-year lock readiness badge */}
             <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 rotate-[-5deg]">
               <Icon name="Lock" size={10} /> 5-Year Ledger Ready
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
