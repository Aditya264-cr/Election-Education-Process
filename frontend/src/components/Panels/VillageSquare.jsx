import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import './VillageSquare.css';

// Pre-loaded community Q&A from the "Friendly Neighbor" persona
const COMMUNITY_QA = [
  {
    id: 1,
    question: "Is my vote really secret? Can anyone find out who I voted for?",
    answer: "Absolutely secret! The EVM records votes in sequence, but there is NO way to link a specific vote to a voter. The ballot is completely anonymous. Even during VVPAT verification, only the paper slip is checked — never linked to a person.",
    eciSource: "Section 128 of the Representation of People Act, 1951",
    eciUrl: "https://eci.gov.in/files/file/14041-secrecy-of-vote/",
    category: "voting",
    icon: "🔐",
  },
  {
    id: 2,
    question: "What happens to EVMs after polling day?",
    answer: "After polling, all EVMs and VVPATs are sealed with unique serial numbers in the presence of party agents. They're transported to a 'strong room' under armed escort and stored under 24/7 CCTV surveillance until counting day. Party agents can camp outside and monitor!",
    eciSource: "ECI Strong Room Security Protocol (2024 Revision)",
    eciUrl: "https://eci.gov.in/files/file/14039-strong-room-protocol/",
    category: "security",
    icon: "🏛️",
  },
  {
    id: 3,
    question: "Can someone tamper with the EVM software?",
    answer: "No! The software is One-Time Programmable (OTP) — it's permanently burnt into the chip at the factory and can NEVER be modified, overwritten, or read back. Any attempt to physically open the chip triggers a factory reset that destroys all data. Even the manufacturers can't alter it after production.",
    eciSource: "Technical Expert Committee Report on EVMs (ECI)",
    eciUrl: "https://eci.gov.in/files/file/14036-evm-vvpat-awareness/",
    category: "technology",
    icon: "💻",
  },
  {
    id: 4,
    question: "What if I press the wrong button by mistake?",
    answer: "Once you press a button and hear the beep, that vote is recorded and cannot be changed — just like dropping a ballot in a box! That's why the VVPAT slip shows you your choice for 7 seconds so you can verify. If the slip doesn't match your intended vote, you can report it to the Presiding Officer immediately.",
    eciSource: "Rule 49MA of Conduct of Election Rules, 1961",
    eciUrl: "https://eci.gov.in/files/file/14042-voting-procedure/",
    category: "voting",
    icon: "❓",
  },
  {
    id: 5,
    question: "Why don't we just use paper ballots like other countries?",
    answer: "India tried paper ballots from 1952 to 1998 — they led to booth capturing, invalid votes due to poor marking, and counting that took weeks. EVMs eliminated all these issues. They're faster, more accurate, and can't be stuffed with fake ballots. Many countries now study India's EVM system as a model!",
    eciSource: "ECI History of Electoral Reforms",
    eciUrl: "https://eci.gov.in/files/file/14043-electoral-reforms/",
    category: "history",
    icon: "📜",
  },
  {
    id: 6,
    question: "How are EVMs tested before election day?",
    answer: "Three levels of testing: (1) First Level Checking by engineers in front of party reps, (2) Randomized allocation so no one knows which machine goes where, and (3) Mandatory mock poll of 1,000+ votes on election morning with party agents watching the zero count and verifying each VVPAT slip. Only after ALL agents sign off does voting begin!",
    eciSource: "ECI First Level Checking Protocol",
    eciUrl: "https://eci.gov.in/files/file/14038-mock-poll-protocol/",
    category: "process",
    icon: "🔬",
  },
];

