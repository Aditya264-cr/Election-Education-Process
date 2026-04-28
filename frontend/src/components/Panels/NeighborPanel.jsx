import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
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
          <span className="np-icon">{isKidsMode ? '🏰' : '🏘️'}</span>
          <div>
            <h2 className="np-title">
              {isKidsMode ? t('kids_booth_name') : t('panel_title')}
            </h2>
            <p className="np-subtitle">
              {isKidsMode
                ? `Welcome to the ${constituency.pc_name} Kingdom!`
                : constituency.state}
            </p>
          </div>
        </div>
        <button className="np-close" onClick={onClose} aria-label="Close">✕</button>
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
          <div className="np-card-sub">Member of Parliament</div>
        </div>

        <div className="np-card" style={{ animationDelay: '0.4s' }}>
          <div className="np-card-label">{isKidsMode ? '🏰 Castle Location' : t('panel_booth')}</div>
          <div className="np-card-value np-booth">{constituency.booth}</div>
        </div>
      </div>

      {/* Turnout Mini-Stats */}
      <div className="np-turnout-section" style={{ animationDelay: '0.5s' }}>
        <div className="np-turnout-header">
          <span>{t('panel_turnout')}</span>
          <span className="np-turnout-percent">{turnoutPercent}%</span>
        </div>
        <div className="np-turnout-bar-bg">
          <div
            className="np-turnout-bar-fill"
            style={{ width: `${turnoutPercent}%` }}
          />
        </div>
        <div className="np-turnout-stats">
          <div>
            <span className="np-stat-num">{(totalVoters / 1000).toFixed(0)}K</span>
            <span className="np-stat-label"> {t('impact_voted')}</span>
          </div>
          <div>
            <span className="np-stat-num">{(didntVote / 1000).toFixed(0)}K</span>
            <span className="np-stat-label"> {t('impact_didnt')}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="np-disclaimer">
        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>ℹ️ {t('disclaimer')}</span>
      </div>
    </div>
  );
}
