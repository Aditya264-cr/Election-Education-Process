import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Castle icon for kids mode
const castleIcon = L.divIcon({
  html: '<div style="font-size:32px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🏰</div>',
  className: 'castle-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Home icon for user location
const homeIcon = L.divIcon({
  html: '<div style="font-size:24px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🏠</div>',
  className: 'home-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// ✨ Treasure Chest icon for polling booth
const treasureIcon = L.divIcon({
  html: `<div class="treasure-marker-wrapper">
    <div class="treasure-chest-icon">🎁</div>
    <div class="treasure-glow"></div>
  </div>`,
  className: 'treasure-marker',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
});

// Explorer's compass icon for user location in treasure mode
const explorerIcon = L.divIcon({
  html: '<div style="font-size:28px;text-align:center;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5));animation:float 3s ease infinite">🧭</div>',
  className: 'explorer-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Sample India constituency GeoJSON (simplified major states outlines)
const INDIA_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Maharashtra", pc_name: "Mumbai North", pc_no: 1, turnout: 49.42 }, geometry: { type: "Polygon", coordinates: [[[72.6,21.1],[73.8,20.7],[76.5,18.5],[80.9,19.5],[80.3,21.5],[78.5,21.8],[76.0,20.8],[73.5,21.5],[72.6,21.1]]] }},
    { type: "Feature", properties: { name: "Delhi", pc_name: "New Delhi", pc_no: 4, turnout: 54.83 }, geometry: { type: "Polygon", coordinates: [[[76.84,28.4],[77.35,28.4],[77.35,28.88],[76.84,28.88],[76.84,28.4]]] }},
    { type: "Feature", properties: { name: "Uttar Pradesh", pc_name: "Varanasi", pc_no: 5, turnout: 56.29 }, geometry: { type: "Polygon", coordinates: [[[77.1,26.3],[84.6,26.3],[84.6,30.4],[77.1,30.4],[77.1,26.3]]] }},
    { type: "Feature", properties: { name: "Tamil Nadu", pc_name: "Chennai South", pc_no: 7, turnout: 58.11 }, geometry: { type: "Polygon", coordinates: [[[76.2,8.1],[80.4,8.1],[80.4,13.6],[76.2,13.6],[76.2,8.1]]] }},
    { type: "Feature", properties: { name: "Karnataka", pc_name: "Bengaluru South", pc_no: 8, turnout: 54.72 }, geometry: { type: "Polygon", coordinates: [[[74.0,11.5],[78.6,11.5],[78.6,18.5],[74.0,18.5],[74.0,11.5]]] }},
    { type: "Feature", properties: { name: "Gujarat", pc_name: "Ahmedabad East", pc_no: 9, turnout: 52.35 }, geometry: { type: "Polygon", coordinates: [[[68.2,20.1],[72.4,20.1],[72.4,24.7],[68.2,24.7],[68.2,20.1]]] }},
    { type: "Feature", properties: { name: "West Bengal", pc_name: "Kolkata North", pc_no: 10, turnout: 62.18 }, geometry: { type: "Polygon", coordinates: [[[85.8,21.5],[89.9,21.5],[89.9,27.2],[85.8,27.2],[85.8,21.5]]] }},
    { type: "Feature", properties: { name: "Rajasthan", pc_name: "Jaipur City", pc_no: 11, turnout: 61.20 }, geometry: { type: "Polygon", coordinates: [[[69.5,23.1],[78.3,23.1],[78.3,30.2],[69.5,30.2],[69.5,23.1]]] }},
  ]
};

// Simulated polling booth locations (near center of each constituency)
const POLLING_BOOTHS = [
  { id: 1, name: "Shivaji Park Community Hall", state: "Maharashtra", lat: 19.03, lng: 72.84, type: "school" },
  { id: 2, name: "Delhi Public School", state: "Delhi", lat: 28.63, lng: 77.10, type: "school" },
  { id: 3, name: "BHU Community Center", state: "Uttar Pradesh", lat: 25.27, lng: 82.99, type: "community_hall" },
  { id: 4, name: "Government Higher Secondary School", state: "Tamil Nadu", lat: 13.06, lng: 80.24, type: "school" },
  { id: 5, name: "Town Hall Bengaluru", state: "Karnataka", lat: 12.97, lng: 77.59, type: "community_hall" },
  { id: 6, name: "Sabarmati Primary School", state: "Gujarat", lat: 23.03, lng: 72.59, type: "school" },
  { id: 7, name: "Kolkata Municipal School", state: "West Bengal", lat: 22.57, lng: 88.36, type: "school" },
  { id: 8, name: "Jaipur Nagar Nigam Hall", state: "Rajasthan", lat: 26.92, lng: 75.79, type: "community_hall" },
];

// Choropleth color scale based on turnout
function getColor(turnout) {
  return turnout > 60 ? '#1a9850' :
         turnout > 55 ? '#91cf60' :
         turnout > 50 ? '#d9ef8b' :
         turnout > 45 ? '#fee08b' :
         turnout > 40 ? '#fc8d59' :
                         '#d73027';
}

// Kids treasure map colors
function getKidsColor(feature) {
  const colors = ['#9B59B6', '#3498DB', '#2ECC71', '#E74C3C', '#F39C12', '#1ABC9C', '#E91E63', '#FF5722'];
  return colors[feature.properties.pc_no % colors.length];
}

// Calculate distance between two points (haversine, km)
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Click handler subcomponent
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Cinematic immersive zoom: zooms out first, then smooth fly-in to constituency
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      const currentZoom = map.getZoom();
      // Phase 1: Quick zoom out for dramatic effect
      if (currentZoom > 7) {
        map.flyTo(map.getCenter(), 6, { duration: 0.8 });
        // Phase 2: Cinematic fly to target
        setTimeout(() => {
          map.flyTo(position, 12, { duration: 2.5, easeLinearity: 0.15 });
        }, 900);
      } else {
        // Already zoomed out — direct cinematic fly
        map.flyTo(position, 12, { duration: 2.5, easeLinearity: 0.15 });
      }
    }
  }, [position, map]);
  return null;
}

