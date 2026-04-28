import { useState, useEffect, useCallback } from 'react';

/**
 * CIVIC TRACKER HOOK
 * ==================
 * Tracks user interests and feature engagement for the Civic Resume.
 * All data stored in localStorage — nothing leaves the device.
 */

const STORAGE_KEYS = {
  topics: 'fn-topics-viewed',
  features: 'fn-features-used',
  promises: 'fn-promises-checked',
  ledger: 'fn-election-ledger-2026',
};

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function writeJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useCivicTracker() {
  const [profile, setProfile] = useState({ topics: [], features: [], promises: [] });

  // Load on mount
  useEffect(() => {
    setProfile({
      topics: readJSON(STORAGE_KEYS.topics),
      features: readJSON(STORAGE_KEYS.features),
      promises: readJSON(STORAGE_KEYS.promises),
    });
  }, []);

  const trackTopic = useCallback((topic) => {
    const current = readJSON(STORAGE_KEYS.topics);
    const existing = current.find((t) => t.name === topic);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.lastViewed = Date.now();
    } else {
      current.push({ name: topic, count: 1, lastViewed: Date.now() });
    }
    writeJSON(STORAGE_KEYS.topics, current);
    setProfile((p) => ({ ...p, topics: current }));
  }, []);

  const trackFeature = useCallback((featureName) => {
    const current = readJSON(STORAGE_KEYS.features);
    if (!current.includes(featureName)) {
      current.push(featureName);
      writeJSON(STORAGE_KEYS.features, current);
      setProfile((p) => ({ ...p, features: current }));
    }
  }, []);

  const trackPromise = useCallback((promiseText) => {
    const current = readJSON(STORAGE_KEYS.promises);
    current.push({ text: promiseText, timestamp: Date.now() });
    // Keep last 50
    const trimmed = current.slice(-50);
    writeJSON(STORAGE_KEYS.promises, trimmed);
    setProfile((p) => ({ ...p, promises: trimmed }));
  }, []);

  // 5-Year Ledger
  const saveLedgerEntry = useCallback((entry) => {
    const current = readJSON(STORAGE_KEYS.ledger);
    current.push({ ...entry, savedAt: Date.now(), status: 'Not Started' });
    writeJSON(STORAGE_KEYS.ledger, current);
  }, []);

  const getLedger = useCallback(() => {
    return readJSON(STORAGE_KEYS.ledger);
  }, []);

  const updateLedgerStatus = useCallback((index, newStatus) => {
    const current = readJSON(STORAGE_KEYS.ledger);
    if (current[index]) {
      current[index].status = newStatus;
      current[index].updatedAt = Date.now();
      writeJSON(STORAGE_KEYS.ledger, current);
    }
    return current;
  }, []);

  const getTopInterests = useCallback(() => {
    const topics = readJSON(STORAGE_KEYS.topics);
    return topics
      .sort((a, b) => (b.count || 1) - (a.count || 1))
      .slice(0, 5)
      .map((t) => t.name);
  }, []);

  return {
    profile,
    trackTopic,
    trackFeature,
    trackPromise,
    saveLedgerEntry,
    getLedger,
    updateLedgerStatus,
    getTopInterests,
  };
}
