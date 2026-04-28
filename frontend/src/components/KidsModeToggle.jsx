import { useKidsMode } from '../hooks/useKidsMode';
import { useLanguage } from '../hooks/useLanguage';
import './KidsModeToggle.css';

export default function KidsModeToggle() {
  const { isKidsMode, toggleKidsMode } = useKidsMode();
  const { t } = useLanguage();

  return (
    <button
      className={`kids-toggle ${isKidsMode ? 'active' : ''}`}
      onClick={toggleKidsMode}
      aria-label="Toggle Kids Mode"
      title={t('kids_toggle')}
    >
      <span className="kids-toggle-icon">
        {isKidsMode ? '🏰' : '🗺️'}
      </span>
      <span className="kids-toggle-label">
        {isKidsMode ? 'Explorer Mode ON' : t('kids_toggle')}
      </span>
      <span className={`kids-toggle-sparkle ${isKidsMode ? 'show' : ''}`}>✨</span>
    </button>
  );
}