export default function IndiaMap({ onLocationSelect, selectedConstituency }) {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [userPos, setUserPos] = useState(null);
  const [clickedPos, setClickedPos] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [treasureFound, setTreasureFound] = useState(new Set());

  // Find nearest polling booth to user's position
  const nearestBooth = useMemo(() => {
    if (!userPos) return null;
    let nearest = null;
    let minDist = Infinity;
    for (const booth of POLLING_BOOTHS) {
      const dist = getDistanceKm(userPos[0], userPos[1], booth.lat, booth.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = { ...booth, distance: dist };
      }
    }
    return nearest;
  }, [userPos]);

  // Auto-locate on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(loc);
          setFlyTarget(loc);
          onLocationSelect(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default: Mumbai
          setUserPos([19.076, 72.8777]);
          setFlyTarget([19.076, 72.8777]);
          onLocationSelect(19.076, 72.8777);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleMapClick = (latlng) => {
    setClickedPos([latlng.lat, latlng.lng]);
    setFlyTarget([latlng.lat, latlng.lng]);
    onLocationSelect(latlng.lat, latlng.lng);
  };

  const handleTreasureClick = (boothId) => {
    setTreasureFound(prev => new Set([...prev, boothId]));
  };

  // Normal tile layer
  const normalTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  // Kids adventure tile layer (watercolor style)
  const kidsTiles = 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg';
  const kidsLabels = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png';

  const geoJsonStyle = (feature) => ({
    fillColor: isKidsMode ? getKidsColor(feature) : getColor(feature.properties.turnout),
    weight: isKidsMode ? 3 : 2,
    opacity: 1,
    color: isKidsMode ? 'rgba(255,215,0,0.7)' : 'rgba(255,255,255,0.4)',
    dashArray: isKidsMode ? '8 4' : '',
    fillOpacity: isKidsMode ? 0.35 : 0.45,
  });

  const onEachFeature = (feature, layer) => {
    const name = isKidsMode 
      ? `🏰 ${feature.properties.name} Kingdom`
      : feature.properties.name;
    layer.bindTooltip(name, {
      permanent: false,
      direction: 'center',
      className: 'constituency-tooltip'
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.7, weight: 3 });
      },
      mouseout: (e) => {
        e.target.setStyle(geoJsonStyle(feature));
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={[22.5, 78.9]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        zoomControl={true}
        style={{ width: '100%', height: '100%' }}
        maxBounds={[[6, 65], [38, 100]]}
      >
        <TileLayer
          url={isKidsMode ? kidsTiles : normalTiles}
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        />
        {isKidsMode && (
          <TileLayer url={kidsLabels} />
        )}

        <GeoJSON
          key={isKidsMode ? 'kids' : 'normal'}
          data={INDIA_GEOJSON}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />

        <MapClickHandler onMapClick={handleMapClick} />
        {flyTarget && <FlyToLocation position={flyTarget} />}

        {/* User location marker */}
        {userPos && (
          <Marker position={userPos} icon={isKidsMode ? explorerIcon : homeIcon}>
            <Popup>{isKidsMode ? "🧭 You Are Here, Explorer!" : "📍 " + t('map_located')}</Popup>
          </Marker>
        )}

        {/* ── Treasure Hunt: Polling Booth Markers ── */}
        {isKidsMode && POLLING_BOOTHS.map((booth) => {
          const isFound = treasureFound.has(booth.id);
          const isNearest = nearestBooth?.id === booth.id;
          
          return (
            <Marker
              key={`booth-${booth.id}`}
              position={[booth.lat, booth.lng]}
              icon={treasureIcon}
              eventHandlers={{
                click: () => handleTreasureClick(booth.id),
              }}
            >
              <Popup>
                <div className="treasure-popup">
                  {isFound ? (
                    <>
                      <div className="treasure-popup-emoji">🎉</div>
                      <div className="treasure-popup-title">Great job, Scout!</div>
                      <div className="treasure-popup-text">
                        This is <strong>{booth.name}</strong> — where the magic happens on Election Day!
                      </div>
                      <div className="treasure-popup-mission">
                        🎯 Your mission: Lead your parents here on voting day!
                      </div>
                      {isNearest && (
                        <div className="treasure-popup-distance">
                          📍 {nearestBooth.distance.toFixed(1)} km from your home base
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="treasure-popup-emoji">🎁</div>
                      <div className="treasure-popup-title">Treasure Found!</div>
                      <div className="treasure-popup-text">
                        Click to open this treasure chest!
                      </div>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Clicked location marker (non-kids mode) */}
        {!isKidsMode && clickedPos && clickedPos !== userPos && (
          <Marker position={clickedPos}>
            <Popup>
              {selectedConstituency?.pc_name || t('loading')}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ── Treasure Hunt Overlay Banner ── */}
      {isKidsMode && (
        <div className="treasure-hunt-banner glass-panel animate-fadeInUp">
          <span className="treasure-banner-icon">🗺️</span>
          <div className="treasure-banner-content">
            <span className="treasure-banner-title">Treasure Hunt!</span>
            <span className="treasure-banner-sub">
              Find the {POLLING_BOOTHS.length} hidden treasure chests! 
              Found: {treasureFound.size}/{POLLING_BOOTHS.length}
            </span>
          </div>
          {nearestBooth && (
            <div className="treasure-banner-nearest">
              <span>📍 Nearest: <strong>{nearestBooth.distance.toFixed(1)} km</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Map overlay prompt */}
      {!isKidsMode && !clickedPos && !selectedConstituency && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          <div className="glass-panel animate-fadeInUp" style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}>
            <span style={{ fontSize: '1.2rem' }}>👆</span>
            <span>{t('map_click_prompt')}</span>
          </div>
        </div>
      )}

      {/* Turnout Legend (Adult only) */}
      {!isKidsMode && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          right: 16,
          zIndex: 1000,
        }}>
          <div className="glass-panel" style={{ padding: '12px 16px', fontSize: '0.75rem' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              {t('panel_turnout')} %
            </div>
            {[
              ['> 60%', '#1a9850'],
              ['55-60%', '#91cf60'],
              ['50-55%', '#d9ef8b'],
              ['45-50%', '#fee08b'],
              ['40-45%', '#fc8d59'],
              ['< 40%', '#d73027'],
            ].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: color }} />
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
