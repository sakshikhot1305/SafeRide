import React from 'react';
import { ShieldCheck, Target, Users, Bus, QrCode, Smartphone, Bell, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'var(--primary-navy)',
          color: '#FFFFFF',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              color: 'var(--sky-blue)',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={16} /> MCA Major Project Overview
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            About SafeRide
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#B2C7DF', lineHeight: 1.6 }}>
            SafeRide is an intelligent school bus management and student safety platform
            developed to solve critical child transit monitoring challenges using modern full-stack web technologies.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1100px', margin: '3rem auto 0', padding: '0 1.5rem' }}>
        {/* Mission & Background Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Target size={28} color="var(--secondary-blue)" />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Project Mission & Core Objectives
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.975rem', marginBottom: '1rem' }}>
            School bus transit carries millions of young children daily. Yet many institutions still rely on manual paper rolls that are subject to human error, leave parents anxious about pickup/drop timings, and provide school transport managers with zero real-time visibility into vehicle locations.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.975rem' }}>
            SafeRide eliminates these vulnerabilities through a secure MERN (MongoDB, Express, React, Node.js) system. By combining rapid QR student identification with browser-based Geolocation GPS streaming and real-time parent notifications, SafeRide builds a circle of safety around every child's school journey.
          </p>
        </div>

        {/* The 3 Core Roles Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Engineered for Three Collaborative Roles
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Each interface is tailored to the exact environment and responsibilities of its user.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Admin Role Card */}
            <div className="card" style={{ borderTop: '4px solid var(--primary-navy)', padding: '2rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-main)',
                  color: 'var(--primary-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                1. School Administrator
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Complete governance of the transport ecosystem:
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Register & manage student profiles and print QR passes</li>
                <li>Assign buses and licensed drivers</li>
                <li>Design routes and map coordinates</li>
                <li>Audit full attendance logs and fleet analytics</li>
              </ul>
            </div>

            {/* Driver Role Card */}
            <div className="card" style={{ borderTop: '4px solid var(--secondary-blue)', padding: '2rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--sky-blue-light)',
                  color: 'var(--secondary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Smartphone size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                2. Bus Driver
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Mobile-first terminal with minimal distraction:
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Instant QR scan for Boarding and Drop-off</li>
                <li>Validation ensuring only assigned students board</li>
                <li>Single-tap GPS location broadcasting</li>
                <li>Offline/manual student-ID entry fallback</li>
              </ul>
            </div>

            {/* Parent Role Card */}
            <div className="card" style={{ borderTop: '4px solid var(--warning)', padding: '2rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warm-cream)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <HeartHandshake size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                3. Parent / Guardian
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Complete peace of mind and live transparency:
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Live Leaflet map showing vehicle position</li>
                <li>Instant alerts when child enters/exits bus</li>
                <li>View student's designated route & stops</li>
                <li>Complete historical boarding logs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack Highlights */}
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
            Architecture & Technologies
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            {['React (Vite)', 'React Router v6', 'Node.js & Express', 'MongoDB Atlas', 'JWT Auth', 'Recharts', 'Leaflet OpenStreetMap', 'HTML5-QRCode', 'Axios'].map((tech) => (
              <span key={tech} className="badge badge-neutral" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                {tech}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '1.75rem' }}>
            <Link to="/login" className="btn btn-primary">
              Log In to SafeRide Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
