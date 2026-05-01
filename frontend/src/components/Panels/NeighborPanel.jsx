import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import Icon from '../DesignSystem/Atoms/Icon';
import './NeighborPanel.css';

export default function NeighborPanel({ constituency, onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();

  if (!constituency) return null;

  const intelligence = constituency.intelligence || {};
  const boothHealth = intelligence.booth_health || {};
  const localIssues = intelligence.local_issues || [];
  const voteRoi = intelligence.vote_roi || "";
  const accessibility = intelligence.accessibility || {};
  const dignityScore = accessibility.dignity_score || 0;
  const amfFeatures = accessibility.features || [];

  return (
    <div className={`neighbor-panel glass-panel animate-slideInRight ${isKidsMode ? 'kids' : ''}`}>
      {/* Header */}
      <div className="np-header">
        <div className="np-title-area">
          <div className="np-icon-wrap">
            <Icon name={isKidsMode ? 'Castle' : 'Building2'} size={24} />
          </div>
          <div>
            <h2 className="np-title">
              {isKidsMode ? t('kids_booth_name') : t('panel_title')}
            </h2>
            <p className="np-subtitle text-slate-500">
              {isKidsMode
                ? `Welcome to the ${constituency.pc_name} Kingdom!`
                : constituency.state}
            </p>
          </div>
        </div>
        <button className="np-close" onClick={onClose} aria-label="Close">
          <Icon name="X" size={20} />
        </button>
      </div>

      <div className="np-content space-y-6 overflow-y-auto pr-2">
        {/* Dignity Navigator: Accessibility Score */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-4">
          <div className="p-2 bg-emerald-100 rounded-lg h-fit text-emerald-600">
            <Icon name="Accessibility" size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-emerald-900 text-sm">Dignity Rating</h3>
               <span className="text-xl font-black text-emerald-600">{dignityScore}%</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {amfFeatures.map((f, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/60 border border-emerald-200 text-emerald-700 text-[9px] font-bold rounded-md">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Layer 1: The Hook (Predictive Metrics) */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
          <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600">
            <Icon name="Timer" size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-blue-900 text-sm">Predictive Polling Navigator</h3>
            <p className="text-xs text-blue-700">Best time to vote: <strong>{boothHealth.best_time_to_vote}</strong></p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Current Queue: {boothHealth.current_queue_wait_mins} mins</span>
            </div>
          </div>
        </div>

        {/* Layer 2: The Info (Local Impact / Vote ROI) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Icon name="Zap" size={16} className="text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Hyper-Local "Why" Engine</h3>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-sm font-medium text-slate-700 mb-3">{voteRoi}</p>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Regional Projects</p>
              {localIssues.map((issue, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3 pb-2 border-b border-slate-200 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{issue.title}</p>
                    <p className="text-[10px] text-slate-500">{issue.impact}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${issue.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layer 3: Identity Cards */}
        <div className="np-cards grid grid-cols-2 gap-3">
          <div className="np-card col-span-2">
            <div className="np-card-label">{t('panel_mp')}</div>
            <div className="np-card-value font-serif text-lg">{constituency.mp}</div>
          </div>

          <div className="np-card">
            <div className="np-card-label">{t('panel_pc')}</div>
            <div className="np-card-value text-sm">{constituency.pc_name}</div>
          </div>

          <div className="np-card">
            <div className="np-card-label">{t('panel_ac')}</div>
            <div className="np-card-value text-sm">{constituency.ac_name}</div>
          </div>

          <div className="np-card col-span-2">
            <div className="np-card-label flex items-center gap-2">
              <Icon name="MapPin" size={12} className="text-blue-500" />
              {t('panel_booth')}
            </div>
            <div className="np-card-value text-xs font-medium leading-relaxed">{constituency.booth}</div>
          </div>
        </div>

        {/* Layer 4: Progressive Disclosure Action */}
        <a 
          href="https://voters.eci.gov.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          <Icon name="Search" size={18} />
          <span>Check Your Name on Roll</span>
          <Icon name="ExternalLink" size={14} className="opacity-50" />
        </a>
      </div>

      {/* Disclaimer */}
      <div className="np-footer pt-4 border-t border-slate-100 flex items-start gap-2">
        <Icon name="Info" size={14} className="text-slate-300 shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-400 leading-normal italic">{t('disclaimer')}</span>
      </div>
    </div>
  );
}
