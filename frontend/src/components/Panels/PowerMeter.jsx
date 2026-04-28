import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import victoryData from '../../data/victory-margins.json';
import './PowerMeter.css';

// Approximate "people per street" for contextualizing the margin
function getStreetAnalogy(margin) {
  const peoplePerStreet = 40; // avg Indian urban street
  const streets = Math.max(1, Math.round(margin / peoplePerStreet));
  return streets;
}

export default function PowerMeter({ constituency, onClose }) {
  const { t } = useLanguage();
  const [animatedMargin, setAnimatedMargin] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const data = useMemo(() => {
    if (!constituency?.pc_name) return null;
    return victoryData.constituencies[constituency.pc_name] || null;
  }, [constituency?.pc_name]);

  const latestElection = data?.elections?.[0];
  const previousElection = data?.elections?.[1];

  // Animate the margin counter
  useEffect(() => {
    if (!latestElection) return;
    const target = latestElection.margin;
    const duration = 2000;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedMargin(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else setShowMessage(true);
    };

    requestAnimationFrame(animate);
  }, [latestElection]);

  if (!data || !latestElection) {
    return (
      <div className="power-overlay">
        <div className="power-container glass-panel animate-fadeInScale">
          <button className="power-close" onClick={onClose}>✕</button>
          <div className="power-header">
            <h2 className="power-title">⚡ Your Voice, Your Power</h2>
            <p className="power-subtitle">
              Select a constituency on the map to see how powerful your vote really is.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const marginPercent = Math.min((latestElection.margin / latestElection.totalVoters) * 100, 100);
  const streets = getStreetAnalogy(latestElection.margin);
  const isCloseRace = marginPercent < 5;

  return (
    <div className="power-overlay" id="power-meter">
      <div className="power-container glass-panel animate-fadeInScale">
        <button className="power-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className="power-header">
          <div className="power-icon">⚡</div>
          <h2 className="power-title">How Powerful Is Your Vote?</h2>
          <p className="power-subtitle">
            {constituency.pc_name}, {data.state}
          </p>
        </div>

        {/* The Power Meter Visual */}
        <div className="power-meter-visual">
          <div className="power-meter-track">
            <div
              className={`power-meter-fill ${isCloseRace ? 'close-race' : ''}`}
              style={{ width: `${Math.min(marginPercent * 5, 100)}%` }}
            />
            <div className="power-meter-markers">
              {[0, 25, 50, 75, 100].map(p => (
                <div key={p} className="power-meter-marker" style={{ left: `${p}%` }}>
                  <div className="pmm-tick" />
                  <span className="pmm-label">{p === 0 ? 'Razor thin' : p === 100 ? 'Landslide' : ''}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="power-meter-needle" style={{ left: `${Math.min(marginPercent * 5, 95)}%` }}>
            <div className="pmn-arrow" />
            <span className="pmn-label">{marginPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Margin Counter */}
        <div className="power-margin-box">
          <div className="power-margin-label">Victory Margin ({latestElection.year})</div>
          <div className="power-margin-value">
            {animatedMargin.toLocaleString()} <span className="power-margin-unit">votes</span>
          </div>
        </div>

        {/* The "Street" Message */}
        {showMessage && (
          <div className={`power-message animate-fadeInUp ${isCloseRace ? 'close-race' : ''}`}>
            <div className="power-message-icon">{isCloseRace ? '🔥' : '📊'}</div>
            <p className="power-message-text">
              {isCloseRace ? (
                <>
                  Last time, this election was decided by just <strong>{latestElection.margin.toLocaleString()} votes</strong>. 
                  That's about the number of people who live on <strong>{streets} street{streets > 1 ? 's' : ''}</strong>! 
                  Your vote is literally the tie-breaker.
                </>
              ) : (
                <>
                  The winning margin here was <strong>{latestElection.margin.toLocaleString()} votes</strong> ({marginPercent.toFixed(1)}%). 
                  That's roughly <strong>{streets} street{streets > 1 ? 's' : ''}</strong> worth of neighbors. 
                  Every voice matters — especially yours.
                </>
              )}
            </p>
          </div>
        )}

        {/* Previous Election Comparison */}
        {previousElection && (
          <div className="power-comparison animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="power-comp-header">📈 Trend: How Close Is It Getting?</div>
            <div className="power-comp-bars">
              <div className="power-comp-bar-row">
                <span className="pcb-year">{previousElection.year}</span>
                <div className="pcb-track">
                  <div
                    className="pcb-fill prev"
                    style={{ width: `${Math.min((previousElection.margin / previousElection.totalVoters) * 500, 100)}%` }}
                  />
                </div>
                <span className="pcb-margin">{previousElection.margin.toLocaleString()}</span>
              </div>
              <div className="power-comp-bar-row">
                <span className="pcb-year">{latestElection.year}</span>
                <div className="pcb-track">
                  <div
                    className="pcb-fill latest"
                    style={{ width: `${Math.min((latestElection.margin / latestElection.totalVoters) * 500, 100)}%` }}
                  />
                </div>
                <span className="pcb-margin">{latestElection.margin.toLocaleString()}</span>
              </div>
            </div>
            {latestElection.margin < previousElection.margin && (
              <div className="power-comp-note">
                🔥 The race is <strong>getting tighter</strong> — your vote matters more than ever!
              </div>
            )}
          </div>
        )}

        {/* Source */}
        <div className="power-source">
          ℹ️ {victoryData.note}
        </div>
      </div>
    </div>
  );
}
