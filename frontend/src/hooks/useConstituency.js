import { useState, useCallback } from 'react';
import indiaPcGeoJson from '../data/india_pc_2019.json';

/**
 * PROACTIVE CIVIC INTELLIGENCE ENGINE — useConstituency
 * ====================================================
 * Refactored to orchestrate backend agent intelligence (Researcher, Compliance, Map-Maker).
 * Surfaces high-speed dynamic civic snapshots via parallel backend execution.
 */

export function useConstituency() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findConstituency = useCallback(async (lat, lng, expectedFeatureProps = null) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch comprehensive snapshot from the Proactive Civic Intelligence Engine
      const response = await fetch(`/api/constituency/lookup?lat=${lat}&lng=${lng}&lang=en`);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.error || 'No constituency found');
      }

      const snapshot = await response.json();
      
      // 2. Surf the intelligence snapshot into the state
      setSelected({
        ...snapshot.identity,
        intelligence: snapshot.intelligence,
        matchType: 'precise',
        approximate: false,
      });
    } catch (err) {
      setSelected(null);
      setError({
        type: 'NO_MATCH',
        message: err.message || "We're confirming your exact voting location. This sometimes takes a moment when syncing with the national register.",
        action: 'TRIGGER_SEARCH_BY_EPIC',
        coordinates: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
        helpline: '1950',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fallbacks for shadow zones / manual entry
   */
  const findByEpic = useCallback(async (epic) => {
    setLoading(true);
    setError(null);

    // Mocking EPIC search which would ideally hit a separate endpoint
    setTimeout(() => {
      const epicUpper = String(epic).trim().toUpperCase();
      // Logic would go here to match EPIC to PC
      setLoading(false);
      // For now, we'll just show the manual picker if EPIC fails in this mock
    }, 1000);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setError(null);
  }, []);

  return {
    selected,
    loading,
    error,
    findConstituency,
    findByEpic,
    clearSelection,
    // Note: allConstituencies still derived from local GeoJSON for the manual picker
    allConstituencies: indiaPcGeoJson.features.map(f => ({
      pc_name: f.properties.pc_name,
      state: f.properties.state,
      district: f.properties.district,
    })),
  };
}
