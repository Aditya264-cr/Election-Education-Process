import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import './TimelineBar.css';

const ELECTION_PHASES = [
  {
    key: 'registration',
    icon: '📝',
    kidsIcon: '🎫',
    start: '2026-01-15',
    end: '2026-03-20',
  },
  {
    key: 'nomination',
    icon: '🙋',
    kidsIcon: '⚔️',
    start: '2026-03-21',
    end: '2026-04-01',
  },
  {
    key: 'campaign',
    icon: '📢',
    kidsIcon: '🎺',
    start: '2026-04-02',
    end: '2026-04-07',
  },
  {
    key: 'polling',
    icon: '🗳️',
    kidsIcon: '🏰',
    start: '2026-04-09',
    end: '2026-04-29',
    detail: 'Apr 9 (Assam/Kerala/Puducherry) • Apr 23 (TN/WB-1) • Apr 29 (WB-2)',
  },
  {
    key: 'counting',
    icon: '🔢',
    kidsIcon: '🔮',
    start: '2026-05-04',
    end: '2026-05-04',
    detail: 'May 4, 2026 — All 5 states',
  },
  {
    key: 'results',
    icon: '🎉',
    kidsIcon: '🏆',
    start: '2026-05-05',
    end: '2026-05-05',
  },
];

function getDaysLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getPhaseStatus(start, end) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now > endDate) return 'completed';
  if (now >= startDate && now <= endDate) return 'active';
  return 'upcoming';
}

export default function TimelineBar() {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();

  const phases = useMemo(() => {
    return ELECTION_PHASES.map((phase) => ({
      ...phase,
      label: t(`timeline_${phase.key}`),
      status: getPhaseStatus(phase.start, phase.end),
      daysLeft: getDaysLeft(phase.end),
    }));
  }, [t]);

  const activeIndex = phases.findIndex(p => p.status === 'active');
  const progressPercent = activeIndex >= 0
    ? ((activeIndex + 0.5) / phases.length) * 100
    : phases.every(p => p.status === 'completed') ? 100 : 0;

  // Countdown to counting day
  const countingDaysLeft = getDaysLeft('2026-05-04');

  return (
    <div className={`timeline-bar glass-panel ${isKidsMode ? 'kids' : ''}`}>
      <div className="timeline-header">
        <h3 className="timeline-title">
          {isKidsMode ? '🗺️ The Adventure Timeline' : t('timeline_title')}
        </h3>
        {countingDaysLeft > 0 && (
          <div className="timeline-countdown">
            <span className="tc-label">Counting Day:</span>
            <span className="tc-days">{countingDaysLeft}</span>
            <span className="tc-unit">days</span>
          </div>
        )}
      </div>

      <div className="timeline-track-container">
        {/* Progress line */}
        <div className="timeline-track">
          <div className="timeline-track-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Phase nodes */}
        <div className="timeline-nodes">
          {phases.map((phase, idx) => (
            <div
              key={phase.key}
              className={`timeline-node ${phase.status}`}
              style={{ left: `${((idx + 0.5) / phases.length) * 100}%` }}
              title={phase.detail || ''}
            >
              <div className="timeline-node-dot">
                <span className="timeline-node-icon">
                  {isKidsMode ? phase.kidsIcon : phase.icon}
                </span>
              </div>
              <div className="timeline-node-label">{phase.label}</div>
              <div className="timeline-node-status">
                {phase.status === 'active' && (
                  <span className="timeline-active-badge">
                    {t('timeline_active')} <strong>{phase.daysLeft} {t('timeline_days_left')}</strong>
                  </span>
                )}
                {phase.status === 'completed' && (
                  <span className="timeline-completed-badge">{t('timeline_completed')} ✓</span>
                )}
                {phase.status === 'upcoming' && (
                  <span className="timeline-upcoming-badge">{t('timeline_upcoming')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
