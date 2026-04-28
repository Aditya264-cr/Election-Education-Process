import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { ListenButton } from '../../hooks/useTextToSpeech';
import { getElectionDayType } from '../../data/electionGreetings';
import './DynamicHome.css';

/**
 * DYNAMIC HOME — CONTEXTUAL MORPHING
 * ====================================
 * Changes the hero section based on DATE and LOCATION:
 *
 * Scenario 1 (April 29 — WB Phase 2):  Live Queue + Booth Directions
 * Scenario 2 (Standard Education Day):  Great Beep + Why Your Vote Matters
 * Scenario 3 (Post-Voting, Pre-May 4):  Waiting Room with quizzes + counting explainer
 */

// ── Date-driven scenario detection ──
function getScenario() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  // Scenario 1: Polling Days
  if (['2026-04-09', '2026-04-23', '2026-04-29'].includes(dateStr)) {
    return 'POLL_DAY';
  }

  // Scenario 3: Post-voting, waiting for counting (Apr 30 – May 3)
  if (dateStr >= '2026-04-30' && dateStr <= '2026-05-03') {
    return 'WAITING_ROOM';
  }

  // Scenario 3b: Counting Day
  if (dateStr === '2026-05-04') {
    return 'COUNTING_DAY';
  }

  // Scenario 2: Default educational mode
  return 'EDUCATION';
}

