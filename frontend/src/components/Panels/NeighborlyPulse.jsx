import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import rumorData from '../../data/rumor-firewall.json';
import scripts from '../../data/storyteller-scripts.json';
import './NeighborlyPulse.css';

// Find the storyteller script matching a rumor, in the correct language
function getScript(rumorId, lang) {
  const script = scripts.scripts.find(s => s.rumorId === rumorId);
  if (!script) return null;
  // Fallback chain: requested lang → en
  return script[lang] || script.en || null;
}

function hasTraceableSource(activeRumor) {
  const sourceUrl = (activeRumor?.sourceUrl || '').toLowerCase();
  return sourceUrl.includes('.gov.in') || sourceUrl.endsWith('.pdf');
}

// Simulated "trending rumor" detection
function useRumorMonitor() {
  const [activeRumor, setActiveRumor] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const rumors = rumorData.rumors.filter(r => !dismissed.has(r.id));
    
    const timer = setTimeout(() => {
      if (rumors.length > 0) {
        const idx = Math.floor(Math.random() * rumors.length);
        setActiveRumor(rumors[idx]);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const dismissRumor = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]));
    setActiveRumor(null);
  }, []);

  return { activeRumor, dismissRumor };
}

export default function NeighborlyPulse() {
  const { t, lang } = useLanguage();
  const { activeRumor, dismissRumor } = useRumorMonitor();
  const [expanded, setExpanded] = useState(false);

  // Get the storyteller "gentle persuasion" script for the active rumor
  const storytellerScript = activeRumor ? getScript(activeRumor.id, lang) : null;
  const sourceTraceable = hasTraceableSource(activeRumor);

  useEffect(() => {
    if (activeRumor) {
      setExpanded(false);
      const timer = setTimeout(() => setExpanded(true), 500);
      return () => clearTimeout(timer);
    }
  }, [activeRumor]);

  // No rumor active — show green "all clear" footer
  if (!activeRumor) {
    return (
      <div className="pulse-footer pulse-green" id="neighborly-pulse">
        <div className="pulse-footer-inner">
          <span className="pulse-status-dot green" />
          <span className="pulse-status-text">
            🟢 {t('pulse_all_clear')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`pulse-footer pulse-yellow ${expanded ? 'expanded' : ''}`} id="neighborly-pulse-alert">
      <div className="pulse-footer-inner">
        <span className="pulse-status-dot yellow" />
        <div className="pulse-alert-content">
          <div className="pulse-alert-header" onClick={() => setExpanded(!expanded)}>
            <span className="pulse-alert-icon">⚠️</span>
            <span className="pulse-alert-text">
              {t('pulse_alert', { topic: activeRumor.shortAlert })}
            </span>
            <button className="pulse-expand-btn" aria-label={expanded ? 'Collapse' : 'Expand'}>
              {expanded ? '▼' : '▲'}
            </button>
          </div>

          {/* Expanded detail with Storyteller scripts integrated */}
          {expanded && (
            <div className="pulse-detail animate-fadeInUp">
              <div className="pulse-detail-card">
                {/* The Myth */}
                <div className="pulse-myth-section">
                  <div className="pulse-section-label">
                    <span className="pulse-badge myth">❌ {t('pulse_myth_label')}</span>
                  </div>
                  <p className="pulse-myth-text">"{activeRumor.myth}"</p>
                </div>

                {/* Gentle Persuasion — Storyteller script */}
                {storytellerScript && sourceTraceable && (
                  <div className="pulse-storyteller-section">
                    <div className="pulse-section-label">
                      <span className="pulse-badge storyteller">🏘️ YOUR NEIGHBOR SAYS</span>
                    </div>
                    <div className="pulse-storyteller-bubble">
                      <div className="pulse-storyteller-avatar">🏘️</div>
                      <div className="pulse-storyteller-content">
                        <p className="pulse-storyteller-text">{storytellerScript.script}</p>
                        {storytellerScript.closingLine && (
                          <p className="pulse-storyteller-closing">{storytellerScript.closingLine}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {!sourceTraceable && (
                  <div className="pulse-storyteller-section">
                    <div className="pulse-section-label">
                      <span className="pulse-badge storyteller">🏘️ COMPLIANCE CHECK</span>
                    </div>
                    <div className="pulse-storyteller-bubble">
                      <div className="pulse-storyteller-avatar">🏘️</div>
                      <div className="pulse-storyteller-content">
                        <p className="pulse-storyteller-text">
                          I want to be 100% sure I&apos;m giving you the right info for your area. I&apos;m double-checking the official records right now. In the meantime, here is the official ECI helpline (1950).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* The Official Fact */}
                <div className="pulse-fact-section">
                  <div className="pulse-section-label">
                    <span className="pulse-badge fact">✅ {t('pulse_fact_label')}</span>
                  </div>
                  <p className="pulse-fact-text">{activeRumor.fact}</p>
                </div>

                {/* Source */}
                <div className="pulse-source-section">
                  <span className="pulse-source-icon">{activeRumor.icon}</span>
                  <div className="pulse-source-info">
                    <span className="pulse-source-label">{t('pulse_source')}</span>
                    <a 
                      href={activeRumor.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pulse-source-link"
                    >
                      {activeRumor.source} →
                    </a>
                    {/* PDF link from storyteller script */}
                    {storytellerScript && (
                      <a
                        href={scripts.scripts.find(s => s.rumorId === activeRumor.id)?.sourcePdf || activeRumor.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pulse-source-pdf"
                      >
                        📄 Download ECI PDF →
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pulse-actions">
                <button 
                  className="pulse-dismiss-btn"
                  onClick={() => dismissRumor(activeRumor.id)}
                >
                  ✓ {t('pulse_dismiss')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
