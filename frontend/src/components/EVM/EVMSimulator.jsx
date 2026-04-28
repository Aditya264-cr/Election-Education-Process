import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import './EVMSimulator.css';

const CANDIDATES = [
  { id: 1, name: 'Party Lotus', symbol: '🪷', color: '#FF9933' },
  { id: 2, name: 'Party Hand', symbol: '✋', color: '#00BFFF' },
  { id: 3, name: 'Party Cycle', symbol: '🚲', color: '#E74C3C' },
  { id: 4, name: 'Party Broom', symbol: '🧹', color: '#2ECC71' },
  { id: 5, name: 'NOTA', symbol: '❌', color: '#888' },
];

// Generate beep using Web Audio API (1kHz, 200ms — authentic EVM tone)
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    console.log('Audio not available');
  }
}

export default function EVMSimulator({ onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [voted, setVoted] = useState(null);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [ledGlow, setLedGlow] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleVote = useCallback((candidate) => {
    if (isLocked) return;
    setIsLocked(true);
    setVoted(candidate);
    setLedGlow(candidate.id);

    // Play the beep
    playBeep();

    // Show VVPAT after short delay
    setTimeout(() => {
      setShowVVPAT(true);
    }, 400);

    // Hide VVPAT after 7 seconds (like real EVM)
    setTimeout(() => {
      setShowVVPAT(false);
      setShowExplainer(true);
    }, 7400);
  }, [isLocked]);

  const handleReset = () => {
    setVoted(null);
    setShowVVPAT(false);
    setShowExplainer(false);
    setLedGlow(null);
    setIsLocked(false);
  };

  return (
    <div className="evm-overlay">
      <div className={`evm-container glass-panel animate-fadeInScale ${isKidsMode ? 'kids' : ''}`}>
        {/* Close button */}
        <button className="evm-close-btn" onClick={onClose}>✕</button>

        {/* Title */}
        <div className="evm-header">
          <h2 className="evm-title">
            {isKidsMode ? '✨ ' + t('kids_evm_title') + ' ✨' : '🗳️ ' + t('evm_title')}
          </h2>
          <p className="evm-subtitle">
            {isKidsMode ? t('kids_evm_explain') : t('evm_subtitle')}
          </p>
        </div>

        {/* EVM Machine */}
        <div className="evm-machine">
          {/* Ballot Unit (Left) */}
          <div className="evm-ballot-unit">
            <div className="evm-unit-label">{t('evm_ballot_unit')}</div>
            <div className="evm-candidate-list">
              {CANDIDATES.map((c, idx) => (
                <div
                  key={c.id}
                  className={`evm-candidate-row ${voted?.id === c.id ? 'selected' : ''} ${isLocked && voted?.id !== c.id ? 'disabled' : ''}`}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* LED indicator */}
                  <div className={`evm-led ${ledGlow === c.id ? 'active' : ''}`}
                    style={{ '--led-color': c.color }}
                  />

                  {/* Candidate info */}
                  <div className="evm-candidate-info">
                    <span className="evm-candidate-num">{c.id}.</span>
                    <span className="evm-candidate-symbol">{c.symbol}</span>
                    <span className="evm-candidate-name">{c.name}</span>
                  </div>

                  {/* Blue button */}
                  <button
                    className="evm-blue-btn"
                    onClick={() => handleVote(c)}
                    disabled={isLocked}
                    aria-label={`Vote for ${c.name}`}
                  >
                    <div className="evm-btn-inner" />
                  </button>
                </div>
              ))}
            </div>
            {!voted && (
              <div className="evm-instruction animate-pulse">
                👆 {t('evm_press')}
              </div>
            )}
          </div>

          {/* Control Unit (Right) */}
          <div className="evm-control-unit">
            <div className="evm-unit-label">{t('evm_control_unit')}</div>
            <div className="evm-cu-body">
              {/* Display */}
              <div className="evm-cu-display">
                {voted ? (
                  <div className="evm-cu-voted">
                    <span className="evm-cu-check">✓</span>
                    <span>VOTE RECORDED</span>
                  </div>
                ) : (
                  <div className="evm-cu-ready">READY</div>
                )}
              </div>

              {/* Beep indicator */}
              <div className={`evm-beep-indicator ${voted ? 'beeped' : ''}`}>
                <div className="evm-beep-ring" />
                <div className="evm-beep-ring delay" />
                <span className="evm-beep-icon">{voted ? '🔊' : '🔇'}</span>
              </div>

              {/* Total votes counter */}
              <div className="evm-cu-counter">
                <span className="evm-cu-counter-label">Total</span>
                <span className="evm-cu-counter-value">{voted ? '001' : '000'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VVPAT Paper Slip */}
        {showVVPAT && voted && (
          <div className="evm-vvpat-container">
            <div className="evm-vvpat-label">VVPAT</div>
            <div className="evm-vvpat-slip">
              <div className="evm-vvpat-content">
                <div className="evm-vvpat-sr">S.No: {voted.id}</div>
                <div className="evm-vvpat-symbol">{voted.symbol}</div>
                <div className="evm-vvpat-name">{voted.name}</div>
                <div className="evm-vvpat-line" />
              </div>
            </div>
            <div className="evm-vvpat-timer">
              {t('evm_vvpat')} <span className="evm-vvpat-countdown">7s</span>
            </div>
          </div>
        )}

        {/* Explainer Section */}
        {showExplainer && (
          <div className="evm-explainer animate-fadeInUp">
            <div className="evm-explainer-icon">
              {isKidsMode ? '🎉' : '💡'}
            </div>
            <h3>{isKidsMode ? t('kids_vote_counted') : t('evm_beep_title')}</h3>
            <p>{isKidsMode ? t('kids_evm_explain') : t('evm_beep_explain')}</p>
            <div className="evm-explainer-steps">
              <div className="evm-step">
                <span className="evm-step-num">1</span>
                <span>{isKidsMode ? 'You pressed the button! 👆' : 'You pressed the blue button'}</span>
              </div>
              <div className="evm-step">
                <span className="evm-step-num">2</span>
                <span>{isKidsMode ? 'The beep means: "I heard you!" 🔊' : 'The beep confirmed your vote was recorded'}</span>
              </div>
              <div className="evm-step">
                <span className="evm-step-num">3</span>
                <span>{isKidsMode ? 'A magic ticket appeared! 🎫' : 'The VVPAT slip showed your choice for 7 seconds'}</span>
              </div>
              <div className="evm-step">
                <span className="evm-step-num">4</span>
                <span>{isKidsMode ? 'Your voice has been counted! 🎊' : 'Your vote is now safely stored — democracy in action!'}</span>
              </div>
            </div>
            <button className="btn-primary evm-reset-btn" onClick={handleReset}>
              {t('evm_reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