// ── Counting process quiz data ──
const COUNTING_QUIZ = [
  {
    q: 'How many rounds of counting does a typical constituency have?',
    options: ['5-10', '14-25', '50+', 'Just 1'],
    correct: 1,
    explanation: 'Each constituency typically has 14-25 rounds. Each round counts votes from a set of EVMs, and results are updated after each round!',
  },
  {
    q: 'What is a "postal ballot"?',
    options: ['A digital vote', 'A vote cast by mail from voters who cannot visit the booth', 'A rejected vote', 'A party membership form'],
    correct: 1,
    explanation: 'Postal ballots are cast by service voters, people on election duty, senior citizens (80+), and people with disabilities.',
  },
  {
    q: 'When are VVPAT slips counted?',
    options: ['Never', 'Only if there is a complaint', 'After electronic count — 5 random booths per constituency', 'Before electronic count'],
    correct: 2,
    explanation: 'After electronic counting, the VVPAT paper slips of 5 randomly selected booths are manually matched with EVM counts for verification.',
  },
];

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1], staggerChildren: 0.12 }
  },
  exit: {
    opacity: 0, y: -20,
    transition: { duration: 0.3 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function DynamicHome({ onNavigate, constituency }) {
  const { t, lang } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const scenario = useMemo(getScenario, []);

  return (
    <div className="dhome-wrapper" id="dynamic-home">
      <AnimatePresence mode="wait">
        {scenario === 'POLL_DAY' && (
          <PollDayHero key="poll" onNavigate={onNavigate} constituency={constituency} lang={lang} isKids={isKidsMode} />
        )}
        {scenario === 'EDUCATION' && (
          <EducationHero key="edu" onNavigate={onNavigate} lang={lang} isKids={isKidsMode} t={t} />
        )}
        {(scenario === 'WAITING_ROOM' || scenario === 'COUNTING_DAY') && (
          <WaitingRoomHero key="wait" onNavigate={onNavigate} lang={lang} isKids={isKidsMode} isCounting={scenario === 'COUNTING_DAY'} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════
   SCENARIO 1: POLL DAY HERO
   Live Queue + Booth Directions
   ═══════════════════════════════════ */
function PollDayHero({ onNavigate, constituency, lang, isKids }) {
  const boothName = constituency?.booth || 'Your Nearest Polling Booth';
  const message = isKids
    ? '🏰 Today is the day! The Great Beep Castle is open! Let\'s go on a real adventure!'
    : `🗳️ It's Election Day, neighbor! Head to ${boothName} — let's make your vote count!`;

  return (
    <motion.div className="dhome-card poll-day" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div className="dhome-badge poll-day-badge" variants={itemVariants}>
        🔴 LIVE — POLLING DAY
      </motion.div>

      <motion.h2 className="dhome-title" variants={itemVariants}>
        {isKids ? '🎪 Adventure Day!' : '🗳️ Your Vote Awaits'}
        <ListenButton text={message} lang={lang} />
      </motion.h2>

      <motion.p className="dhome-text" variants={itemVariants}>
        {message}
      </motion.p>

      <motion.div className="dhome-actions" variants={itemVariants}>
        <motion.button
          className="btn-primary dhome-action-btn"
          onClick={() => onNavigate('boothPulse')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="dhome-action-icon">📡</span>
          <span>{isKids ? 'Castle Queue' : 'Live Booth Queue'}</span>
        </motion.button>

        <motion.button
          className="btn-secondary dhome-action-btn"
          onClick={() => onNavigate('map')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="dhome-action-icon">🗺️</span>
          <span>{isKids ? 'Find the Castle!' : 'Booth Directions'}</span>
        </motion.button>
      </motion.div>

      {/* Live status indicator */}
      <motion.div className="dhome-live-indicator" variants={itemVariants}>
        <span className="dhome-live-dot" />
        <span>Booths open 7:00 AM — 6:00 PM</span>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   SCENARIO 2: EDUCATION HERO
   Great Beep + Why Your Vote Matters
   ═══════════════════════════════════ */
function EducationHero({ onNavigate, lang, isKids, t }) {
  const message = isKids
    ? 'Press the button, hear the BEEP, and see your vote get locked away safely!'
    : 'Understand the EVM, explore your constituency, and discover the real power of your single vote.';

  return (
    <motion.div className="dhome-card education" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div className="dhome-badge edu-badge" variants={itemVariants}>
        📚 LEARN & EXPLORE
      </motion.div>

      <motion.h2 className="dhome-title" variants={itemVariants}>
        {isKids ? '🎪 The Great Beep Adventure!' : '🏘️ Your Civic Journey Starts Here'}
        <ListenButton text={message} lang={lang} />
      </motion.h2>

      <motion.p className="dhome-text" variants={itemVariants}>
        {message}
      </motion.p>

      <motion.div className="dhome-actions" variants={itemVariants}>
        <motion.button
          className="btn-primary dhome-action-btn"
          onClick={() => onNavigate(isKids ? 'greatBeep' : 'evm')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96, y: 3 }}
        >
          <span className="dhome-action-icon">{isKids ? '🎪' : '🗳️'}</span>
          <span>{isKids ? 'Play The Great Beep!' : 'Try the EVM Simulator'}</span>
        </motion.button>

        <motion.button
          className="btn-secondary dhome-action-btn"
          onClick={() => onNavigate(isKids ? 'impact' : 'power')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="dhome-action-icon">{isKids ? '⚡' : '📊'}</span>
          <span>{isKids ? 'Fun Vote Facts!' : 'Why Your Vote Matters'}</span>
        </motion.button>
      </motion.div>

      {/* Quick stats row */}
      <motion.div className="dhome-stats-row" variants={itemVariants}>
        <div className="dhome-stat">
          <span className="dhome-stat-value">97 Cr</span>
          <span className="dhome-stat-label">Registered Voters</span>
        </div>
        <div className="dhome-stat">
          <span className="dhome-stat-value">10L+</span>
          <span className="dhome-stat-label">Polling Booths</span>
        </div>
        <div className="dhome-stat">
          <span className="dhome-stat-value">5</span>
          <span className="dhome-stat-label">States Voting</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   SCENARIO 3: WAITING ROOM
   Quizzes + How Counting Works
   ═══════════════════════════════════ */
function WaitingRoomHero({ onNavigate, lang, isKids, isCounting }) {
  const message = isCounting
    ? 'Counting is underway! Check our live dashboard for round-by-round updates.'
    : 'While we wait for May 4th, let\'s test your election knowledge!';

  return (
    <motion.div className="dhome-card waiting-room" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div className="dhome-badge wait-badge" variants={itemVariants}>
        {isCounting ? '🔢 COUNTING DAY' : '⏳ THE WAITING ROOM'}
      </motion.div>

      <motion.h2 className="dhome-title" variants={itemVariants}>
        {isCounting
          ? (isKids ? '🔮 The Magic Counting!' : '📊 Counting Day Has Arrived!')
          : (isKids ? '🎲 Quiz Time!' : '⏳ The Waiting Room')
        }
        <ListenButton text={message} lang={lang} />
      </motion.h2>

      <motion.p className="dhome-text" variants={itemVariants}>
        {message}
      </motion.p>

      {/* Quiz Cards */}
      {!isCounting && (
        <motion.div className="dhome-quiz-section" variants={itemVariants}>
          <h3 className="dhome-quiz-title">
            {isKids ? '🧠 Brain Challenge!' : '📋 How Well Do You Know Counting Day?'}
          </h3>
          {COUNTING_QUIZ.map((q, idx) => (
            <QuizCard key={idx} quiz={q} index={idx} />
          ))}
        </motion.div>
      )}

      {/* Counting Process Animation */}
      {!isCounting && (
        <motion.div className="dhome-counting-explainer" variants={itemVariants}>
          <h3 className="dhome-counting-title">🔢 How Counting Works</h3>
          <div className="dhome-counting-steps">
            {[
              { icon: '📦', text: 'Strong rooms opened at 8 AM under CCTV' },
              { icon: '🔍', text: 'EVM seals verified by party agents' },
              { icon: '🔢', text: '14-25 rounds of counting per constituency' },
              { icon: '🧾', text: 'VVPAT slips of 5 random booths cross-checked' },
              { icon: '📊', text: 'Results declared constituency by constituency' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="dhome-counting-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                <span className="dhome-step-num">{i + 1}</span>
                <span className="dhome-step-icon">{step.icon}</span>
                <span className="dhome-step-text">{step.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div className="dhome-actions" variants={itemVariants}>
        {isCounting ? (
          <motion.button
            className="btn-primary dhome-action-btn"
            onClick={() => onNavigate('results')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="dhome-action-icon">📊</span>
            <span>Live Results Dashboard</span>
          </motion.button>
        ) : (
          <motion.button
            className="btn-primary dhome-action-btn"
            onClick={() => onNavigate('ledger')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="dhome-action-icon">📒</span>
            <span>{isKids ? 'Promise Book' : '5-Year Promise Ledger'}</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   QUIZ CARD — Interactive mini-quiz
   ═══════════════════════════════════ */
function QuizCard({ quiz, index }) {
  const [selected, setSelected] = useState(null);
  const isCorrect = selected === quiz.correct;

  return (
    <motion.div
      className={`dhome-quiz-card glass-card ${selected !== null ? (isCorrect ? 'correct' : 'wrong') : ''}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15 }}
    >
      <p className="dhome-quiz-q">{quiz.q}</p>
      <div className="dhome-quiz-options">
        {quiz.options.map((opt, i) => (
          <motion.button
            key={i}
            className={`dhome-quiz-opt ${selected === i ? (i === quiz.correct ? 'correct' : 'wrong') : ''} ${selected !== null && i === quiz.correct ? 'correct' : ''}`}
            onClick={() => selected === null && setSelected(i)}
            disabled={selected !== null}
            whileTap={selected === null ? { scale: 0.96 } : {}}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      {selected !== null && (
        <motion.p
          className="dhome-quiz-explain"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {isCorrect ? '✅ ' : '❌ '}{quiz.explanation}
        </motion.p>
      )}
    </motion.div>
  );
}

