import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import scripts from '../../data/storyteller-scripts.json';
import './GreatBeep.css';

const SNACK_OPTIONS = [
  { id: 1, name: 'Samosa 🥟', icon: '🥟', color: '#FF9933' },
  { id: 2, name: 'Ice Cream 🍦', icon: '🍦', color: '#3498DB' },
  { id: 3, name: 'Chocolate 🍫', icon: '🍫', color: '#8B4513' },
  { id: 4, name: 'Pizza 🍕', icon: '🍕', color: '#E74C3C' },
  { id: 5, name: 'Mango 🥭', icon: '🥭', color: '#F39C12' },
];

// Official-style long EVM beep (1kHz square wave, ~800ms with decay)
function playOfficialBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    // Long beep — hold for 600ms then decay
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.9);

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate([200, 50, 200]);
    }

    setTimeout(() => ctx.close(), 1500);
  } catch (e) {
    console.log('Audio not available');
  }
}

// Get Game Master voiceover in current language
function getVoiceover(lang) {
  const vo = scripts.audioScripts?.greatBeepVoiceover;
  if (!vo) return null;
  return vo[lang] || vo.en;
}

export default function GreatBeep({ onClose }) {
  const { t, lang } = useLanguage();
  const [selectedSnack, setSelectedSnack] = useState(null);
  const [phase, setPhase] = useState('choose'); // choose → beeping → vvpat → education
  const [confetti, setConfetti] = useState(false);
  const vvpatTimerRef = useRef(null);

  const voiceover = getVoiceover(lang);

  useEffect(() => {
    return () => {
      if (vvpatTimerRef.current) clearTimeout(vvpatTimerRef.current);
    };
  }, []);

  const handleVoteForSnack = useCallback((snack) => {
    if (phase !== 'choose') return;
    setSelectedSnack(snack);
    setPhase('beeping');

    // Play long beep
    playOfficialBeep();

    // After beep finishes, show VVPAT
    setTimeout(() => {
      setPhase('vvpat');
      setConfetti(true);
    }, 1000);

    // After VVPAT animation, show education
    vvpatTimerRef.current = setTimeout(() => {
      setPhase('education');
    }, 5000);
  }, [phase]);

  const handleReset = () => {
    setSelectedSnack(null);
    setPhase('choose');
    setConfetti(false);
    if (vvpatTimerRef.current) clearTimeout(vvpatTimerRef.current);
  };

  return (
    <div className="greatbeep-overlay" id="great-beep-simulator">
      <div className="greatbeep-container glass-panel animate-fadeInScale">
        <button className="greatbeep-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Confetti burst */}
        {confetti && (
          <div className="greatbeep-confetti">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="gb-confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                  backgroundColor: ['#FF9933', '#FFD700', '#9B59B6', '#2ECC71', '#E74C3C', '#3498DB', '#FF69B4'][i % 7],
                  width: `${6 + Math.random() * 10}px`,
                  height: `${6 + Math.random() * 10}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="greatbeep-header">
          <div className="greatbeep-icon animate-float">🗳️</div>
          <h2 className="greatbeep-title">{t('kids_great_beep')}</h2>
          <p className="greatbeep-subtitle">
            {phase === 'choose' && t('kids_great_beep_subtitle')}
            {phase === 'beeping' && "Listen! The machine is recording your vote..."}
            {phase === 'vvpat' && "Look! A paper slip is printing your choice! 🧾"}
            {phase === 'education' && "Amazing! Let's learn what just happened! 🎓"}
          </p>
        </div>

        {/* ── PHASE: Choose Snack ── */}
        {phase === 'choose' && (
          <div className="greatbeep-ballot">
            <div className="greatbeep-ballot-header">
              <span className="greatbeep-ballot-label">🗳️ BALLOT UNIT</span>
              <span className="greatbeep-ballot-label-sub">VOTE FOR SNACK</span>
            </div>
            <div className="greatbeep-snack-list">
              {SNACK_OPTIONS.map((snack, idx) => (
                <div
                  key={snack.id}
                  className="greatbeep-snack-row"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="greatbeep-led" />
                  <span className="greatbeep-snack-num">{snack.id}.</span>
                  <span className="greatbeep-snack-icon">{snack.icon}</span>
                  <span className="greatbeep-snack-name">{snack.name}</span>
                  <button
                    className="greatbeep-vote-btn"
                    onClick={() => handleVoteForSnack(snack)}
                    aria-label={`Vote for ${snack.name}`}
                    id={`vote-btn-${snack.id}`}
                  >
                    <span className="greatbeep-vote-btn-label">VOTE</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE: Beeping ── */}
        {phase === 'beeping' && (
          <div className="greatbeep-beep-phase">
            <div className="greatbeep-beep-rings">
              <div className="gb-ring gb-ring-1" />
              <div className="gb-ring gb-ring-2" />
              <div className="gb-ring gb-ring-3" />
              <div className="gb-beep-icon">🔊</div>
            </div>
            <p className="greatbeep-beep-text animate-pulse">BEEEEEP!</p>
            <p className="greatbeep-beep-sub">The machine heard your choice!</p>
          </div>
        )}

        {/* ── PHASE: VVPAT Paper Slip ── */}
        {(phase === 'vvpat' || phase === 'education') && selectedSnack && (
          <div className="greatbeep-vvpat-container">
            <div className="greatbeep-vvpat-machine">
              <div className="greatbeep-vvpat-label">VVPAT — Your Paper Proof!</div>
              <div className="greatbeep-vvpat-window">
                <div className={`greatbeep-vvpat-slip ${phase === 'vvpat' ? 'sliding' : 'visible'}`}>
                  <div className="greatbeep-vvpat-content">
                    <div className="greatbeep-vvpat-sr">S.No: {selectedSnack.id}</div>
                    <div className="greatbeep-vvpat-emoji">{selectedSnack.icon}</div>
                    <div className="greatbeep-vvpat-name">{selectedSnack.name}</div>
                    <div className="greatbeep-vvpat-check">✓ CONFIRMED</div>
                    <div className="greatbeep-vvpat-line" />
                  </div>
                </div>
              </div>
              {phase === 'vvpat' && (
                <div className="greatbeep-vvpat-timer">
                  Slip visible for <strong>7 seconds</strong> (just like the real machine!)
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PHASE: Education with Game Master Voice-Over ── */}
        {phase === 'education' && (
          <div className="greatbeep-education animate-fadeInUp">
            {/* Game Master Voice-Over — from storyteller-scripts.json */}
            <div className="greatbeep-edu-voiceover">
              <div className="greatbeep-edu-avatar">🎙️</div>
              <div className="greatbeep-edu-bubble">
                <div className="greatbeep-edu-gm-label">🎮 GAME MASTER</div>
                <p className="greatbeep-edu-quote">
                  "{voiceover}"
                </p>
              </div>
            </div>

            <div className="greatbeep-edu-steps">
              <div className="greatbeep-edu-step">
                <span className="gb-step-num">1</span>
                <span className="gb-step-icon">👆</span>
                <span>You pressed the blue VOTE button</span>
              </div>
              <div className="greatbeep-edu-step">
                <span className="gb-step-num">2</span>
                <span className="gb-step-icon">🔊</span>
                <span>The long <strong>BEEP</strong> confirmed your choice</span>
              </div>
              <div className="greatbeep-edu-step">
                <span className="gb-step-num">3</span>
                <span className="gb-step-icon">🧾</span>
                <span>The VVPAT printed your paper proof</span>
              </div>
              <div className="greatbeep-edu-step">
                <span className="gb-step-num">4</span>
                <span className="gb-step-icon">🔒</span>
                <span>Your vote is now <strong>locked and safe</strong> forever!</span>
              </div>
            </div>

            <div className="greatbeep-edu-result">
              <span>You voted for</span>
              <span className="greatbeep-edu-choice">{selectedSnack?.icon} {selectedSnack?.name}</span>
            </div>

            <button className="btn-primary greatbeep-reset" onClick={handleReset}>
              🎪 Vote Again!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
