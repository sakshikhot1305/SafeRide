import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Clock, Navigation, AlertCircle, MapPin, Gauge, Radio, Crosshair } from 'lucide-react';

// Fix for default Leaflet marker icons in React Vite bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Animated Bus Marker Icon
const createBusIcon = (statusMode = 'live') => {
  const bgColor = statusMode === 'live' ? '#2678C8' : statusMode === 'waiting' ? '#D97706' : '#64748B';
  const pulseRing =
    statusMode === 'live'
      ? `
    <span style="
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(38, 120, 200, 0.35);
      animation: busPulse 1.8s infinite ease-out;
      pointer-events: none;
    "></span>
  `
      : '';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        transform: translate(-50%, -50%);
      ">
        ${pulseRing}
        <div style="
          background: ${bgColor};
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          z-index: 2;
          transition: transform 0.2s ease;
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
      </div>
    `,
    iconSize: [48, 48],
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

// Hook: Smooth position interpolation for realistic moving marker
const useSmoothPosition = (targetLat, targetLng, duration = 1200) => {
  const isValidTarget =
    Number.isFinite(targetLat) &&
    Number.isFinite(targetLng) &&
    targetLat >= -90 &&
    targetLat <= 90 &&
    targetLng >= -180 &&
    targetLng <= 180;

  const [currentPos, setCurrentPos] = useState(() => (isValidTarget ? [targetLat, targetLng] : [null, null]));
  const prevPosRef = useRef(isValidTarget ? [targetLat, targetLng] : [null, null]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!isValidTarget) return;

    const startLat = prevPosRef.current ? prevPosRef.current[0] : null;
    const startLng = prevPosRef.current ? prevPosRef.current[1] : null;

    if (!Number.isFinite(startLat) || !Number.isFinite(startLng)) {
      prevPosRef.current = [targetLat, targetLng];
      setCurrentPos([targetLat, targetLng]);
      return;
    }

    if (startLat === targetLat && startLng === targetLng) return;

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth easeInOutQuad curve
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const curLat = startLat + (targetLat - startLat) * ease;
      const curLng = startLng + (targetLng - startLng) * ease;
      setCurrentPos([curLat, curLng]);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        prevPosRef.current = [targetLat, targetLng];
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetLat, targetLng, isValidTarget, duration]);

  // CRITICAL: If target is valid, NEVER return null or NaN to prevent Leaflet LatLng crash
  if (
    isValidTarget &&
    (!currentPos || !Number.isFinite(currentPos[0]) || !Number.isFinite(currentPos[1]))
  ) {
    return [targetLat, targetLng];
  }

  return currentPos;
};

// Component to dynamically re-center/pan map when coordinates change if followBus is active
const MapFollowController = ({ center, followBus }) => {
  const map = useMap();
  useEffect(() => {
    if (
      followBus &&
      Array.isArray(center) &&
      center.length >= 2 &&
      Number.isFinite(center[0]) &&
      Number.isFinite(center[1])
    ) {
      try {
        map.panTo(center, { animate: true, duration: 1.0 });
      } catch (err) {
        console.warn('Map pan error:', err);
      }
    }
  }, [center, followBus, map]);
  return null;
};

const LeafletMap = ({
  latitude,
  longitude,
  speed = 0,
  lastUpdated,
  busNumber = 'School Bus',
  registrationNumber = '',
  routeStops = [],
  nextStop = null,
  predictedEtaMinutes = null,
  height = '440px',
}) => {
  const [followBus, setFollowBus] = useState(true);

  const numLat = Number(latitude);
  const numLng = Number(longitude);
  const isValidCoord =
    Number.isFinite(numLat) &&
    Number.isFinite(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180;

  // Smooth position interpolation
  const smoothPos = useSmoothPosition(isValidCoord ? numLat : NaN, isValidCoord ? numLng : NaN, 1200);

  const smoothLat = smoothPos ? smoothPos[0] : null;
  const smoothLng = smoothPos ? smoothPos[1] : null;

  const isValidSmooth =
    Number.isFinite(smoothLat) &&
    Number.isFinite(smoothLng) &&
    smoothLat >= -90 &&
    smoothLat <= 90 &&
    smoothLng >= -180 &&
    smoothLng <= 180;

  const activeMarkerPos = isValidSmooth
    ? [smoothLat, smoothLng]
    : isValidCoord
    ? [numLat, numLng]
    : null;

  // Status calculation based on last update timestamp freshness
  const statusInfo = useMemo(() => {
    if (!isValidCoord) {
      return {
        label: 'No Signal',
        mode: 'nosignal',
        color: 'var(--error, #EF4444)',
        desc: 'Waiting for bus GPS broadcast to begin',
      };
    }
    if (!lastUpdated) {
      return {
        label: 'Live',
        mode: 'live',
        color: 'var(--success, #16A34A)',
        desc: 'GPS position active',
      };
    }
    const diffMs = Date.now() - new Date(lastUpdated).getTime();
    if (diffMs < 60 * 1000) {
      return {
        label: 'Live',
        mode: 'live',
        color: 'var(--success, #16A34A)',
        desc: 'Real-time GPS broadcast active',
      };
    }
    if (diffMs <= 3 * 60 * 1000) {
      const mins = Math.floor(diffMs / 60000);
      return {
        label: 'Waiting for Location',
        mode: 'waiting',
        color: 'var(--warning, #F59E0B)',
        desc: `Signal delayed (${mins}m ago)`,
      };
    }
    return {
      label: 'Offline',
      mode: 'offline',
      color: '#64748B',
      desc: 'GPS signal stopped or driver offline',
    };
  }, [isValidCoord, lastUpdated]);

  const center = useMemo(() => {
    if (activeMarkerPos && Number.isFinite(activeMarkerPos[0]) && Number.isFinite(activeMarkerPos[1])) {
      return activeMarkerPos;
    }
    if (Array.isArray(routeStops) && routeStops.length > 0) {
      const firstStop = routeStops.find(
        (s) => Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude))
      );
      if (firstStop) {
        return [Number(firstStop.latitude), Number(firstStop.longitude)];
      }
    }
    return [16.705, 74.243]; // Kolhapur default
  }, [activeMarkerPos, routeStops]);

  const polylineCoords = useMemo(() => {
    if (!Array.isArray(routeStops)) return [];
    return routeStops
      .filter((s) => Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude)))
      .map((s) => [Number(s.latitude), Number(s.longitude)]);
  }, [routeStops]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        border: '1px solid var(--border-color, #E2E8F0)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
      }}
    >
      {/* Top Status Header */}
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
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md, 8px)',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-color, #E2E8F0)',
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: statusInfo.color,
              display: 'inline-block',
              boxShadow: statusInfo.mode === 'live' ? '0 0 8px rgba(16, 185, 129, 0.8)' : 'none',
            }}
          />
          <span style={{ fontWeight: 800, color: 'var(--primary-navy, #12345A)' }}>
            {busNumber} {registrationNumber ? `(${registrationNumber})` : ''}
          </span>
          <span style={{ color: 'var(--text-secondary, #64748B)' }}>•</span>
          <span style={{ color: statusInfo.color, fontWeight: 700 }}>{statusInfo.label}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)' }}>
            ({statusInfo.desc})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-secondary, #64748B)' }}>
          {speed !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <Gauge size={14} /> {speed} km/h
            </span>
          )}
          {lastUpdated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
              <Clock size={13} /> {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          {activeMarkerPos && (
            <button
              type="button"
              onClick={() => setFollowBus((f) => !f)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid',
                borderColor: followBus ? 'var(--secondary-blue, #2678C8)' : 'var(--border-color, #E2E8F0)',
                background: followBus ? 'rgba(38, 120, 200, 0.1)' : '#FFFFFF',
                color: followBus ? 'var(--secondary-blue, #2678C8)' : 'var(--text-secondary, #64748B)',
                cursor: 'pointer',
              }}
              title={followBus ? 'Click to stop auto-following' : 'Click to follow moving bus'}
            >
              <Crosshair size={12} />
              {followBus ? 'Following Bus' : 'Follow Bus'}
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={center}
        zoom={activeMarkerPos ? 14 : 12}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFollowController center={activeMarkerPos || center} followBus={followBus} />

        {/* Smooth Moving Bus Marker */}
        {activeMarkerPos && (
          <Marker position={activeMarkerPos} icon={createBusIcon(statusInfo.mode)}>
            <Popup>
              <div style={{ padding: '0.35rem', minWidth: '170px' }}>
                <p style={{ fontWeight: 800, color: 'var(--primary-navy, #12345A)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {busNumber} {registrationNumber && `(${registrationNumber})`}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748B)', margin: '0.2rem 0' }}>
                  Speed: <strong>{speed} km/h</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)' }}>
                  Status: <strong style={{ color: statusInfo.color }}>{statusInfo.label}</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)' }}>
                  Last GPS Signal: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
                </p>
                {statusInfo.mode === 'offline' && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--warning, #F59E0B)', fontWeight: 600, marginTop: '0.35rem' }}>
                    Warning: GPS updates have paused. Displaying last verified coordinates.
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Stops */}
        {Array.isArray(routeStops) &&
          routeStops.map((stop, idx) => {
            const sLat = Number(stop.latitude);
            const sLng = Number(stop.longitude);
            if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) return null;

            const isNextStop = Boolean(
              nextStop &&
                ((nextStop._id && stop._id && nextStop._id.toString() === stop._id.toString()) ||
                  (typeof nextStop.name === 'string' &&
                    typeof stop.name === 'string' &&
                    nextStop.name.trim().toLowerCase() === stop.name.trim().toLowerCase()))
            );

            return (
              <Marker
                key={stop._id || idx}
                position={[sLat, sLng]}
                icon={isNextStop ? createNextStopIcon(idx) : createStopIcon(idx)}
              >
                <Popup>
                  <div style={{ padding: '0.25rem', minWidth: '160px' }}>
                    <p style={{ fontWeight: 700, color: 'var(--primary-navy, #12345A)', fontSize: '0.85rem' }}>
                      Stop {idx + 1}: {stop.name || 'Bus Stop'} {isNextStop && '(Next Target Stop)'}
                    </p>
                    {isNextStop && predictedEtaMinutes !== null && predictedEtaMinutes !== undefined && (
                      <p style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 800, margin: '0.2rem 0' }}>
                        Predicted ETA: ~{predictedEtaMinutes} min
                      </p>
                    )}
                    {stop.scheduledTime && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748B)', margin: '0.1rem 0' }}>
                        Scheduled: <strong>{stop.scheduledTime}</strong>
                      </p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94A3B8)' }}>
                      Coords: {sLat.toFixed(4)}, {sLng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Route Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: 'var(--secondary-blue, #2678C8)', weight: 4, dashArray: '6, 8', opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {!activeMarkerPos && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 400,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full, 9999px)',
            boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary, #64748B)',
            fontSize: '0.85rem',
            border: '1px solid var(--border-color, #E2E8F0)',
          }}
        >
          <AlertCircle size={16} color="var(--warning, #F59E0B)" />
          <span>Live GPS broadcast from driver currently awaiting signal.</span>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
