import { motion, AnimatePresence } from 'framer-motion';
import { useKidsMode } from '../hooks/useKidsMode';
import { useLanguage } from '../hooks/useLanguage';
import './KidsModeToggle.css';

export default function KidsModeToggle() {
  const { isKidsMode, toggleKidsMode } = useKidsMode();
  const { t } = useLanguage();

  return (
    <motion.button
      className={`kids-toggle ${isKidsMode ? 'active' : ''}`}
      onClick={toggleKidsMode}
      aria-label="Toggle Kids Mode"
      title={t('kids_toggle')}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95, y: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.span
        className="kids-toggle-icon"
        key={isKidsMode ? 'castle' : 'map'}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isKidsMode ? '🏰' : '🗺️'}
      </motion.span>
      <span className="kids-toggle-label">
        {isKidsMode ? 'Explorer Mode ON' : t('kids_toggle')}
      </span>
      <AnimatePresence>
        {isKidsMode && (
          <motion.span
            className="kids-toggle-sparkle"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            ✨
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
