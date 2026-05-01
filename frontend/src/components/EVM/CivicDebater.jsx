import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import Icon from '../DesignSystem/Atoms/Icon';
import Button from '../DesignSystem/Atoms/Button';
import './CivicDebater.css';

const DEBATE_TOPIC = {
  title: "The Great Snack Election",
  opponent: "The Apple Knight",
  opponentIcon: "Sword",
  opening: "Welcome, Explorer! I am the Apple Knight. I believe apples are the best snack for the kingdom because they stay crunchy forever! What do you think?",
  rounds: [
    {
      opponent: "But apples have a built-in handle (the stem)! Bananas are just... slippery.",
      playerOptions: [
        { text: "Bananas come in their own biodegradable wrapper!", score: 10 },
        { text: "Apples are too loud to eat in the library!", score: 5 },
        { text: "I just like the color yellow!", score: 2 }
      ]
    },
    {
      opponent: "You can make apple pie! Banana pie is just mushy.",
      playerOptions: [
        { text: "Bananas are great for smoothies and energy!", score: 10 },
        { text: "Bananas are easier to peel for monkeys (and me)!", score: 8 },
        { text: "Pie is overrated, I like fruit raw!", score: 5 }
      ]
    }
  ],
  conclusion: "A good explorer listens to all arguments and picks what helps the kingdom most! That's the power of your choice."
};

export default function CivicDebater({ onClose }) {
  const { t } = useLanguage();
  const [step, setStep] = useState('opening'); // opening → round_0 → round_1 → conclusion
  const [playerScore, setPlayerScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);

  const handleOpeningNext = () => setStep('round_0');

  const handleOptionSelect = (score) => {
    setPlayerScore(prev => prev + score);
    if (currentRound < DEBATE_TOPIC.rounds.length - 1) {
      setCurrentRound(prev => prev + 1);
      setStep(`round_${currentRound + 1}`);
    } else {
      setStep('conclusion');
    }
  };

  return (
    <div className="debater-overlay">
      <motion.div 
        className="debater-container glass-panel p-8 max-w-2xl w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <Icon name="Gamepad2" size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{DEBATE_TOPIC.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'opening' && (
            <motion.div 
              key="opening"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <Icon name={DEBATE_TOPIC.opponentIcon} size={32} />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative">
                  <div className="absolute -left-2 top-6 w-4 h-4 bg-blue-50 border-l border-t border-blue-100 rotate-45" />
                  <p className="text-lg font-bold text-blue-900 leading-relaxed">
                    {DEBATE_TOPIC.opening}
                  </p>
                </div>
              </div>
              <Button className="w-full py-4 text-xl" onClick={handleOpeningNext}>
                Challenge Accepted! ⚔️
              </Button>
            </motion.div>
          )}

          {step.startsWith('round_') && (
            <motion.div 
              key={`round-${currentRound}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                  <Icon name={DEBATE_TOPIC.opponentIcon} size={24} />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 relative">
                  <p className="text-slate-800 font-bold">
                    {DEBATE_TOPIC.rounds[currentRound].opponent}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose your argument</p>
                {DEBATE_TOPIC.rounds[currentRound].playerOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-orange-400 hover:bg-orange-50 transition-all font-bold text-slate-700 active:scale-[0.98]"
                    onClick={() => handleOptionSelect(opt.score)}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'conclusion' && (
            <motion.div 
              key="conclusion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Trophy" size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900">Debate Master!</h3>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                {DEBATE_TOPIC.conclusion}
              </p>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Reasoning Score</p>
                <p className="text-4xl font-black text-orange-500">{playerScore} Points</p>
              </div>
              <Button className="w-full py-4" onClick={onClose}>
                Back to the Kingdom 🏰
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
