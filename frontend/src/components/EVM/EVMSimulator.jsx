import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { ListenButton } from '../../hooks/useTextToSpeech';
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

// Haptic feedback (vibration API)
function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]); // short-pause-short
  }
}

// ── Framer Motion variants ──
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.25 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

// 3D tactile press animation for the blue button
const blueButtonVariants = {
  idle: {
    scale: 1, y: 0,
    boxShadow: '0 6px 0 #1E40AF, 0 8px 15px rgba(0,0,0,0.2)',
  },
  hover: {
    scale: 1.02, y: -2,
    boxShadow: '0 8px 0 #1E40AF, 0 12px 20px rgba(0,0,0,0.2)',
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  pressed: {
    scale: 0.95, y: 6,
    boxShadow: '0 0px 0 #1E40AF, 0 2px 4px rgba(0,0,0,0.1)',
    transition: { type: 'spring', stiffness: 600, damping: 20 },
  },
};

// Haptic-like machine shake on vote (more intense)
const machineShakeVariants = {
  idle: { x: 0, rotate: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    rotate: [0, -1, 1, -0.5, 0.5, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export default function EVMSimulator({ onClose }) {
  const { t, lang } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [voted, setVoted] = useState(null);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [ledGlow, setLedGlow] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleVote = useCallback((candidate) => {
    if (isLocked) return;
    setIsLocked(true);
    setVoted(candidate);
    setLedGlow(candidate.id);

    // Haptic vibration + visual shake
    triggerHaptic();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

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
    setIsShaking(false);
  };

  const explainerText = isKidsMode ? t('kids_evm_explain') : t('evm_beep_explain');

  return (
    <AnimatePresence>
      <motion.div
        className="evm-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className={`evm-container glass-panel ${isKidsMode ? 'kids' : ''}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Close button */}
          <motion.button
            className="evm-close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close EVM Simulator"
          >✕</motion.button>

          {/* Title */}
          <div className="evm-header">
            <h2 className="evm-title">
              {isKidsMode ? '✨ ' + t('kids_evm_title') + ' ✨' : '🗳️ ' + t('evm_title')}
            </h2>
            <p className="evm-subtitle">
              {isKidsMode ? t('kids_evm_explain') : t('evm_subtitle')}
              <ListenButton
                text={isKidsMode ? t('kids_evm_explain') : t('evm_subtitle')}
                lang={lang}
                label="Listen to instructions"
              />
            </p>
          </div>

          {/* EVM Machine — shakes on vote */}
          <motion.div
            className="evm-machine"
            variants={machineShakeVariants}
            animate={isShaking ? 'shake' : 'idle'}
          >
            {/* Ballot Unit (Left) */}
            <div className="evm-ballot-unit">
              <div className="evm-unit-label">{t('evm_ballot_unit')}</div>
              <div className="evm-candidate-list">
                {CANDIDATES.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    className={`evm-candidate-row ${voted?.id === c.id ? 'selected' : ''} ${isLocked && voted?.id !== c.id ? 'disabled' : ''}`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                  >
                    {/* LED indicator */}
                    <motion.div
                      className={`evm-led ${ledGlow === c.id ? 'active' : ''}`}
                      style={{ '--led-color': c.color }}
                      animate={ledGlow === c.id ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />

                    {/* Candidate info */}
                    <div className="evm-candidate-info">
                      <span className="evm-candidate-num">{c.id}.</span>
                      <span className="evm-candidate-symbol">{c.symbol}</span>
                      <span className="evm-candidate-name">{c.name}</span>
                    </div>

                    {/* Blue button — 3D tactile press */}
                    <motion.button
                      className="evm-blue-btn"
                      onClick={() => handleVote(c)}
                      disabled={isLocked}
                      aria-label={`Vote for ${c.name}`}
                      variants={blueButtonVariants}
                      initial="idle"
                      whileHover={!isLocked ? "hover" : "idle"}
                      whileTap={!isLocked ? "pressed" : "idle"}
                    >
                      <div className="evm-btn-inner" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              {!voted && (
                <motion.div
                  className="evm-instruction"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ☝️ {t('evm_press')}
                </motion.div>
              )}
            </div>

            {/* Control Unit (Right) */}
            <div className="evm-control-unit">
              <div className="evm-unit-label">{t('evm_control_unit')}</div>
              <div className="evm-cu-body">
                {/* Display */}
                <div className="evm-cu-display">
                  {voted ? (
                    <motion.div
                      className="evm-cu-voted"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <span className="evm-cu-check">✓</span>
                      <span>VOTE RECORDED</span>
                    </motion.div>
                  ) : (
                    <div className="evm-cu-ready">READY</div>
                  )}
                </div>

                {/* Beep indicator */}
                <motion.div
                  className={`evm-beep-indicator ${voted ? 'beeped' : ''}`}
                  animate={voted ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <div className="evm-beep-ring" />
                  <div className="evm-beep-ring delay" />
                  <span className="evm-beep-icon">{voted ? '🔊' : '🔇'}</span>
                </motion.div>

                {/* Total votes counter */}
                <div className="evm-cu-counter">
                  <span className="evm-cu-counter-label">Total</span>
                  <motion.span
                    className="evm-cu-counter-value"
                    animate={voted ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {voted ? '001' : '000'}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* VVPAT Paper Slip */}
          <AnimatePresence>
            {showVVPAT && voted && (
              <motion.div
                className="evm-vvpat-container"
                initial={{ opacity: 0, y: -30, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 30, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="evm-vvpat-label">VVPAT</div>
                <motion.div
                  className="evm-vvpat-slip"
                  initial={{ rotateX: -90 }}
                  animate={{ rotateX: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="evm-vvpat-content">
                    <div className="evm-vvpat-sr">S.No: {voted.id}</div>
                    <div className="evm-vvpat-symbol">{voted.symbol}</div>
                    <div className="evm-vvpat-name">{voted.name}</div>
                    <div className="evm-vvpat-line" />
                  </div>
                </motion.div>
                <div className="evm-vvpat-timer">
                  {t('evm_vvpat')} <span className="evm-vvpat-countdown">7s</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Explainer Section */}
          <AnimatePresence>
            {showExplainer && (
              <motion.div
                className="evm-explainer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.div
                  className="evm-explainer-icon"
                  animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  {isKidsMode ? '🎉' : '💡'}
                </motion.div>
                <h3>
                  {isKidsMode ? t('kids_vote_counted') : t('evm_beep_title')}
                  <ListenButton text={explainerText} lang={lang} label="Listen to explanation" />
                </h3>
                <p>{isKidsMode ? t('kids_evm_explain') : t('evm_beep_explain')}</p>
                <div className="evm-explainer-steps">
                  {[
                    isKidsMode ? 'You pressed the button! ☝️' : 'You pressed the blue button',
                    isKidsMode ? 'The beep means: "I heard you!" 🔊' : 'The beep confirmed your vote was recorded',
                    isKidsMode ? 'A magic ticket appeared! 🎫' : 'The VVPAT slip showed your choice for 7 seconds',
                    isKidsMode ? 'Your voice has been counted! 🎊' : 'Your vote is now safely stored — democracy in action!',
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      className="evm-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                    >
                      <span className="evm-step-num">{i + 1}</span>
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  className="btn-primary evm-reset-btn"
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('evm_reset')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
