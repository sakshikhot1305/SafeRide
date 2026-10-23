import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Navigation,
  Bus,
  Clock,
  Gauge,
  RefreshCw,
  AlertTriangle,
  Radio,
  MapPin,
  ArrowLeft,
  Users,
  Sparkles,
  CheckCircle2,
  CalendarClock,
  Info,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LeafletMap from '../../components/maps/LeafletMap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import studentService from '../../services/studentService';
import trackingService from '../../services/trackingService';
import notificationService from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';

const LiveTracking = () => {
  const [searchParams] = useSearchParams();
  const initialBusId = searchParams.get('busId');

  const [children, setChildren] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(initialBusId || null);
  const [trackingData, setTrackingData] = useState(null);
  const [etaData, setEtaData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { addToast } = useToast();

  const getBusIdStr = (b) => {
    if (!b) return null;
    if (typeof b === 'string') return b;
    return b._id ? b._id.toString() : null;
  };

  // Load children to know their assigned buses
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [kidsRes, notifsRes] = await Promise.allSettled([
          studentService.getMyChildren(),
          notificationService.getParentNotifications(),
        ]);

        let kids = [];
        if (kidsRes.status === 'fulfilled') {
          kids = kidsRes.value.students || [];
          setChildren(kids);
        }

        if (notifsRes.status === 'fulfilled') {
          const notifs = notifsRes.value.notifications || [];
          setUnreadCount(notifs.filter((n) => !n.isRead).length);
        }

        if (!selectedBusId) {
          const kidWithBus = kids.find((k) => k.busId);
          if (kidWithBus && kidWithBus.busId) {
            setSelectedBusId(getBusIdStr(kidWithBus.busId));
          }
        }
      } catch (err) {
        console.error('Error fetching parent children:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Poll bus location & arrival prediction
  const fetchLocation = async (busId, isManual = false) => {
    if (!busId) return;
    if (isManual) setRefreshing(true);
    try {
      const [trackingRes, etaRes] = await Promise.allSettled([
        trackingService.getBusLocation(busId),
        trackingService.getBusETA(busId),
      ]);

      if (trackingRes.status === 'fulfilled') {
        setTrackingData(trackingRes.value.tracking);
        setErrorMsg('');
      } else {
        const err = trackingRes.reason;
        if (err.response && err.response.status === 404) {
          setErrorMsg('The driver has not started broadcasting GPS location for this bus yet today.');
          setTrackingData(null);
        } else {
          setErrorMsg(err.response?.data?.message || 'Failed to fetch live bus location.');
        }
      }

      if (etaRes.status === 'fulfilled') {
        setEtaData(etaRes.value);
      } else {
        console.warn('ETA prediction fetch notice:', etaRes.reason);
      }

      if (isManual) addToast('Live bus location and arrival predictions refreshed', 'success');
    } catch (err) {
      console.warn('Polling error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedBusId) {
      fetchLocation(selectedBusId, false);

      // Periodic polling every 6 seconds for smooth tracking updates
      const timer = setInterval(() => {
        fetchLocation(selectedBusId, false);
      }, 6000);

      return () => clearInterval(timer);
    }
  }, [selectedBusId]);

  if (loading) {
    return (
      <>
        <DashboardHeader title="Live Bus GPS Tracking" subtitle="Locating school transit..." unreadCount={unreadCount} />
        <div className="dashboard-content">
          <LoadingSpinner text="Connecting to vehicle tracking system..." />
        </div>
      </>
    );
  }

  // Get active child associated with this bus
  const activeChild = children.find(
    (c) => getBusIdStr(c.busId) === selectedBusId?.toString()
  );

  // Route stops: prefer active child stops, fallback to etaData.routeStops or etaData.route.stops
  const routeStops =
    activeChild?.routeId?.stops && Array.isArray(activeChild.routeId.stops) && activeChild.routeId.stops.length > 0
      ? activeChild.routeId.stops
      : etaData?.routeStops || etaData?.route?.stops || [];

  const busInfo = activeChild?.busId || trackingData?.busId || etaData;

  // Distinct buses among children
  const availableBuses = [];
  const seenBuses = new Set();

  children.forEach((c) => {
    const bId = getBusIdStr(c.busId);
    if (bId && !seenBuses.has(bId)) {
      seenBuses.add(bId);
      const busObj = typeof c.busId === 'object' ? c.busId : { _id: bId, busNumber: 'Assigned Bus' };
      availableBuses.push({
        ...busObj,
        _id: bId,
        childName: c.name,
      });
    }
  });

  // If a busId is selected/in URL but wasn't in children list, ensure availableBuses includes it so it renders
  if (selectedBusId && !seenBuses.has(selectedBusId)) {
    const fallbackBus = trackingData?.busId || etaData;
    availableBuses.push({
      _id: selectedBusId,
      busNumber: fallbackBus?.busNumber || 'School Bus',
      registrationNumber: fallbackBus?.registrationNumber || '',
      childName: activeChild?.name || 'Your Student',
    });
  }

  return (
    <>
      <DashboardHeader
        title="Live School Bus GPS Tracking & AI Arrival Prediction"
        subtitle="Real-time telemetry, machine learning arrival time estimation, and route delay alerts"
        unreadCount={unreadCount}
      />

      <div className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Navigation back */}
        <div style={{ marginBottom: '1rem' }}>
          <Link
            to="/parent"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-blue)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Return to Parent Overview
          </Link>
        </div>

        {availableBuses.length === 0 ? (
          <EmptyState
            icon={Bus}
            title="No Bus Assigned"
            description="Your child does not currently have an assigned bus vehicle. Contact the school transport administration."
          />
        ) : (
          <div>
            {/* Bus Selector (if parent has kids on different buses) */}
            {availableBuses.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
                {availableBuses.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => setSelectedBusId(b._id)}
                    className={`btn ${selectedBusId === b._id ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Bus {b.busNumber} ({b.childName})
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Header Bar */}
            <div
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {busInfo ? busInfo.busNumber : 'School Bus'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Registration: <strong>{busInfo?.registrationNumber || 'N/A'}</strong>
                    {activeChild && ` • Child: ${activeChild.name}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => fetchLocation(selectedBusId, true)}
                  disabled={refreshing}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
                  {refreshing ? 'Refreshing...' : 'Refresh Position & ETA'}
                </button>
              </div>
            </div>

            {/* AI Bus Arrival Time Prediction & Route Delay Panel */}
            <div
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                marginBottom: '1.25rem',
                border: etaData?.isDelayed ? '1px solid #FCA5A5' : '1px solid var(--border-color)',
                background: etaData?.isDelayed ? '#FFF7F7' : 'white',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--sky-blue-light)',
                      color: 'var(--secondary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                      AI Bus Arrival Prediction
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Machine learning travel time estimation & schedule tracking
                    </span>
                  </div>
                </div>

                {/* Prediction Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: etaData?.predictionStatus === 'Available' ? '#DCFCE7' : '#FEF3C7',
                      color: etaData?.predictionStatus === 'Available' ? '#166534' : '#92400E',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: etaData?.predictionStatus === 'Available' ? '#22C55E' : '#F59E0B',
                      }}
                    />
                    Prediction: {etaData?.predictionStatus || 'Active Physics Calculation'}
                  </span>

                  {etaData?.predictionSource && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#F1F5F9',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {etaData.predictionSource === 'RANDOM_FOREST_ML' ? 'Random Forest ML' : 'Physics Model'}
                    </span>
                  )}
                </div>
              </div>

              {/* Active Delay Alert Banner */}
              {etaData?.isDelayed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #F87171',
                    borderRadius: 'var(--radius-md)',
                    color: '#991B1B',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <AlertTriangle size={20} style={{ flexShrink: 0, color: '#DC2626' }} />
                  <div>
                    <strong>Route Delay Alert:</strong> Bus {busInfo?.busNumber} is running approximately{' '}
                    <strong>{etaData.delayMinutes} minutes</strong> behind scheduled timetable for stop &ldquo;{etaData.nextStop?.name}&rdquo;.
                  </div>
                </div>
              )}

              {/* On-Time confirmation */}
              {etaData?.scheduleStatus === 'ON_TIME' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 'var(--radius-md)',
                    color: '#166534',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Bus is operating on schedule (within {etaData.delayThresholdMinutes || 5} min threshold).</span>
                </div>
              )}

              {/* Prediction Data Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Next Stop */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Next Target Stop
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <MapPin size={18} color="var(--secondary-blue)" />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                      {etaData?.nextStop?.name || 'Awaiting Target Stop'}
                    </span>
                  </div>
                  {etaData?.distanceToNextStopKm !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                      Distance: <strong>{etaData.distanceToNextStopKm} km</strong>
                    </span>
                  )}
                </div>

                {/* Estimated Travel Time */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Estimated Arrival Time
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <Clock size={18} color="var(--primary-navy)" />
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary-blue)' }}>
                      {etaData?.predictedEtaMinutes !== null && etaData?.predictedEtaMinutes !== undefined
                        ? `~ ${etaData.predictedEtaMinutes} min`
                        : 'Calculating...'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                    Predicted travel duration
                  </span>
                </div>

                {/* Expected Arrival Clock Time */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Expected Arrival Clock Time
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <CalendarClock size={18} color="var(--success)" />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                      {etaData?.expectedArrivalTime || '--:--'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                    Scheduled: {etaData?.scheduledArrivalTime || 'No schedule set'}
                  </span>
                </div>
              </div>

              {/* Schedule Transparency Note */}
              {etaData?.scheduleStatus === 'NO_SCHEDULE_DEFINED' && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>Timetable schedule is not configured for this stop; delay detection requires scheduled arrival times.</span>
                </div>
              )}
            </div>

            {/* Notice / Warning banner if no tracking signal */}
            {errorMsg && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Interactive Leaflet Map with Highlighted Next Stop */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
              <ErrorBoundary title="Live Map Display" message="Map preview temporarily reloading coordinates.">
                <LeafletMap
                  latitude={trackingData?.latitude}
                  longitude={trackingData?.longitude}
                  speed={trackingData?.speed}
                  lastUpdated={trackingData?.lastUpdated}
                  busNumber={busInfo ? busInfo.busNumber : 'School Bus'}
                  registrationNumber={busInfo?.registrationNumber || ''}
                  routeStops={routeStops}
                  nextStop={etaData?.nextStop}
                  predictedEtaMinutes={etaData?.predictedEtaMinutes}
                  height="450px"
                />
              </ErrorBoundary>
            </div>

            {/* Telemetry Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  CURRENT VEHICLE SPEED
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <Gauge size={20} color="var(--secondary-blue)" />
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-navy)' }}>
                    {trackingData?.speed !== undefined ? `${trackingData.speed} km/h` : '0 km/h'}
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  LAST GPS FIX
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <Clock size={20} color="var(--primary-navy)" />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                    {trackingData?.lastUpdated
                      ? new Date(trackingData.lastUpdated).toLocaleTimeString()
                      : 'Awaiting signal'}
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  DRIVER ASSIGNED
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <Users size={20} color="var(--success)" />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                    {trackingData?.driverId?.name || 'Authorized Driver'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LiveTracking;
