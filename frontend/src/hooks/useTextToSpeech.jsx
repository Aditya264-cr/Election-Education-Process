/**
 * TEXT-TO-SPEECH HOOK — "Listen to Neighbor"
 * ==========================================
 * Voice-First UI: Every text element can be read aloud
 * using localized regional accents via Web Speech API.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

// Map app language codes to BCP 47 locale voice preferences
const VOICE_MAP = {
  en: ['en-IN', 'en-GB', 'en-US'],
  hi: ['hi-IN', 'hi'],
  mr: ['mr-IN', 'mr', 'hi-IN'],
  ta: ['ta-IN', 'ta'],
  bn: ['bn-IN', 'bn'],
};

export function useTextToSpeech(lang = 'en') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const findVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const preferences = VOICE_MAP[lang] || VOICE_MAP.en;

    for (const pref of preferences) {
      const match = voices.find((v) =>
        v.lang.startsWith(pref) || v.lang === pref
      );
      if (match) return match;
    }
    // Fallback to any available voice
    return voices[0] || null;
  }, [lang]);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findVoice();
    if (voice) utterance.voice = voice;

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [findVoice]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggle = useCallback((text) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stop]);

  const announceAccessibility = useCallback((pcName, facilities = []) => {
    const facilityText = facilities.length > 0 
      ? `It features ${facilities.join(', ')}.` 
      : "Standard accessibility is maintained here.";
    const script = `Neighbor, this booth in ${pcName} has a ramp and special facilities. ${facilityText} I've also confirmed there's a priority queue for you today.`;
    speak(script);
  }, [speak]);

  return { speak, stop, toggle, announceAccessibility, isSpeaking, isSupported };
}

/**
 * ListenButton — Reusable TTS icon button
 * Renders the 🔊 toggle with speaking animation
 */
export function ListenButton({ text, lang, label = 'Listen to Neighbor' }) {
  const { toggle, isSpeaking, isSupported } = useTextToSpeech(lang);

  if (!isSupported) return null;

  return (
    <button
      className={`tts-btn ${isSpeaking ? 'speaking' : ''}`}
      onClick={() => toggle(text)}
      aria-label={label}
      title={label}
      type="button"
    >
      {isSpeaking ? '🔊' : '🔈'}
    </button>
  );
}
