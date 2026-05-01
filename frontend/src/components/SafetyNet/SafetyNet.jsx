import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListenButton } from '../../hooks/useTextToSpeech';
import { useLanguage } from '../../hooks/useLanguage';
import Icon from '../DesignSystem/Atoms/Icon';
import Button from '../DesignSystem/Atoms/Button';
import './SafetyNet.css';

const AVAILABLE_STATES = [
  'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Tamil Nadu',
  'Karnataka', 'Gujarat', 'West Bengal', 'Rajasthan',
];

export default function SafetyNet({ error, onPincodeSearch, onDistrictSelect, onEpicSearch, onDismiss, constituencies = [] }) {
  const { lang } = useLanguage();
  const [epic, setEpic] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [mode, setMode] = useState('epic'); // Default to epic for zero friction

  if (!error) return null;

  const handleEpicSubmit = (e) => {
    e.preventDefault();
    if (epic.length >= 8) {
      onEpicSearch(epic);
    }
  };

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

  // Human-centric error message
  const humanMessage = error.message.includes('Detecting') 
    ? "We're currently syncing with the ECI database to find your precise ward. Please try again in a moment."
    : error.message;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <Icon name="X" size={24} />
          </button>

          <div className="p-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Icon name="LocateFixed" size={40} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  Verifying Your Location
                  <ListenButton text={humanMessage} lang={lang} label="Listen to message" />
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {humanMessage}
                </p>
                {error.action === 'TRIGGER_SEARCH_BY_EPIC' && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800 text-sm">
                    <Icon name="ShieldAlert" size={18} className="shrink-0" />
                    <span>To ensure complete accuracy, we do not estimate locations in complex voting zones. Please use your EPIC number for the official record.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-8 overflow-x-auto">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  mode === 'epic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setMode('epic')}
              >
                <Icon name="UserCheck" size={18} />
                EPIC Search
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  mode === 'pincode' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setMode('pincode')}
              >
                <Icon name="MapPin" size={18} />
                Pincode
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  mode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setMode('manual')}
              >
                <Icon name="Map" size={18} />
                District
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'epic' && (
                <motion.form
                  className="space-y-4"
                  onSubmit={handleEpicSubmit}
                  key="epic"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label className="block text-sm font-bold text-slate-700 mb-1">Enter your EPIC (Voter ID) Number</label>
                  <div className="flex gap-4">
                    <input
                      className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-3 text-xl font-bold tracking-widest focus:border-blue-500 outline-none transition-colors uppercase"
                      type="text"
                      placeholder="e.g. ABC1234567"
                      value={epic}
                      onChange={(e) => setEpic(e.target.value.toUpperCase())}
                      autoFocus
                    />
                    <Button type="submit" disabled={epic.length < 8} size="lg">
                      Search <Icon name="Search" size={18} className="ml-2" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {mode === 'pincode' && (
                <motion.form
                  className="space-y-4"
                  onSubmit={handlePincodeSubmit}
                  key="pincode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label className="block text-sm font-bold text-slate-700 mb-1">Enter your 6-digit Pincode</label>
                  <div className="flex gap-4">
                    <input
                      className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-3 text-xl font-bold tracking-widest focus:border-blue-500 outline-none transition-colors"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="e.g. 411001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    />
                    <Button type="submit" disabled={pincode.length !== 6} size="lg">
                      Search Area
                    </Button>
                  </div>
                </motion.form>
              )}

              {mode === 'manual' && (
                <motion.div
                  className="space-y-4"
                  key="manual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Select State</label>
                      <select
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 appearance-none focus:border-blue-500 outline-none transition-colors"
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedDistrict('');
                        }}
                      >
                        <option value="">Choose state...</option>
                        {AVAILABLE_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Select District</label>
                      <select
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 appearance-none focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedState}
                      >
                        <option value="">Choose district...</option>
                        {districtsForState.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" disabled={!selectedState} onClick={handleManualSubmit}>
                    Confirm Selection
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-slate-50 p-8 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-4 text-slate-600">
              <Icon name="PhoneCall" size={24} className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Official ECI Helpline: 1950</p>
                <p className="text-xs">24/7 voter assistance</p>
              </div>
            </div>
            <a
              href="https://voters.eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              Electoral Search Portal
              <Icon name="ExternalLink" size={18} />
            </a>
          </div>

          {error.coordinates && (
            <div className="bg-slate-900 text-[10px] text-slate-500 font-mono px-4 py-1 text-center">
              DEBUG: Lat {error.coordinates.lat}, Lng {error.coordinates.lng}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