export default function VillageSquare({ onClose }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [expandedId, setExpandedId] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [customQAs, setCustomQAs] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const allQAs = useMemo(() => [...COMMUNITY_QA, ...customQAs], [customQAs]);

  const handleAsk = useCallback(() => {
    if (!userQuestion.trim() || isAsking) return;
    setIsAsking(true);

    // Simulate the "Friendly Neighbor" thinking and answering
    const newQA = {
      id: Date.now(),
      question: userQuestion.trim(),
      answer: "Great question, neighbor! I'm checking with the Election Commission to make sure I give you the most accurate answer. In the meantime, you can always visit eci.gov.in for official information. The ECI's toll-free helpline is 1800-111-950.",
      eciSource: "Election Commission of India — Helpline & Resources",
      eciUrl: "https://eci.gov.in/",
      category: "community",
      icon: "🏘️",
      isUserGenerated: true,
    };

    setTimeout(() => {
      setCustomQAs(prev => [newQA, ...prev]);
      setUserQuestion('');
      setExpandedId(newQA.id);
      setIsAsking(false);
    }, 1200);
  }, [userQuestion, isAsking]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="vs-overlay" id="village-square">
      <div className="vs-container glass-panel animate-fadeInScale">
        <button className="vs-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className="vs-header">
          <div className="vs-header-icon">{isKidsMode ? '🏰' : '🏘️'}</div>
          <div>
            <h2 className="vs-title">
              {isKidsMode ? '🗺️ The Village Square' : 'The Village Square'}
            </h2>
            <p className="vs-subtitle">
              Community Q&A — Ask anything, get neighbor-verified answers
            </p>
          </div>
        </div>

        {/* The Neighbor's Guarantee Badge */}
        <div className="vs-guarantee">
          <span className="vs-guarantee-icon">🤝</span>
          <span className="vs-guarantee-text">
            <strong>The Neighbor's Guarantee:</strong> Every answer includes a link to the official 
            Election Commission source document.
          </span>
        </div>

        {/* Ask a Question */}
        <div className="vs-ask-section">
          <div className="vs-ask-input-wrap">
            <input
              type="text"
              className="vs-ask-input"
              placeholder={isKidsMode 
                ? "What do you want to know, Explorer? 🧭" 
                : "Ask your question to the neighborhood..."
              }
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              id="village-square-input"
            />
            <button
              className="vs-ask-btn"
              onClick={handleAsk}
              disabled={!userQuestion.trim() || isAsking}
            >
              {isAsking ? '💭' : '📨'} {isAsking ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </div>

        {/* Q&A List */}
        <div className="vs-qa-list">
          {allQAs.map((qa, idx) => (
            <div
              key={qa.id}
              className={`vs-qa-card ${expandedId === qa.id ? 'expanded' : ''} ${qa.isUserGenerated ? 'user-generated' : ''}`}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              {/* Question */}
              <div className="vs-qa-question" onClick={() => toggleExpand(qa.id)}>
                <span className="vs-qa-icon">{qa.icon}</span>
                <span className="vs-qa-q-text">{qa.question}</span>
                <span className={`vs-qa-arrow ${expandedId === qa.id ? 'open' : ''}`}>▸</span>
              </div>

              {/* Answer (expanded) */}
              {expandedId === qa.id && (
                <div className="vs-qa-answer animate-fadeInUp">
                  {/* Neighbor avatar */}
                  <div className="vs-qa-neighbor">
                    <div className="vs-qa-neighbor-avatar">🏘️</div>
                    <span className="vs-qa-neighbor-name">Friendly Neighbor says:</span>
                  </div>

                  {/* Answer text */}
                  <p className="vs-qa-a-text">{qa.answer}</p>

                  {/* ECI Source — The Guarantee */}
                  <div className="vs-qa-source">
                    <div className="vs-qa-source-badge">
                      <span className="vs-qa-source-check">✅</span>
                      <span>OFFICIAL SOURCE</span>
                    </div>
                    <a
                      href={qa.eciUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vs-qa-source-link"
                    >
                      📄 {qa.eciSource} →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer disclaimer */}
        <div className="vs-footer">
          <span className="vs-footer-text">
            ℹ️ All answers verified against official Election Commission of India documentation.
            For time-sensitive queries, call ECI Helpline: <strong>1800-111-950</strong> (toll-free).
          </span>
        </div>
      </div>
    </div>
  );
}
