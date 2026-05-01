import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { ListenButton } from '../../hooks/useTextToSpeech';
import Icon from '../DesignSystem/Atoms/Icon';
import './DynamicHome.css';

/**
 * DYNAMIC HOME — CONTEXTUAL MORPHING (TAILWIND EDITION)
 * ====================================================
 * Changes the hero section based on DATE and LOCATION.
 * Implements 'Immersive Scrolling' triggers for the map.
 */

function getScenario() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  // Scenario 1: Polling Days (Specifically including April 29 for WB Phase)
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

  return 'EDUCATION';
}

const COUNTING_QUIZ = [
  {
    q: 'How many rounds of counting does a typical constituency have?',
    options: ['5-10', '14-25', '50+', 'Just 1'],
    correct: 1,
    explanation: 'Each constituency typically has 14-25 rounds. Each round counts votes from a set of EVMs.',
  },
  {
    q: 'What is a "postal ballot"?',
    options: ['A digital vote', 'A vote cast by mail for specific groups', 'A rejected vote', 'A party form'],
    correct: 1,
    explanation: 'Postal ballots are for service voters, seniors (80+), and people with disabilities.',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DynamicHome({ onNavigate, constituency, onScrollProgress }) {
  const { t, lang } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const scenario = useMemo(getScenario, []);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Pass scroll progress to parent to trigger map zoom
  useEffect(() => {
    return scrollYProgress.onChange(v => {
      if (onScrollProgress) onScrollProgress(v);
    });
  }, [scrollYProgress, onScrollProgress]);

  const themeClasses = isKidsMode 
    ? "bg-amber-100/95 border-orange-200 shadow-bubble text-slate-900" 
    : "glass-panel p-6 md:p-8 max-h-[60vh] overflow-y-auto scrollbar-hide text-slate-900";

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[800] w-[94%] max-w-xl pointer-events-auto">
      <motion.div 
        ref={containerRef}
        className={`rounded-3xl border ${themeClasses}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
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

        {/* Immersive Scroll Indicator */}
        <motion.div 
          className="mt-8 flex flex-col items-center gap-2 opacity-50"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to dive deeper</span>
          <div className="w-px h-8 bg-current opacity-20" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function PollDayHero({ onNavigate, constituency, lang, isKids }) {
  const message = isKids
    ? 'Adventure Day! The Great Beep Castle is open! Let\'s go!'
    : `It's Election Day, neighbor! Head to your booth — make it count!`;

  return (
    <div className="space-y-6">
      <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-tighter" variants={itemVariants}>
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
        Live — Polling Day
      </motion.div>

      <motion.h2 className={`text-3xl leading-tight ${isKids ? 'font-rounded text-orange-600' : 'font-sans text-slate-800'}`} variants={itemVariants}>
        <Icon name={isKids ? 'Castle' : 'Vote'} size={32} className="inline-block mr-3 align-bottom text-primary-accent" />
        {isKids ? 'Adventure Day!' : 'Your Vote Awaits'}
        <ListenButton text={message} lang={lang} />
      </motion.h2>

      <motion.p className="text-lg opacity-80 leading-relaxed" variants={itemVariants}>
        {message}
      </motion.p>

      <motion.div className="flex flex-col sm:flex-row gap-3" variants={itemVariants}>
        <button
          className={`${isKids ? 'bubble-button-primary' : 'bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95'} flex-1 flex items-center justify-center gap-2`}
          onClick={() => onNavigate('boothPulse')}
        >
          <Icon name="Radio" size={20} />
          <span>{isKids ? 'Castle Queue' : 'Live Queue Tracker'}</span>
        </button>

        <button
          className={`${isKids ? 'bubble-button-secondary' : 'bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95'} flex-1 flex items-center justify-center gap-2`}
          onClick={() => onNavigate('map')}
        >
          <Icon name="Map" size={20} />
          <span>{isKids ? 'Find the Castle!' : 'Booth Directions'}</span>
        </button>
      </motion.div>
    </div>
  );
}

function EducationHero({ onNavigate, lang, isKids }) {
  const message = isKids
    ? 'Press the button, hear the BEEP, and see your vote get locked away safely!'
    : 'Understand the EVM, explore your constituency, and discover the real power of your vote.';

  return (
    <div className="space-y-6">
      <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter" variants={itemVariants}>
        <Icon name="BookOpen" size={12} />
        Learn & Explore
      </motion.div>

      <motion.h2 className={`text-3xl leading-tight ${isKids ? 'font-rounded text-orange-600' : 'font-sans text-slate-800'}`} variants={itemVariants}>
        <Icon name={isKids ? 'Gamepad2' : 'Home'} size={32} className="inline-block mr-3 align-bottom text-primary-accent" />
        {isKids ? 'The Great Beep!' : 'Your Civic Journey'}
        <ListenButton text={message} lang={lang} />
      </motion.h2>

      <motion.p className="text-lg opacity-80 leading-relaxed" variants={itemVariants}>
        {message}
      </motion.p>

      <motion.div className="flex flex-col sm:flex-row gap-3" variants={itemVariants}>
        <button
          className={`${isKids ? 'bubble-button-primary' : 'bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95'} flex-1 flex items-center justify-center gap-2`}
          onClick={() => onNavigate(isKids ? 'evm' : 'evm')}
        >
          <Icon name={isKids ? 'Tent' : 'Fingerprint'} size={20} />
          <span>{isKids ? 'The Great Beep!' : 'Try EVM Simulator'}</span>
        </button>

        <button
          className={`${isKids ? 'bubble-button-secondary' : 'bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95'} flex-1 flex items-center justify-center gap-2`}
          onClick={() => onNavigate('impact')}
        >
          <Icon name={isKids ? 'Zap' : 'BarChart3'} size={20} />
          <span>{isKids ? 'Fun Vote Facts!' : 'Hyper-Local Why'}</span>
        </button>
      </motion.div>
    </div>
  );
}

function WaitingRoomHero({ onNavigate, lang, isKids, isCounting }) {
  const message = isCounting
    ? 'Counting is underway! Check live updates now.'
    : 'While we wait for May 4th, let\'s test your knowledge!';

  return (
    <div className="space-y-6">
      <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-tighter" variants={itemVariants}>
        <Icon name="Timer" size={12} />
        The Waiting Room
      </motion.div>

      <motion.h2 className={`text-3xl leading-tight ${isKids ? 'font-rounded text-orange-600' : 'font-sans text-slate-800'}`} variants={itemVariants}>
        <Icon name={isCounting ? 'PieChart' : 'BrainCircuit'} size={32} className="inline-block mr-3 align-bottom text-primary-accent" />
        {isCounting ? (isKids ? 'Magic Counting!' : 'Counting Day!') : (isKids ? 'Quiz Time!' : 'The Waiting Room')}
        <ListenButton text={message} lang={lang} />
      </motion.h2>

      {!isCounting && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
            <Icon name="CheckSquare" size={16} />
            Civic Quiz
          </h3>
          {COUNTING_QUIZ.map((q, idx) => (
            <QuizCard key={idx} quiz={q} index={idx} isKids={isKids} />
          ))}
        </div>
      )}

      <motion.div className="mt-6" variants={itemVariants}>
        <button
          className={`${isKids ? 'bubble-button-primary w-full' : 'bg-blue-600 text-white px-8 py-4 rounded-xl font-bold w-full shadow-lg transition-all active:scale-95'}`}
          onClick={() => onNavigate('ledger')}
        >
          <Icon name={isKids ? 'BookText' : 'History'} size={20} className="inline-block mr-2" />
          {isKids ? 'Read Promise Book' : 'How Counting Works'}
        </button>
      </motion.div>
    </div>
  );
}

function QuizCard({ quiz, index, isKids }) {
  const [selected, setSelected] = useState(null);
  const isCorrect = selected === quiz.correct;

  return (
    <motion.div
      className={`p-4 rounded-2xl border-2 transition-all ${selected !== null ? (isCorrect ? 'border-emerald-500 bg-emerald-50/50' : 'border-red-200 bg-red-50/50') : 'border-slate-100 bg-white/50'}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
    >
      <p className="font-bold text-sm mb-3">{quiz.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {quiz.options.map((opt, i) => (
          <button
            key={i}
            className={`text-[10px] p-2 rounded-lg border transition-all ${selected === i ? (i === quiz.correct ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500') : 'bg-white border-slate-200 hover:border-blue-400'}`}
            onClick={() => selected === null && setSelected(i)}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

