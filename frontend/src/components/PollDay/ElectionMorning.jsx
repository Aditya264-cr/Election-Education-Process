import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { getElectionGreeting, getElectionDayType } from '../../data/electionGreetings';
import './ElectionMorning.css';

/**
 * ELECTION MORNING OVERLAY
 * =========================
 * Full-screen greeting on polling day (Apr 29) and counting day (May 4).
 * Auto-detects date, shows the right language, Bengali for WB users.
 */
export default function ElectionMorning({ userState, onDismiss }) {
  const { lang } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [dayType, setDayType] = useState(null);

  useEffect(() => {
    const type = getElectionDayType();
    if (!type) return;

    // Check if already dismissed today
    const dismissKey = `fn-greeting-dismissed-${new Date().toISOString().slice(0, 10)}`;
    if (localStorage.getItem(dismissKey)) return;

    const g = getElectionGreeting(lang, userState);
    if (g) {
      setGreeting(g);
      setDayType(type);
      // Small delay for dramatic entrance
      setTimeout(() => setVisible(true), 500);
    }
  }, [lang, userState]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    const dismissKey = `fn-greeting-dismissed-${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(dismissKey, 'true');
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 400);
  }, [onDismiss]);

  if (!greeting || !visible) return null;

  return (
    <div className={`em-overlay ${visible ? 'active' : ''}`} id="election-morning">
      <div className="em-container animate-fadeInScale">
        {/* Tricolor ribbon */}
        <div className="em-ribbon">
          <div className="em-ribbon-saffron" />
          <div className="em-ribbon-white" />
          <div className="em-ribbon-green" />
        </div>

        {/* National Emblem */}
        <div className="em-emblem">{dayType === 'polling' ? '🗳️' : '🔢'}</div>

        {/* Greeting */}
        <h1 className="em-greeting">{greeting.greeting}</h1>

        {/* Neighbor avatar */}
        <div className="em-neighbor">
          <div className="em-neighbor-avatar">{isKidsMode ? '🏰' : '🏘️'}</div>
          <div className="em-neighbor-label">
            {isKidsMode ? 'Your Adventure Guide says:' : 'Your Friendly Neighbor says:'}
          </div>
        </div>

        {/* Speech */}
        <p className="em-speech">{greeting.speech}</p>

        {/* Booth Tip */}
        {greeting.boothTip && (
          <div className="em-tip">
            <span className="em-tip-icon">💡</span>
            <span className="em-tip-text">{greeting.boothTip}</span>
          </div>
        )}

        {/* Closing */}
        <p className="em-closing">{greeting.closingLine}</p>

        {/* Flag animation */}
        <div className="em-flag">🇮🇳</div>

        {/* CTA */}
        <button className="em-cta btn-primary" onClick={handleDismiss}>
          {dayType === 'polling'
            ? (isKidsMode ? '🎪 Let\'s Explore!' : '🗳️ Let\'s Go Vote!')
            : (isKidsMode ? '🔮 See the Magic!' : '📊 See Live Results!')}
        </button>
      </div>
    </div>
  );
}
