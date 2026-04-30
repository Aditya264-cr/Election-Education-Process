import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListenButton } from '../../hooks/useTextToSpeech';
import { useLanguage } from '../../hooks/useLanguage';
import './SafetyNet.css';

/**
 * NEIGHBORLY SAFETY NET
 * =====================
 * Graceful degradation when the map can't find a constituency:
 * 1. "Search by Pincode" fallback
 * 2. Manual state/district selection
 * 3. ECI Helpline 1950 link
 * 4. Warm, non-alarming error messages
 */

const AVAILABLE_STATES = [
  'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Tamil Nadu',
  'Karnataka', 'Gujarat', 'West Bengal', 'Rajasthan',
];

export default function SafetyNet({ error, onPincodeSearch, onDistrictSelect, onDismiss, constituencies = [] }) {
  const { lang } = useLanguage();
  const [pincode, setPincode] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [mode, setMode] = useState('message'); // 'message' | 'pincode' | 'manual'

  if (!error) return null;

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      onPincodeSearch(pincode);
    }
  };

  const handleManualSubmit = () => {
    if (selectedState) {
      onDistrictSelect(selectedState, selectedDistrict);
    }
  };

  const districtsForState = constituencies
    .filter((c) => c.state === selectedState)
    .map((c) => c.district)
    .filter((d, idx, arr) => d && arr.indexOf(d) === idx);

  return (
    <AnimatePresence>
      <motion.div
        className="safetynet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="safetynet-card glass-panel"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Dismiss */}
          <motion.button
            className="safetynet-close"
            onClick={onDismiss}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Dismiss"
          >✕</motion.button>

          {/* Header */}
          <div className="safetynet-header">
            <motion.div
              className="safetynet-icon"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🤝
            </motion.div>
            <h2 className="safetynet-title">
              Hang tight, neighbor!
              <ListenButton text={error.message} lang={lang} label="Listen to message" />
            </h2>
          </div>

          <p className="safetynet-message">{error.message}</p>
          {error.action === 'TRIGGER_SEARCH_BY_EPIC' && (
            <p className="safetynet-message">
              We will not guess your booth from map or pincode data. Use Electoral Search with your EPIC number for the authoritative record.
            </p>
          )}

          {/* Mode Tabs */}
          <div className="safetynet-tabs" role="tablist">
            <button
              className={`safetynet-tab ${mode === 'pincode' ? 'active' : ''}`}
              onClick={() => setMode('pincode')}
              role="tab"
              aria-selected={mode === 'pincode'}
            >
              <span className="safetynet-tab-icon" aria-hidden="true">📮</span>
              Search by Pincode
            </button>
            <button
              className={`safetynet-tab ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
              role="tab"
              aria-selected={mode === 'manual'}
            >
              <span className="safetynet-tab-icon" aria-hidden="true">📋</span>
              Select District
            </button>
          </div>

          {/* Pincode Search */}
          <AnimatePresence mode="wait">
            {mode === 'pincode' && (
              <motion.form
                className="safetynet-form"
                onSubmit={handlePincodeSubmit}
                key="pincode"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="pincode-input" className="safetynet-label">
                  Enter your 6-digit pincode
                </label>
                <div className="safetynet-input-row">
                  <input
                    id="pincode-input"
                    className="safetynet-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="e.g. 411001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    aria-label="Pincode"
                  />
                  <motion.button
                    type="submit"
                    className="btn-primary safetynet-submit"
                    disabled={pincode.length !== 6}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Find My Area
                  </motion.button>
                </div>
              </motion.form>
            )}

            {mode === 'manual' && (
              <motion.div
                className="safetynet-manual"
                key="manual"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="state-select" className="safetynet-label">
                  Select your state
                </label>
                <div className="safetynet-input-row">
                  <select
                    id="state-select"
                    className="safetynet-input safetynet-select"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('');
                    }}
                    aria-label="State"
                  >
                    <option value="">Choose state...</option>
                    {AVAILABLE_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    id="district-select"
                    className="safetynet-input safetynet-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    aria-label="District"
                    disabled={!selectedState}
                  >
                    <option value="">Choose district (optional)...</option>
                    {districtsForState.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <motion.button
                    type="button"
                    className="btn-primary safetynet-submit"
                    disabled={!selectedState}
                    onClick={handleManualSubmit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Find My Area
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ECI Helpline */}
          <div className="safetynet-helpline">
            <div className="safetynet-helpline-icon">📞</div>
            <div className="safetynet-helpline-text">
              <strong>Official ECI Helpline: 1950</strong>
              <span>Available 24×7 for voter assistance</span>
            </div>
            <a
              href="https://voters.eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="safetynet-eci-link"
              aria-label="Visit ECI voter portal"
            >
              Electoral Search Portal →
            </a>
          </div>

          {/* Coordinates Debug (for developer) */}
          {error.coordinates && (
            <div className="safetynet-debug">
              <span>📍 Lat: {error.coordinates.lat}, Lng: {error.coordinates.lng}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
