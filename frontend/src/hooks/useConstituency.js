import { useState, useCallback } from 'react';

// Sample constituency data — in production, fetched from backend
const SAMPLE_CONSTITUENCIES = [
  { pc_no: 1, pc_name: "Mumbai North", ac_name: "Borivali", state: "Maharashtra", mp: "Piyush Goyal", turnout_2024: 49.42, turnout_2019: 51.78, total_electors: 1896542, total_voters: 937072, booth: "St. Xavier's High School, Borivali West" },
  { pc_no: 2, pc_name: "Mumbai South", ac_name: "Colaba", state: "Maharashtra", mp: "Arvind Sawant", turnout_2024: 52.31, turnout_2019: 48.92, total_electors: 1642318, total_voters: 859050, booth: "Municipal School, Colaba" },
  { pc_no: 3, pc_name: "Pune", ac_name: "Kothrud", state: "Maharashtra", mp: "Murlidhar Mohol", turnout_2024: 48.96, turnout_2019: 49.89, total_electors: 2143650, total_voters: 1049515, booth: "DAV Public School, Kothrud" },
  { pc_no: 4, pc_name: "New Delhi", ac_name: "New Delhi", state: "Delhi", mp: "Bansuri Swaraj", turnout_2024: 54.83, turnout_2019: 60.21, total_electors: 1478236, total_voters: 810700, booth: "Govt. Boys School, Barakhamba Road" },
  { pc_no: 5, pc_name: "Varanasi", ac_name: "Varanasi City", state: "Uttar Pradesh", mp: "Narendra Modi", turnout_2024: 56.29, turnout_2019: 55.40, total_electors: 1892451, total_voters: 1065010, booth: "Govt. Inter College, Varanasi" },
  { pc_no: 6, pc_name: "Lucknow", ac_name: "Lucknow Cantt", state: "Uttar Pradesh", mp: "Rajnath Singh", turnout_2024: 50.21, turnout_2019: 52.89, total_electors: 1942580, total_voters: 975312, booth: "Kendriya Vidyalaya, Lucknow Cantt" },
  { pc_no: 7, pc_name: "Chennai South", ac_name: "Mylapore", state: "Tamil Nadu", mp: "Thamizhachi Thangapandian", turnout_2024: 58.11, turnout_2019: 61.35, total_electors: 1756820, total_voters: 1021089, booth: "Corporation School, Mylapore" },
  { pc_no: 8, pc_name: "Bengaluru South", ac_name: "Jayanagar", state: "Karnataka", mp: "Tejasvi Surya", turnout_2024: 54.72, turnout_2019: 53.67, total_electors: 2089400, total_voters: 1143322, booth: "Govt. High School, Jayanagar" },
];

export function useConstituency() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const findConstituency = useCallback((lat, lng) => {
    setLoading(true);

    // Simulate lookup — in production, this would use point-in-polygon against real GeoJSON
    setTimeout(() => {
      // Simple assignment based on lat/lng quadrants for demo
      let index;
      if (lat > 19 && lat < 20 && lng > 72 && lng < 73) index = 0; // Mumbai North
      else if (lat > 18.5 && lat <= 19 && lng > 72 && lng < 73) index = 1; // Mumbai South
      else if (lat > 18 && lat < 19 && lng > 73 && lng < 74) index = 2; // Pune
      else if (lat > 28 && lat < 29 && lng > 77 && lng < 77.5) index = 3; // New Delhi
      else if (lat > 25 && lat < 26 && lng > 82 && lng < 84) index = 4; // Varanasi
      else if (lat > 26 && lat < 27 && lng > 80 && lng < 81) index = 5; // Lucknow
      else if (lat > 12 && lat < 14 && lng > 80 && lng < 81) index = 6; // Chennai
      else if (lat > 12 && lat < 14 && lng > 77 && lng < 78) index = 7; // Bengaluru
      else index = Math.floor(Math.random() * SAMPLE_CONSTITUENCIES.length);

      setSelected(SAMPLE_CONSTITUENCIES[index]);
      setLoading(false);
    }, 600);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
  }, []);

  return { selected, loading, findConstituency, clearSelection };
}
