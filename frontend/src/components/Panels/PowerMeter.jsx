import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { ListenButton } from '../../hooks/useTextToSpeech';
import victoryData from '../../data/victory-margins.json';
import './PowerMeter.css';

// Approximate "people per street" for contextualizing the margin
function getStreetAnalogy(margin) {
  const peoplePerStreet = 40; // avg Indian urban street
  const streets = Math.max(1, Math.round(margin / peoplePerStreet));
  return streets;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export default function PowerMeter({ constituency, onClose }) {
  const { t, lang } = useLanguage();
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
      <motion.div className="power-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit">
        <motion.div className="power-container glass-panel" variants={panelVariants}>
          <motion.button className="power-close" onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} aria-label="Close">✕</motion.button>
          <div className="power-header">
            <h2 className="power-title">⚡ Your Voice, Your Power</h2>
            <p className="power-subtitle">
              Select a constituency on the map to see how powerful your vote really is.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const marginPercent = Math.min((latestElection.margin / latestElection.totalVoters) * 100, 100);
  const streets = getStreetAnalogy(latestElection.margin);
  const isCloseRace = marginPercent < 5;

  const messageText = isCloseRace
    ? `Last time, this election was decided by just ${latestElection.margin.toLocaleString()} votes. That's about the number of people who live on ${streets} street${streets > 1 ? 's' : ''}! Your vote is literally the tie-breaker.`
    : `The winning margin here was ${latestElection.margin.toLocaleString()} votes (${marginPercent.toFixed(1)}%). That's roughly ${streets} street${streets > 1 ? 's' : ''} worth of neighbors. Every voice matters — especially yours.`;

  return (
    <motion.div className="power-overlay" id="power-meter" variants={overlayVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div className="power-container glass-panel" variants={panelVariants} initial="hidden" animate="visible">
        <motion.button className="power-close" onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} aria-label="Close">✕</motion.button>

        {/* Header */}
        <div className="power-header">
          <motion.div
            className="power-icon"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >⚡</motion.div>
          <h2 className="power-title">
            How Powerful Is Your Vote?
            <ListenButton text={messageText} lang={lang} label="Listen to power analysis" />
          </h2>
          <p className="power-subtitle">
            {constituency.pc_name}, {data.state}
          </p>
        </div>

        {/* The Power Meter Visual */}
        <div className="power-meter-visual">
          <div className="power-meter-track">
            <motion.div
              className={`power-meter-fill ${isCloseRace ? 'close-race' : ''}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(marginPercent * 5, 100)}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
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
          <motion.div
            className="power-meter-needle"
            style={{ left: `${Math.min(marginPercent * 5, 95)}%` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div className="pmn-arrow" />
            <span className="pmn-label">{marginPercent.toFixed(1)}%</span>
          </motion.div>
        </div>

        {/* Margin Counter */}
        <motion.div
          className="power-margin-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="power-margin-label">Victory Margin ({latestElection.year})</div>
          <div className="power-margin-value">
            {animatedMargin.toLocaleString()} <span className="power-margin-unit">votes</span>
          </div>
        </motion.div>

        {/* The "Street" Message */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              className={`power-message ${isCloseRace ? 'close-race' : ''}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Election Comparison */}
        {previousElection && (
          <motion.div
            className="power-comparison"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="power-comp-header">📈 Trend: How Close Is It Getting?</div>
            <div className="power-comp-bars">
              <div className="power-comp-bar-row">
                <span className="pcb-year">{previousElection.year}</span>
                <div className="pcb-track">
                  <motion.div
                    className="pcb-fill prev"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((previousElection.margin / previousElection.totalVoters) * 500, 100)}%` }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                  />
                </div>
                <span className="pcb-margin">{previousElection.margin.toLocaleString()}</span>
              </div>
              <div className="power-comp-bar-row">
                <span className="pcb-year">{latestElection.year}</span>
                <div className="pcb-track">
                  <motion.div
                    className="pcb-fill latest"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((latestElection.margin / latestElection.totalVoters) * 500, 100)}%` }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </div>
                <span className="pcb-margin">{latestElection.margin.toLocaleString()}</span>
              </div>
            </div>
            {latestElection.margin < previousElection.margin && (
              <motion.div
                className="power-comp-note"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                🔥 The race is <strong>getting tighter</strong> — your vote matters more than ever!
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Source */}
        <div className="power-source">
          ℹ️ {victoryData.note}
        </div>
      </motion.div>
    </motion.div>
  );
}
