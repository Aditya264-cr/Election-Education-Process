import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { useCivicTracker } from '../../hooks/useCivicTracker';
import './FiveYearLedger.css';

/**
 * FIVE-YEAR PROMISE LEDGER
 * ========================
 * Post-election promise tracker. Remains dormant until May 4th (Counting Day),
 * then transitions into a 5-year accountability tool.
 *
 * Stores winning promises in localStorage and lets citizens track progress.
 */

const STATUS_OPTIONS = [
  { key: 'not_started', label: 'Not Started', icon: '⏳', color: '#6B6F90' },
  { key: 'in_progress', label: 'In Progress', icon: '🔨', color: '#F39C12' },
  { key: 'delivered', label: 'Delivered', icon: '✅', color: '#2ECC71' },
  { key: 'modified', label: 'Modified', icon: '🔄', color: '#3498DB' },
  { key: 'unfulfilled', label: 'Unfulfilled', icon: '❌', color: '#E74C3C' },
];

const SAMPLE_PROMISES = [
  {
    constituency: 'Mumbai North',
    winner: 'Candidate A (Party A)',
    promises: [
      { topic: 'Healthcare', text: 'Build 3 new primary health centers in Borivali and Dahisar within 2 years', category: '🏥' },
      { topic: 'Roads', text: 'Complete the Western Express Highway expansion by 2028', category: '🛣️' },
      { topic: 'Water', text: '24x7 water supply to all wards by 2029', category: '💧' },
    ],
  },
  {
    constituency: 'New Delhi',
    winner: 'Candidate B (Party A)',
    promises: [
      { topic: 'Education', text: 'Upgrade 50 government schools to smart classrooms', category: '🏫' },
      { topic: 'Employment', text: 'Create 10,000 new jobs through skill development centers', category: '💼' },
      { topic: 'Healthcare', text: 'Free health insurance for all families below ₹5 lakh income', category: '🏥' },
    ],
  },
  {
    constituency: 'Chennai South',
    winner: 'Candidate C (Party C)',
    promises: [
      { topic: 'Water', text: 'Desalination plant to solve Chennai water crisis by 2028', category: '💧' },
      { topic: 'Education', text: 'Tamil medium engineering colleges in every district', category: '🏫' },
      { topic: 'Roads', text: 'Metro Phase 2 completion ahead of schedule', category: '🛣️' },
    ],
  },
  {
    constituency: 'Varanasi',
    winner: 'Candidate D (Party B)',
    promises: [
      { topic: 'Heritage', text: 'Complete Kashi Vishwanath Corridor Phase 2', category: '🏛️' },
      { topic: 'Healthcare', text: 'AIIMS satellite center in Varanasi', category: '🏥' },
      { topic: 'Agriculture', text: 'MSP guarantee for wheat and rice farmers', category: '🌾' },
    ],
  },
];

