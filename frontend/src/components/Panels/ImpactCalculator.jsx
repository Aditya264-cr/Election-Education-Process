import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import './ImpactCalculator.css';

function AnimatedCounter({ target, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return <span>{count.toLocaleString('en-IN')}{suffix}</span>;
}

export default function ImpactCalculator({ constituency, onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();

  if (!constituency) return null;

  const total = constituency.total_electors;
  const voted = constituency.total_voters;
  const didntVote = total - voted;
  const turnout = constituency.turnout_2024;
  const nationalAvg = 65.79;

  return (
    <div className="impact-overlay">
      <div className={`impact-container glass-panel animate-fadeInScale ${isKidsMode ? 'kids' : ''}`}>
        <button className="impact-close" onClick={onClose}>✕</button>

        <div className="impact-header">
          <div className="impact-icon">{isKidsMode ? '🌟' : '📊'}</div>
          <h2 className="impact-title">{t('impact_title')}</h2>
          <p className="impact-subtitle">{t('impact_subtitle')}</p>
          <p className="impact-area-name">{constituency.pc_name}, {constituency.state}</p>
        </div>

        {/* Big Stats */}
        <div className="impact-stats-grid">
          <div className="impact-stat-card voted">
            <div className="impact-stat-value">
              <AnimatedCounter target={voted} />
            </div>
            <div className="impact-stat-label">{t('impact_voted')}</div>
            <div className="impact-stat-icon">🗳️</div>
          </div>
          <div className="impact-stat-card didnt">
            <div className="impact-stat-value">
              <AnimatedCounter target={didntVote} />
            </div>
            <div className="impact-stat-label">{t('impact_didnt')}</div>
            <div className="impact-stat-icon">🏠</div>
          </div>
        </div>

        {/* Comparison Bar */}
        <div className="impact-comparison">
          <div className="impact-comp-row">
            <span className="impact-comp-label">{t('impact_your_area')}</span>
            <div className="impact-comp-bar-bg">
              <div
                className="impact-comp-bar-fill your-area"
                style={{ width: `${turnout}%` }}
              />
            </div>
            <span className="impact-comp-value">{turnout}%</span>
          </div>
          <div className="impact-comp-row">
            <span className="impact-comp-label">{t('impact_national_avg')}</span>
            <div className="impact-comp-bar-bg">
              <div
                className="impact-comp-bar-fill national"
                style={{ width: `${nationalAvg}%` }}
              />
            </div>
            <span className="impact-comp-value">{nationalAvg}%</span>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="impact-message-box">
          <div className="impact-msg-emoji">{isKidsMode ? '🦸' : '💪'}</div>
          <p className="impact-msg-text">
            {t('impact_cta', { count: total.toLocaleString('en-IN') })}
          </p>
          <p className="impact-msg-sub">{t('impact_message')}</p>
        </div>

        {/* Visual People Grid */}
        <div className="impact-people-grid">
          <div className="impact-people-title">
            {isKidsMode ? '👫 If your area had 100 people...' : `${t('impact_turnout')}: Visual`}
          </div>
          <div className="impact-dots">
            {Array.from({ length: 100 }, (_, i) => (
              <div
                key={i}
                className={`impact-dot ${i < Math.round(turnout) ? 'voted' : 'absent'}`}
                style={{ animationDelay: `${i * 15}ms` }}
                title={i < Math.round(turnout) ? 'Voted ✓' : 'Didn\'t vote'}
              />
            ))}
          </div>
          <div className="impact-dots-legend">
            <span><span className="impact-dot-legend voted" /> Voted</span>
            <span><span className="impact-dot-legend absent" /> Stayed Home</span>
          </div>
        </div>
      </div>
    </div>
  );
}
