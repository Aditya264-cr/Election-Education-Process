import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import Icon from '../DesignSystem/Atoms/Icon';
import './NeighborPanel.css';

export default function NeighborPanel({ constituency, onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();

  if (!constituency) return null;

  const turnoutPercent = constituency.turnout_2024;
  const totalVoters = constituency.total_voters;
  const totalElectors = constituency.total_electors;
  const didntVote = totalElectors - totalVoters;

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

      {/* Info Cards */}
      <div className="np-cards">
        <div className="np-card" style={{ animationDelay: '0.1s' }}>
          <div className="np-card-label">{isKidsMode ? t('kids_constituency') : t('panel_pc')}</div>
          <div className="np-card-value">{constituency.pc_name}</div>
          <div className="np-card-badge">PC #{constituency.pc_no}</div>
        </div>

        <div className="np-card" style={{ animationDelay: '0.2s' }}>
          <div className="np-card-label">{t('panel_ac')}</div>
          <div className="np-card-value">{constituency.ac_name}</div>
        </div>

        <div className="np-card" style={{ animationDelay: '0.3s' }}>
          <div className="np-card-label">{t('panel_mp')}</div>
          <div className="np-card-value np-mp-name">{constituency.mp}</div>
          <div className="np-card-sub text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Member of Parliament</div>
        </div>

        <div className="np-card" style={{ animationDelay: '0.4s' }}>
          <div className="np-card-label flex items-center gap-2">
             <Icon name="MapPin" size={14} className="text-blue-500" />
             {isKidsMode ? 'Castle Location' : t('panel_booth')}
          </div>
          <div className="np-card-value np-booth">{constituency.booth}</div>
        </div>
      </div>

      {/* Turnout Mini-Stats */}
      <div className="np-turnout-section" style={{ animationDelay: '0.5s' }}>
        <div className="np-turnout-header">
          <span className="font-bold text-slate-700">{t('panel_turnout')}</span>
          <span className="np-turnout-percent text-blue-600">{turnoutPercent}%</span>
        </div>
        <div className="np-turnout-bar-bg bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
          <div
            className="np-turnout-bar-fill bg-blue-500 h-full"
            style={{ width: `${turnoutPercent}%` }}
          />
        </div>
        <div className="np-turnout-stats flex justify-between mt-3">
          <div>
            <span className="np-stat-num font-bold">{(totalVoters / 1000).toFixed(0)}K</span>
            <span className="np-stat-label text-slate-500 text-sm"> {t('impact_voted')}</span>
          </div>
          <div className="text-right">
            <span className="np-stat-num font-bold">{(didntVote / 1000).toFixed(0)}K</span>
            <span className="np-stat-label text-slate-500 text-sm"> {t('impact_didnt')}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="np-footer mt-auto pt-6 border-t border-slate-100 flex items-start gap-2">
        <Icon name="Info" size={14} className="text-slate-300 shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-400 leading-normal italic">{t('disclaimer')}</span>
      </div>
    </div>
  );
}
