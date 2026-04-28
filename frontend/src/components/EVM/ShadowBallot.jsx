import { useState, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import './ShadowBallot.css';

const FUN_TOPICS = [
  { id: 1, name: 'Pizza Party 🍕', icon: '🍕', color: '#E74C3C' },
  { id: 2, name: 'Ice Cream Day 🍦', icon: '🍦', color: '#3498DB' },
  { id: 3, name: 'Movie Marathon 🎬', icon: '🎬', color: '#9B59B6' },
  { id: 4, name: 'Outdoor Games 🏏', icon: '🏏', color: '#2ECC71' },
  { id: 5, name: 'Art & Craft 🎨', icon: '🎨', color: '#F39C12' },
];

function playKidsBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Play a friendlier, more musical beep for kids
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - a happy chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch (e) {
    console.log('Audio not available');
  }
}

export default function ShadowBallot({ onClose }) {
  const { t } = useLanguage();
  const [voted, setVoted] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const handleVote = useCallback((topic) => {
    if (voted) return;
    setVoted(topic);
    playKidsBeep();

    setTimeout(() => {
      setConfetti(true);
      setShowResult(true);
    }, 500);
  }, [voted]);

  const handleReset = () => {
    setVoted(null);
    setShowResult(false);
    setConfetti(false);
  };

  return (
    <div className="shadow-overlay">
      <div className="shadow-container glass-panel animate-fadeInScale">
        <button className="shadow-close" onClick={onClose}>✕</button>

        {/* Confetti */}
        {confetti && (
          <div className="shadow-confetti">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                  backgroundColor: ['#FF9933', '#FFD700', '#9B59B6', '#2ECC71', '#E74C3C', '#3498DB'][i % 6],
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                }}
              />
            ))}
          </div>
        )}

        <div className="shadow-header">
          <div className="shadow-icon animate-float">🎪</div>
          <h2 className="shadow-title">{t('kids_shadow_title')}</h2>
          <p className="shadow-subtitle">{t('kids_shadow_subtitle')}</p>
        </div>

        {!showResult ? (
          <div className="shadow-topics">
            {FUN_TOPICS.map((topic, idx) => (
              <button
                key={topic.id}
                className={`shadow-topic-btn ${voted?.id === topic.id ? 'selected' : ''}`}
                onClick={() => handleVote(topic)}
                disabled={!!voted}
                style={{
                  '--topic-color': topic.color,
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <span className="shadow-topic-icon">{topic.icon}</span>
                <span className="shadow-topic-name">{topic.name}</span>
                <div className="shadow-blue-btn">
                  <div className="shadow-btn-dot" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="shadow-result animate-fadeInUp">
            <div className="shadow-result-emoji">🎉</div>
            <h3 className="shadow-result-title">{t('kids_vote_counted')}</h3>
            <div className="shadow-result-choice">
              <span className="shadow-result-icon">{voted?.icon}</span>
              <span>You voted for <strong>{voted?.name}</strong></span>
            </div>
            <div className="shadow-result-explain">
              <p>This is exactly how grown-ups vote too! They walk into a booth, press a button, hear the <strong>BEEP</strong>, and their voice gets counted! 🗳️</p>
            </div>
            <button className="btn-primary" onClick={handleReset}>
              Vote Again! 🎪
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
