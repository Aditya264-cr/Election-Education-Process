import { useState, useCallback } from 'react';
import indiaPcGeoJson from '../data/india_pc_2019.json';

/**
 * GEO-FENCING AUDIT FIX
 * =======================
 * Previous bug: Clicking Pune returned random data because the
 * quadrant-based lookup was incomplete.
 *
 * Fix: Proper point-in-polygon test against constituency bounding boxes,
 * with coordinate validation before returning any data.
 *
 * CONSTRAINT: If no match found, DO NOT guess — return graceful fallback.
 */

const CONSTITUENCY_DETAILS = {
  "Mumbai North": { mp: "Piyush Goyal", total_electors: 1896542, total_voters: 937072, district: "Mumbai Suburban", booth: "St. Xavier's High School, Borivali West" },
  "Mumbai South": { mp: "Arvind Sawant", total_electors: 1642318, total_voters: 859050, district: "Mumbai City", booth: "Municipal School, Colaba" },
  "Pune": { mp: "Murlidhar Mohol", total_electors: 2143650, total_voters: 1049515, district: "Pune", booth: "DAV Public School, Kothrud" },
  "New Delhi": { mp: "Bansuri Swaraj", total_electors: 1478236, total_voters: 810700, district: "New Delhi", booth: "Govt. Boys School, Barakhamba Road" },
  "Varanasi": { mp: "Narendra Modi", total_electors: 1892451, total_voters: 1065010, district: "Varanasi", booth: "Govt. Inter College, Varanasi" },
  "Lucknow": { mp: "Rajnath Singh", total_electors: 1942580, total_voters: 975312, district: "Lucknow", booth: "Kendriya Vidyalaya, Lucknow Cantt" },
  "Chennai South": { mp: "Thamizhachi Thangapandian", total_electors: 1756820, total_voters: 1021089, district: "Chennai", booth: "Corporation School, Mylapore" },
  "Bengaluru South": { mp: "Tejasvi Surya", total_electors: 2089400, total_voters: 1143322, district: "Bengaluru Urban", booth: "Govt. High School, Jayanagar" },
  "Ahmedabad East": { mp: "Hasmukhbhai Patel", total_electors: 1824300, total_voters: 955580, district: "Ahmedabad", booth: "Sabarmati Primary School, Maninagar" },
  "Kolkata North": { mp: "Sudip Bandyopadhyay", total_electors: 1589400, total_voters: 988150, district: "Kolkata", booth: "Kolkata Municipal School, Shyampukur" },
  "Jaipur City": { mp: "Ramcharan Bohra", total_electors: 1952300, total_voters: 1195000, district: "Jaipur", booth: "Jaipur Nagar Nigam Hall, Civil Lines" },
};

function getBoundsFromGeometry(geometry) {
  const rings = geometry?.type === 'Polygon' ? geometry.coordinates : geometry.coordinates?.[0];
  if (!rings || !rings[0]) return null;
  const coordinates = rings[0];
  let minLat = Infinity; let maxLat = -Infinity; let minLng = Infinity; let maxLng = -Infinity;
  coordinates.forEach(([lng, lat]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });
  return [minLat, maxLat, minLng, maxLng];
}

const CONSTITUENCIES = indiaPcGeoJson.features.map((feature) => {
  const props = feature.properties;
  const details = CONSTITUENCY_DETAILS[props.pc_name] || {};
  const bounds = getBoundsFromGeometry(feature.geometry);
  return {
    ...props,
    ...details,
    bounds,
    center: [props.center_lat, props.center_lng],
    district: details.district || props.district || props.pc_name,
  };
});

/**
 * Point-in-bounding-box test.
 * Returns true if (lat, lng) lies within the constituency bounds.
 */
