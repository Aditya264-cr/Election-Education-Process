import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { ListenButton } from '../../hooks/useTextToSpeech';
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

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function ImpactCalculator({ constituency, onClose }) {
  const { t, lang } = useLanguage();
  const { isKidsMode } = useKidsMode();

  if (!constituency) return null;

  const total = constituency.total_electors;
  const voted = constituency.total_voters;
  const didntVote = total - voted;
  const turnout = constituency.turnout_2024;
  const nationalAvg = 65.79;

  const impactText = `In ${constituency.pc_name}, ${voted.toLocaleString()} neighbors voted out of ${total.toLocaleString()} eligible voters. That's a ${turnout}% turnout. Your vote is 1 in ${total.toLocaleString()} — that's more powerful than you think!`;

  return (
    <AnimatePresence>
      <motion.div className="impact-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit">
        <motion.div className={`impact-container glass-panel ${isKidsMode ? 'kids' : ''}`} variants={panelVariants} initial="hidden" animate="visible">
          <motion.button
            className="impact-close"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close Impact Calculator"
          >✕</motion.button>

          <div className="impact-header">
            <motion.div
              className="impact-icon"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              {isKidsMode ? '🌟' : '📊'}
            </motion.div>
            <h2 className="impact-title">
              {t('impact_title')}
              <ListenButton text={impactText} lang={lang} label="Listen to impact analysis" />
            </h2>
            <p className="impact-subtitle">{t('impact_subtitle')}</p>
            <p className="impact-area-name">{constituency.pc_name}, {constituency.state}</p>
          </div>

          {/* Big Stats */}
          <div className="impact-stats-grid">
            <motion.div
              className="impact-stat-card voted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="impact-stat-value">
                <AnimatedCounter target={voted} />
              </div>
              <div className="impact-stat-label">{t('impact_voted')}</div>
              <div className="impact-stat-icon">🗳️</div>
            </motion.div>
            <motion.div
              className="impact-stat-card didnt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="impact-stat-value">
                <AnimatedCounter target={didntVote} />
              </div>
              <div className="impact-stat-label">{t('impact_didnt')}</div>
              <div className="impact-stat-icon">🏠</div>
            </motion.div>
          </div>

          {/* Comparison Bar */}
          <motion.div
            className="impact-comparison"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="impact-comp-row">
              <span className="impact-comp-label">{t('impact_your_area')}</span>
              <div className="impact-comp-bar-bg">
                <motion.div
                  className="impact-comp-bar-fill your-area"
                  initial={{ width: 0 }}
                  animate={{ width: `${turnout}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="impact-comp-value">{turnout}%</span>
            </div>
            <div className="impact-comp-row">
              <span className="impact-comp-label">{t('impact_national_avg')}</span>
              <div className="impact-comp-bar-bg">
                <motion.div
                  className="impact-comp-bar-fill national"
                  initial={{ width: 0 }}
                  animate={{ width: `${nationalAvg}%` }}
                  transition={{ duration: 1.5, delay: 0.7, ease: 'easeOut' }}
                />
              </div>
              <span className="impact-comp-value">{nationalAvg}%</span>
            </div>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            className="impact-message-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="impact-msg-emoji"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {isKidsMode ? '🦸' : '💪'}
            </motion.div>
            <p className="impact-msg-text">
              {t('impact_cta', { count: total.toLocaleString('en-IN') })}
            </p>
            <p className="impact-msg-sub">{t('impact_message')}</p>
          </motion.div>

          {/* Visual People Grid */}
          <div className="impact-people-grid">
            <div className="impact-people-title">
              {isKidsMode ? '👫 If your area had 100 people...' : `${t('impact_turnout')}: Visual`}
            </div>
            <div className="impact-dots">
              {Array.from({ length: 100 }, (_, i) => (
                <motion.div
                  key={i}
                  className={`impact-dot ${i < Math.round(turnout) ? 'voted' : 'absent'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.012, duration: 0.2, type: 'spring', stiffness: 500 }}
                  title={i < Math.round(turnout) ? 'Voted ✓' : 'Didn\'t vote'}
                />
              ))}
            </div>
            <div className="impact-dots-legend">
              <span><span className="impact-dot-legend voted" /> Voted</span>
              <span><span className="impact-dot-legend absent" /> Stayed Home</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