export default function FiveYearLedger({ onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const { getLedger, saveLedgerEntry, updateLedgerStatus } = useCivicTracker();

  const [activeTab, setActiveTab] = useState(0);
  const [ledger, setLedger] = useState(() => getLedger());
  const [showSeedPrompt, setShowSeedPrompt] = useState(() => getLedger().length === 0);

  // Calculate days since election
  const daysSinceElection = useMemo(() => {
    const electionDay = new Date('2026-05-04');
    const today = new Date();
    return Math.max(0, Math.floor((today - electionDay) / (1000 * 60 * 60 * 24)));
  }, []);

  const yearsRemaining = useMemo(() => {
    return Math.max(0, 5 - Math.floor(daysSinceElection / 365));
  }, [daysSinceElection]);

  // Seed the ledger with sample promises
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

  // Group ledger by constituency
  const grouped = useMemo(() => {
    const map = {};
    ledger.forEach((entry, idx) => {
      const key = entry.constituency || 'General';
      if (!map[key]) map[key] = [];
      map[key].push({ ...entry, originalIndex: idx });
    });
    return Object.entries(map);
  }, [ledger]);

  // Progress stats
  const stats = useMemo(() => {
    const total = ledger.length;
    const delivered = ledger.filter((e) => e.status === 'Delivered').length;
    const inProgress = ledger.filter((e) => e.status === 'In Progress').length;
    const unfulfilled = ledger.filter((e) => e.status === 'Unfulfilled').length;
    return { total, delivered, inProgress, unfulfilled };
  }, [ledger]);

  // Export ledger as text
  const handleExport = useCallback(() => {
    let text = '═══════════════════════════════════════════\n';
    text += '  FRIENDLY NEIGHBOR — 5-YEAR PROMISE LEDGER\n';
    text += '  Election 2026 — Promise Tracker\n';
    text += '═══════════════════════════════════════════\n\n';
    
    grouped.forEach(([constituency, entries]) => {
      text += `📍 ${constituency} (${entries[0]?.winner || ''})\n`;
      text += '───────────────────────────────────────\n';
      entries.forEach((e) => {
        const statusIcon = STATUS_OPTIONS.find((s) => s.label === e.status)?.icon || '⏳';
        text += `  ${e.category} ${e.topic}: ${e.text}\n`;
        text += `     Status: ${statusIcon} ${e.status || 'Not Started'}\n\n`;
      });
    });

    text += `\nGenerated on ${new Date().toLocaleDateString('en-IN')}\n`;
    text += 'Source: Friendly Neighbor Civic AI (friendlyneighbor.app)\n';

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promise-ledger-2026.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [grouped]);

  return (
    <div className="ledger-overlay" id="five-year-ledger">
      <div className="ledger-container glass-panel animate-fadeInScale">
        <button className="ledger-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className="ledger-header">
          <div className="ledger-icon">📒</div>
          <div>
            <h2 className="ledger-title">
              {isKidsMode ? '🏰 The Kingdom Promise Book' : '5-Year Promise Ledger'}
            </h2>
            <p className="ledger-subtitle">
              {isKidsMode
                ? 'Track what the leaders promised to build!'
                : 'Hold elected representatives accountable — track their promises for 5 years'}
            </p>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="ledger-timer">
          <div className="ledger-timer-bar">
            <div
              className="ledger-timer-fill"
              style={{ width: `${Math.min((daysSinceElection / (365 * 5)) * 100, 100)}%` }}
            />
          </div>
          <div className="ledger-timer-labels">
            <span>May 4, 2026</span>
            <span className="ledger-timer-current">
              {daysSinceElection > 0
                ? `Day ${daysSinceElection} — ${yearsRemaining} year${yearsRemaining !== 1 ? 's' : ''} remaining`
                : 'Ledger activates on Counting Day (May 4)'}
            </span>
            <span>May 2031</span>
          </div>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="ledger-stats">
            <div className="ledger-stat">
              <span className="ledger-stat-value">{stats.total}</span>
              <span className="ledger-stat-label">Promises</span>
            </div>
            <div className="ledger-stat delivered">
              <span className="ledger-stat-value">{stats.delivered}</span>
              <span className="ledger-stat-label">Delivered</span>
            </div>
            <div className="ledger-stat progress">
              <span className="ledger-stat-value">{stats.inProgress}</span>
              <span className="ledger-stat-label">In Progress</span>
            </div>
            <div className="ledger-stat unfulfilled">
              <span className="ledger-stat-value">{stats.unfulfilled}</span>
              <span className="ledger-stat-label">Unfulfilled</span>
            </div>
          </div>
        )}

        {/* Seed Prompt */}
        {showSeedPrompt && (
          <div className="ledger-seed">
            <p className="ledger-seed-text">
              {isKidsMode
                ? '📜 The Promise Book is empty! Load the promises made by the winners?'
                : '📋 Your ledger is empty. Load the winning candidates\' promises from the 2026 election?'}
            </p>
            <button className="btn-primary" onClick={handleSeedLedger}>
              📥 Load 2026 Promises
            </button>
          </div>
        )}

        {/* Promise Cards by Constituency */}
        {grouped.length > 0 && (
          <div className="ledger-body">
            {/* Constituency Tabs */}
            <div className="ledger-tabs">
              {grouped.map(([name], idx) => (
                <button
                  key={name}
                  className={`ledger-tab ${activeTab === idx ? 'active' : ''}`}
                  onClick={() => setActiveTab(idx)}
                >
                  📍 {name}
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            {grouped[activeTab] && (
              <div className="ledger-promises">
                <div className="ledger-winner-badge">
                  🏆 {grouped[activeTab][1]?.[0]?.winner || 'Winner'}
                </div>

                {grouped[activeTab][1].map((entry) => (
                  <div key={entry.originalIndex} className="ledger-promise-card glass-card">
                    <div className="ledger-promise-header">
                      <span className="ledger-promise-category">{entry.category}</span>
                      <span className="ledger-promise-topic">{entry.topic}</span>
                    </div>
                    <p className="ledger-promise-text">{entry.text}</p>

                    {/* Status Selector */}
                    <div className="ledger-status-row">
                      <span className="ledger-status-label">Status:</span>
                      <div className="ledger-status-options">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.key}
                            className={`ledger-status-btn ${entry.status === s.label ? 'active' : ''}`}
                            style={{
                              borderColor: entry.status === s.label ? s.color : 'transparent',
                              background: entry.status === s.label ? `${s.color}15` : 'transparent',
                            }}
                            onClick={() => handleStatusChange(entry.originalIndex, s.label)}
                            title={s.label}
                          >
                            {s.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="ledger-footer">
          <button className="btn-secondary" onClick={handleExport}>
            📄 Export Ledger
          </button>
          <span className="ledger-footer-note">
            Data stored locally on your device. Your privacy is guaranteed.
          </span>
        </div>
      </div>
    </div>
  );
}