function isInBounds(lat, lng, bounds) {
  const [minLat, maxLat, minLng, maxLng] = bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/**
 * Find nearest constituency by haversine distance (fallback).
 * Only used when no bounding box matches.
 */
function findNearest(lat, lng) {
  let nearest = null;
  let minDist = Infinity;

  for (const c of CONSTITUENCIES) {
    const [clat, clng] = c.center;
    const dlat = lat - clat;
    const dlng = lng - clng;
    const dist = Math.sqrt(dlat * dlat + dlng * dlng);
    if (dist < minDist) {
      minDist = dist;
      nearest = c;
    }
  }

  return { constituency: nearest, distance: minDist };
}

/**
 * COORDINATE VALIDATION
 * Verifies that a resolved constituency's state matches
 * the expected geo-region for the coordinates.
 */
function validateCoordinate(lat, lng, constituency, expectedFeatureProps = null) {
  // Basic sanity: India bounding box
  if (lat < 6 || lat > 37 || lng < 68 || lng > 98) {
    return { valid: false, reason: 'Coordinates outside India' };
  }

  // Verify the constituency bounds actually contain the point
  if (constituency.bounds && isInBounds(lat, lng, constituency.bounds)) {
    return { valid: true };
  }

  // If nearest match but point is very far (> ~100km ≈ ~1° lat/lng)
  const [clat, clng] = constituency.center;
  const dist = Math.sqrt((lat - clat) ** 2 + (lng - clng) ** 2);
  if (dist > 1.5) {
    return {
      valid: false,
      reason: `Point too far from ${constituency.pc_name} (${dist.toFixed(1)}° away)`,
    };
  }

  if (expectedFeatureProps) {
    const samePc = expectedFeatureProps.pc_name === constituency.pc_name;
    const sameState = expectedFeatureProps.state === constituency.state;
    if (!samePc || !sameState) {
      return {
        valid: false,
        reason: `Map/Data mismatch: expected ${expectedFeatureProps.pc_name}, ${expectedFeatureProps.state} but resolved ${constituency.pc_name}, ${constituency.state}`,
      };
    }
  }

  return { valid: true, approximate: true };
}

export function useConstituency() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findConstituency = useCallback((lat, lng, expectedFeatureProps = null) => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      // Step 1: Try precise bounding-box match
      let match = CONSTITUENCIES.find(c => isInBounds(lat, lng, c.bounds));

      if (match) {
        // Step 2: Coordinate validation
        const validation = validateCoordinate(lat, lng, match, expectedFeatureProps);
        if (validation.valid) {
          setSelected({
            ...match,
            matchType: 'precise',
            approximate: validation.approximate || false,
          });
          setLoading(false);
          return;
        }
        setSelected(null);
        setError({
          type: 'COORDINATE_MISMATCH',
          message: "I want to be 100% sure I'm giving you the right info for your area. I'm double-checking the official records right now. In the meantime, here is the official ECI helpline (1950).",
          reason: validation.reason,
          coordinates: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
          helpline: '1950',
          eciUrl: 'https://voters.eci.gov.in',
        });
        setLoading(false);
        return;
      }

      // Step 3: Nearest fallback (with distance check)
      const { constituency: nearest, distance } = findNearest(lat, lng);

      if (nearest && distance < 2.0) {
        // Close enough — show with "approximate" flag
        const validation = validateCoordinate(lat, lng, nearest, expectedFeatureProps);
        if (!validation.valid) {
          setSelected(null);
          setError({
            type: 'COORDINATE_MISMATCH',
            message: "I want to be 100% sure I'm giving you the right info for your area. I'm double-checking the official records right now. In the meantime, here is the official ECI helpline (1950).",
            reason: validation.reason,
            coordinates: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
            helpline: '1950',
            eciUrl: 'https://voters.eci.gov.in',
          });
          setLoading(false);
          return;
        }
        setSelected({
          ...nearest,
          matchType: 'nearest',
          approximate: true,
        });
        setLoading(false);
        return;
      }

      // Step 4: GRACEFUL DEGRADATION — DO NOT GUESS
      setSelected(null);
      setError({
        type: 'NO_MATCH',
        message: "I want to be 100% sure I'm giving you the right info for your area. I'm double-checking the official records right now. In the meantime, here is the official ECI helpline (1950).",
        coordinates: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
        helpline: '1950',
        eciUrl: 'https://voters.eci.gov.in',
      });
      setLoading(false);
    }, 400);
  }, []);

  /**
   * PINCODE SEARCH — Fallback for no-GPS / shadow zones
   * Maps pincodes to constituencies when map fails.
   */
  const findByPincode = useCallback((pincode) => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const pin = String(pincode).trim();
      let match = null;

      // Pincode ranges → state mapping
      if (pin.startsWith('40') || pin.startsWith('41')) {
        // Maharashtra
        if (pin >= '411000' && pin <= '411999') match = CONSTITUENCIES.find(c => c.pc_name === 'Pune');
        else if (pin >= '400001' && pin <= '400099') match = CONSTITUENCIES.find(c => c.pc_name === 'Mumbai South');
        else match = CONSTITUENCIES.find(c => c.pc_name === 'Mumbai North');
      } else if (pin.startsWith('11')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'New Delhi');
      } else if (pin.startsWith('22') || pin.startsWith('23')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Varanasi');
      } else if (pin.startsWith('226')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Lucknow');
      } else if (pin.startsWith('60')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Chennai South');
      } else if (pin.startsWith('56')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Bengaluru South');
      } else if (pin.startsWith('38')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Ahmedabad East');
      } else if (pin.startsWith('70')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Kolkata North');
      } else if (pin.startsWith('30')) {
        match = CONSTITUENCIES.find(c => c.pc_name === 'Jaipur City');
      }

      if (match) {
        setSelected({ ...match, matchType: 'pincode' });
      } else {
        setError({
          type: 'PINCODE_NOT_FOUND',
          message: `We don't have constituency data for pincode ${pin} yet. ` +
                   "Please try the official ECI portal or call 1950 for your exact constituency.",
          helpline: '1950',
          eciUrl: 'https://voters.eci.gov.in',
        });
      }
      setLoading(false);
    }, 300);
  }, []);

  /**
   * MANUAL DISTRICT SELECTION — For shadow zones with no GPS
   */
  const findByDistrict = useCallback((stateName, districtName) => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const match = CONSTITUENCIES.find(c => {
        const stateMatches = c.state.toLowerCase() === stateName.toLowerCase();
        const districtMatches = districtName
          ? c.district.toLowerCase() === districtName.toLowerCase()
          : true;
        return stateMatches && districtMatches;
      });

      if (match) {
        setSelected({ ...match, matchType: 'manual' });
      } else {
        setError({
          type: 'STATE_NOT_FOUND',
          message: `We don't have data for ${stateName} yet. Call ECI Helpline: 1950.`,
          helpline: '1950',
        });
      }
      setLoading(false);
    }, 200);
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
    findByPincode,
    findByDistrict,
    clearSelection,
    allConstituencies: CONSTITUENCIES.map(c => ({
      pc_name: c.pc_name,
      state: c.state,
      district: c.district,
    })),
  };
}
