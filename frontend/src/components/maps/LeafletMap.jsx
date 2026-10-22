import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Clock, Navigation, AlertCircle, MapPin, Gauge } from 'lucide-react';

// Fix for default Leaflet marker icons in React Vite bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Bus Marker Icon
const createBusIcon = (isStale = false) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${isStale ? '#94A3B8' : '#2678C8'};
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M15 6v6"/>
          <path d="M2 12h19.6"/>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-4.2C20 7.7 19.1 7 18 7H6c-1.1 0-2 .7-2.4 1.6L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
          <circle cx="7" cy="18" r="2"/>
          <path d="M9 18h5"/>
          <circle cx="16" cy="18" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [0, 0],
  });
};

// Custom Stop Marker Icon
const createStopIcon = (index) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background: #12345A;
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        transform: translate(-50%, -50%);
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [0, 0],
  });
};

// Custom Next Target Stop Marker Icon (Highlight for AI Next Stop)
const createNextStopIcon = (index) => {
  return L.divIcon({
    className: 'custom-next-stop-marker',
    html: `
      <div style="
        background: #0284C7;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;
        border: 3px solid #38BDF8;
        box-shadow: 0 0 12px rgba(2, 132, 199, 0.8);
        transform: translate(-50%, -50%);
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [0, 0],
  });
};

// Component to dynamically re-center map when coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

const LeafletMap = ({
  latitude,
  longitude,
  speed = 0,
  lastUpdated,
  busNumber = 'School Bus',
  routeStops = [],
  nextStop = null,
  predictedEtaMinutes = null,
  height = '420px',
}) => {
  const isValidCoord =
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // Determine if location is stale (> 3 minutes without update)
  const isStale = useMemo(() => {
    if (!lastUpdated) return true;
    const diffMs = Date.now() - new Date(lastUpdated).getTime();
    return diffMs > 3 * 60 * 1000;
  }, [lastUpdated]);

  const center = useMemo(() => {
    if (isValidCoord) return [Number(latitude), Number(longitude)];
    if (routeStops.length > 0 && routeStops[0].latitude && routeStops[0].longitude) {
      return [Number(routeStops[0].latitude), Number(routeStops[0].longitude)];
    }
    // Default fallback center (Kolhapur coordinates matching database data)
    return [16.705, 74.243];
  }, [isValidCoord, latitude, longitude, routeStops]);

  // Polyline coordinates from stops
  const polylineCoords = useMemo(() => {
    return routeStops
      .filter((s) => Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude)))
      .map((s) => [Number(s.latitude), Number(s.longitude)]);
  }, [routeStops]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Top Status Banner */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 400,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isValidCoord && !isStale ? 'var(--success)' : isStale ? 'var(--warning)' : 'var(--error)',
            }}
          />
          <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{busNumber}</span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ color: isValidCoord && !isStale ? 'var(--success)' : isStale ? 'var(--warning)' : 'var(--error)', fontWeight: 600 }}>
            {isValidCoord && !isStale ? 'Live Connected' : isStale ? 'Stale / Offline' : 'No Signal'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          {speed !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Gauge size={14} /> {speed} km/h
            </span>
          )}
          {lastUpdated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Map */}
      <MapContainer
        center={center}
        zoom={isValidCoord ? 14 : 12}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={center} />

        {/* Bus Marker */}
        {isValidCoord && (
          <Marker position={[Number(latitude), Number(longitude)]} icon={createBusIcon(isStale)}>
            <Popup>
              <div style={{ padding: '0.25rem', minWidth: '160px' }}>
                <p style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {busNumber}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0' }}>
                  Speed: <strong>{speed} km/h</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
                </p>
                {isStale && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600, marginTop: '0.25rem' }}>
                    Note: Last recorded GPS position. Driver may be offline or between stops.
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Stops */}
        {routeStops.map((stop, idx) => {
          if (!stop.latitude || !stop.longitude) return null;
          const isNextStop = nextStop && (
            (nextStop._id && stop._id && nextStop._id.toString() === stop._id.toString()) ||
            (nextStop.name && stop.name && nextStop.name.trim().toLowerCase() === stop.name.trim().toLowerCase())
          );
          return (
            <Marker
              key={idx}
              position={[Number(stop.latitude), Number(stop.longitude)]}
              icon={isNextStop ? createNextStopIcon(idx) : createStopIcon(idx)}
            >
              <Popup>
                <div style={{ padding: '0.2rem', minWidth: '160px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--primary-navy)', fontSize: '0.85rem' }}>
                    Stop {idx + 1}: {stop.name} {isNextStop && '(Next Target Stop)'}
                  </p>
                  {isNextStop && predictedEtaMinutes !== null && predictedEtaMinutes !== undefined && (
                    <p style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700, margin: '0.15rem 0' }}>
                      Predicted ETA: ~{predictedEtaMinutes} min
                    </p>
                  )}
                  {stop.scheduledTime && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.1rem 0' }}>
                      Scheduled: <strong>{stop.scheduledTime}</strong>
                    </p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {stop.latitude}, {stop.longitude}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Line */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: 'var(--secondary-blue)', weight: 4, dashArray: '6, 8', opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {!isValidCoord && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 400,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <AlertCircle size={16} color="var(--warning)" />
          <span>Live GPS coordinates currently unavailable for this bus.</span>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
