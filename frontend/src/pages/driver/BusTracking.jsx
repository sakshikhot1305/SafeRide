import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Radio,
  Clock,
  Gauge,
  AlertCircle,
  CheckCircle2,
  Bus,
  Shield,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LeafletMap from '../../components/maps/LeafletMap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import driverService from '../../services/driverService';
import trackingService from '../../services/trackingService';
import { useToast } from '../../context/ToastContext';

const BusTracking = () => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [currentCoords, setCurrentCoords] = useState(null); // { latitude, longitude, speed, timestamp, accuracy }
  const [lastServerUpdate, setLastServerUpdate] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [updateCount, setUpdateCount] = useState(0);

  const watchIdRef = useRef(null);
  const lastSentTimeRef = useRef(0);
  const isTripStartRef = useRef(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await driverService.getMyDriverProfile();
        setDriver(res.driver);
      } catch (err) {
        console.error('Error fetching driver profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Check permission status if API supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state);
          result.onchange = () => setPermissionStatus(result.state);
        })
        .catch(() => {});
    }

    return () => {
      // Cleanup on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const sendLocationToServer = async (lat, lng, spd) => {
    try {
      const isStart = isTripStartRef.current;
      await trackingService.updateLocation({
        latitude: lat,
        longitude: lng,
        speed: spd || 0,
        isTripStart: isStart,
      });
      isTripStartRef.current = false;
      setLastServerUpdate(new Date());
      setUpdateCount((c) => c + 1);
      setErrorMsg('');
    } catch (err) {
      console.error('Failed to sync location with server:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to transmit coordinates to SafeRide server.'
      );
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser or smartphone device.');
      return;
    }

    if (!driver?.busId) {
      setErrorMsg('No school bus is assigned to your driver account. Contact administration.');
      return;
    }

    setErrorMsg('');
    setIsSharing(true);
    isTripStartRef.current = true;
    lastSentTimeRef.current = 0;
    addToast('Starting GPS broadcast & notifying parents...', 'info');

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    };

    const successCallback = (position) => {
      setPermissionStatus('granted');
      const { latitude, longitude, speed, accuracy } = position.coords;
      const speedKmh = speed ? Math.round(speed * 3.6) : 0;

      setCurrentCoords({
        latitude,
        longitude,
        speed: speedKmh,
        accuracy: Math.round(accuracy),
        timestamp: new Date(position.timestamp),
      });

      // Throttle network uploads: send coordinates every 5 seconds to avoid flooding
      const now = Date.now();
      if (now - lastSentTimeRef.current >= 5000) {
        lastSentTimeRef.current = now;
        sendLocationToServer(latitude, longitude, speedKmh);
      }
    };

    const errorCallback = (err) => {
      console.warn('Geolocation error:', err);
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionStatus('denied');
        setErrorMsg('Location permission was denied. Please allow location access in your browser settings.');
        stopSharing();
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setErrorMsg('GPS location is currently unavailable. Ensure phone GPS is switched on.');
      } else if (err.code === err.TIMEOUT) {
        setErrorMsg('Location request timed out. Retrying...');
      }
    };

    const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    watchIdRef.current = id;
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
    addToast('GPS location broadcast stopped', 'info');
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Live Bus GPS Tracking" subtitle="Checking vehicle allocation..." />
        <div className="dashboard-content">
          <LoadingSpinner text="Connecting tracking terminal..." />
        </div>
      </>
    );
  }

  const bus = driver?.busId;

  return (
    <>
      <DashboardHeader
        title="Driver Bus Location Broadcast"
        subtitle="Share real-time GPS telemetry with parents and school transport managers"
      />

      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Navigation back */}
        <div style={{ marginBottom: '1rem' }}>
          <Link
            to="/driver"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-blue)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Return to Driver Overview
          </Link>
        </div>

        {/* Vehicle Assignment Card */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--sky-blue-light)',
                  color: 'var(--secondary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bus size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {bus ? bus.busNumber : 'No Bus Assigned'}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Registration: <strong>{bus?.registrationNumber || 'N/A'}</strong>
                </p>
              </div>
            </div>

            {/* Broadcast Toggle Button */}
            {isSharing ? (
              <button
                onClick={stopSharing}
                className="btn btn-danger btn-lg"
                style={{ gap: '0.5rem' }}
              >
                <Radio size={20} className="spin-animation" /> Stop Sharing Location
              </button>
            ) : (
              <button
                onClick={startSharing}
                disabled={!bus}
                className="btn btn-success btn-lg"
                style={{ gap: '0.5rem' }}
              >
                <Navigation size={20} /> Start Sharing Location
              </button>
            )}
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--error-border)',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Telemetry Indicator Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              BROADCAST STATUS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isSharing ? 'var(--success)' : 'var(--text-muted)',
                }}
              />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: isSharing ? 'var(--success)' : 'var(--text-secondary)' }}>
                {isSharing ? 'Live Broadcasting' : 'GPS Inactive'}
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ESTIMATED SPEED
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <Gauge size={18} color="var(--secondary-blue)" />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                {currentCoords?.speed ?? 0} km/h
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              LAST SERVER SYNC
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <Clock size={18} color="var(--primary-navy)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                {lastServerUpdate ? lastServerUpdate.toLocaleTimeString() : 'No updates yet'}
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              UPDATES TRANSMITTED
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                {updateCount} packets
              </span>
            </div>
          </div>
        </div>

        {/* Live Map Preview */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 className="card-title">Driver Position Map</h3>
            {currentCoords && (
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {currentCoords.latitude.toFixed(5)}, {currentCoords.longitude.toFixed(5)} (±{currentCoords.accuracy}m)
              </span>
            )}
          </div>

          <ErrorBoundary title="Driver Map Position" message="Reloading GPS coordinates...">
            <LeafletMap
              latitude={currentCoords?.latitude}
              longitude={currentCoords?.longitude}
              speed={currentCoords?.speed}
              lastUpdated={lastServerUpdate}
              busNumber={bus?.busNumber || 'School Bus'}
              registrationNumber={bus?.registrationNumber || ''}
              height="380px"
            />
          </ErrorBoundary>
        </div>

        {/* Operating Advice */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}
        >
          <Info size={18} color="var(--secondary-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Browser Geolocation Notice:</strong> Real-time tracking requires high-accuracy GPS permissions on your smartphone. Keep this browser tab open and active while driving so location updates continue broadcasting smoothly to parents.
          </div>
        </div>
      </div>
    </>
  );
};

export default BusTracking;
