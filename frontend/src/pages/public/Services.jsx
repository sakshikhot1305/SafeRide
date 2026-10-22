import React from 'react';
import {
  Users,
  Bus,
  QrCode,
  Navigation,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const serviceList = [
    {
      id: 'student-mgmt',
      icon: Users,
      title: 'Student Identity & Enrollment Management',
      color: 'var(--primary-navy)',
      bg: '#F1F5F9',
      description:
        'Enables schools to maintain centralized student directories with roll numbers, designated classes, parents, assigned buses, and automated unique QR codes.',
      features: [
        'Secure parent-child account linking',
        'Automatic unique QR pass generation with PNG download',
        'Bus and route allocation enforcement',
        'Search and division-wise roster filtering',
      ],
    },
    {
      id: 'fleet-mgmt',
      icon: Bus,
      title: 'Bus Fleet & Route Logistics',
      color: 'var(--secondary-blue)',
      bg: 'var(--sky-blue-light)',
      description:
        'Streamline vehicle allocations, route itineraries, and stop sequences. Helps transport coordinators balance seating capacity and monitor vehicle availability.',
      features: [
        'Bus registration and capacity constraint monitoring',
        'Driver assignment and licensing validation',
        'Multi-stop geographic waypoint coordination',
        'Interactive route path planning',
      ],
    },
    {
      id: 'qr-attendance',
      icon: QrCode,
      title: 'Contactless QR Boarding & Drop-off Attendance',
      color: 'var(--success)',
      bg: '#DCFCE7',
      description:
        'Driver smartphone terminals double as high-speed attendance readers. Dual-action modes record entry (BOARD) and exit (DROP) with timestamps.',
      features: [
        'Camera-based instant QR recognition with html5-qrcode',
        'Validation ensuring student is authorized on that specific bus',
        'Duplicate scan prevention and safety locks',
        'Manual ID search fallback for lost/damaged physical passes',
      ],
    },
    {
      id: 'gps-tracking',
      icon: Navigation,
      title: 'Real-Time Bus Location Tracking',
      color: 'var(--sky-blue)',
      bg: '#E0F2FE',
      description:
        'Driver smartphones stream geographic coordinates to the SafeRide cloud. Parents and admins view the bus position live on interactive OpenStreetMaps.',
      features: [
        'Precision HTML5 Geolocation API with watchPosition',
        'Speed monitoring and route progression tracking',
        'Stale-connection indicators when signal drops',
        'Leaflet vector maps with designated pickup markers',
      ],
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Automated Parent Security Notifications',
      color: 'var(--warning)',
      bg: 'var(--warm-cream)',
      description:
        'Immediate reassurance delivered directly to parents. The moment a child steps onto or off the school bus, the parent portal logs an urgent alert.',
      features: [
        'Automatic dispatch triggered by driver QR attendance scans',
        'Clear timestamps and boarding/drop-off status distinction',
        'Mark as read tracking with unread notification badge',
        'Child-specific filtering for multi-child families',
      ],
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Administrative Intelligence & Analytics',
      color: 'var(--primary-navy)',
      bg: '#F8FAFC',
      description:
        'Data-driven insights to evaluate transport efficiency. High-level KPI dashboards present daily boarding counts, vehicle load, and 7-day attendance trends.',
      features: [
        'Interactive Recharts trend graphs for daily attendance',
        'Fleet capacity utilization percentages',
        'Active vs. inactive fleet status overviews',
        'Instant overview of daily boarded vs. dropped off students',
      ],
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', paddingBottom: '5rem' }}>
      {/* Services Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #12345A 0%, #2678C8 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--sky-blue)',
              marginBottom: '0.75rem',
              display: 'inline-block',
            }}
          >
            End-To-End Transport Capabilities
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Comprehensive School Safety Services
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#D4E4F7', lineHeight: 1.6 }}>
            SafeRide delivers a multi-faceted software suite addressing transport planning,
            live operations, emergency parent alerts, and institutional analytics.
          </p>
        </div>
      </section>

      {/* Services List */}
      <div style={{ maxWidth: '1240px', margin: '3.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {serviceList.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: svc.bg,
                      color: svc.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', lineHeight: 1.3 }}>
                    {svc.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {svc.description}
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {svc.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="card"
          style={{
            marginTop: '3.5rem',
            background: 'var(--warm-cream)',
            border: '1px solid var(--warm-cream-border)',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
            Experience the SafeRide Difference
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            Sign in with demo credentials or contact the school administrative department for access.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary">
              Log In to Dashboard
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
