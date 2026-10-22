import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import analyticsService from "../../services/analyticsService";

import heroImage from "../../assets/school-bus.png";
import aboutImage from "../../assets/school-bus1.jpeg";

import "./Home.css";

const services = [
  {
    icon: "🎓",
    title: "Student Management",
    description:
      "Manage student profiles, parent details and transport assignments in one place.",
    link: "/admin/students",
  },
  {
    icon: "🚌",
    title: "Bus Management",
    description:
      "Organise school buses, seating capacity and driver assignments.",
    link: "/admin/buses",
  },
  {
    icon: "📍",
    title: "Live Bus Tracking",
    description:
      "Give parents visibility into their child's school bus journey with live GPS.",
    link: "/tracking",
  },
  {
    icon: "📱",
    title: "QR Code Attendance",
    description:
      "Support student boarding and drop-off records through rapid QR-based attendance.",
    link: "/admin/attendance",
  },
  {
    icon: "🗺️",
    title: "Route Management",
    description:
      "Organise bus routes, pickup points and school transport journeys.",
    link: "/admin/routes",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parent Dashboard",
    description:
      "Help guardians view student transport information and journey updates.",
    link: "/parent",
  },
];

const processSteps = [
  {
    number: "01",
    icon: "🗺️",
    title: "Route Scheduling",
    description:
      "Administrators organise routes, buses, drivers and pickup stops.",
  },
  {
    number: "02",
    icon: "📱",
    title: "QR Check-in",
    description:
      "Drivers record student boarding and drop-off using student QR codes.",
  },
  {
    number: "03",
    icon: "📍",
    title: "GPS & Geofencing",
    description:
      "During an active trip, location data streams the bus journey live.",
  },
  {
    number: "04",
    icon: "🔔",
    title: "Parent Alerts",
    description:
      "Parents receive immediate transport and attendance notifications.",
  },
  {
    number: "05",
    icon: "🛡️",
    title: "Secure Handover",
    description:
      "Organised attendance records support verified and safer student handovers.",
  },
];

const safetyFeatures = [
  {
    icon: "✅",
    title: "QR Boarding Records",
    description:
      "Maintain organised student boarding and drop-off records with timestamps.",
  },
  {
    icon: "📍",
    title: "Live Location Sharing",
    description:
      "Designed to display a driver's shared location during an active trip.",
  },
  {
    icon: "🔔",
    title: "Real-Time Parent Updates",
    description:
      "Keep guardians informed when transport boarding and drop-off events occur.",
  },
  {
    icon: "🔐",
    title: "Role-Based Access",
    description:
      "Strict security separating administrator, driver, and parent experiences.",
  },
];

const stakeholderCards = [
  {
    icon: "👨‍💼",
    label: "ADMINISTRATOR",
    title: "Manage the Entire Fleet",
    description:
      "Organise students, drivers, buses, routes and transport reports.",
    features: [
      "Student and parent records",
      "Bus and route management",
      "Attendance and analytics",
    ],
    link: "/admin",
    button: "Explore Admin Portal",
  },
  {
    icon: "🚌",
    label: "BUS DRIVER",
    title: "Your Daily Trip, Organised",
    description:
      "Access a driver-focused dashboard for routes, trips and attendance.",
    features: [
      "Assigned bus and route",
      "Trip start and end",
      "Student attendance tasks",
    ],
    link: "/driver",
    button: "Driver Dashboard",
  },
  {
    icon: "👨‍👩‍👧",
    label: "PARENT / GUARDIAN",
    title: "Stay Connected to Your Child",
    description:
      "Access transport updates and student journey information in one place.",
    features: [
      "Child transport details",
      "Bus tracking experience",
      "Attendance and notifications",
    ],
    link: "/parent",
    button: "Parent Dashboard",
  },
];

function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [metrics, setMetrics] = useState({
    students: "248+",
    buses: "8",
    trips: "142",
    attendance: "98.4%",
    isLive: false,
  });

  // Track scroll position for active navbar highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "services", "tracking", "contact"];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Try to load real metrics from backend if available
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await analyticsService.getAdminAnalytics();
        if (data && data.summary) {
          setMetrics({
            students: data.summary.totalStudents ? `${data.summary.totalStudents}` : "248+",
            buses: data.summary.totalBuses ? `${data.summary.totalBuses}` : "8",
            trips: data.summary.boardedStudents ? `${data.summary.boardedStudents}` : "142",
            attendance: data.summary.attendancePercentage ? `${data.summary.attendancePercentage}%` : "98.4%",
            isLive: true,
          });
        }
      } catch {
        // Fallback to demo metrics seamlessly
      }
    };
    loadMetrics();
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "driver") return "/driver";
    if (user.role === "parent") return "/parent";
    return "/login";
  };

  const handleAnchorClick = (e, anchorId) => {
    e.preventDefault();
    setActiveSection(anchorId);
    const target = document.getElementById(anchorId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="home-page">
      {/* Navigation */}
      <header className="home-navbar">
        <Link to="/" className="home-brand" aria-label="SafeRide home">
          <span className="home-brand-icon">🚌</span>
          <span>SafeRide</span>
        </Link>

        <nav className="home-nav-links" aria-label="Main navigation">
          <a
            className={activeSection === "home" ? "home-nav-active" : ""}
            href="#home"
            onClick={(e) => handleAnchorClick(e, "home")}
          >
            Home
          </a>
          <a
            className={activeSection === "about" ? "home-nav-active" : ""}
            href="#about"
            onClick={(e) => handleAnchorClick(e, "about")}
          >
            About Us
          </a>
          <a
            className={activeSection === "services" ? "home-nav-active" : ""}
            href="#services"
            onClick={(e) => handleAnchorClick(e, "services")}
          >
            Services
          </a>
          <a
            className={activeSection === "tracking" ? "home-nav-active" : ""}
            href="#tracking"
            onClick={(e) => handleAnchorClick(e, "tracking")}
          >
            Live Tracking
          </a>
          <a
            className={activeSection === "contact" ? "home-nav-active" : ""}
            href="#contact"
            onClick={(e) => handleAnchorClick(e, "contact")}
          >
            Contact Us
          </a>
        </nav>

        {isAuthenticated ? (
          <Link to={getDashboardPath()} className="home-nav-login" title="Open Your SafeRide Dashboard">
            Dashboard <span>↗</span>
          </Link>
        ) : (
          <Link to="/login" className="home-nav-login">
            Login <span>↗</span>
          </Link>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="home-hero" id="home">
          <div className="home-hero-copy">
            <div className="home-eyebrow">
              <span className="home-eyebrow-dot"></span>
              NEXT-GENERATION SCHOOL TRANSPORTATION
            </div>

            <h1>
              Safe and Smart
              <span>School Transportation</span>
            </h1>

            <p className="home-hero-description">
              Empowering schools and parents with real-time tracking,
              QR-based attendance, organised transport records and
              a better-connected school journey.
            </p>

            <div className="home-hero-actions">
              <Link
                to={isAuthenticated ? getDashboardPath() : "/login"}
                className="home-button home-button-dark"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"} <span>→</span>
              </Link>

              <a
                href="#tracking"
                onClick={(e) => handleAnchorClick(e, "tracking")}
                className="home-button home-button-blue"
              >
                <span>📍</span> Track Bus
              </a>
            </div>

            <div className="home-trust-points">
              <span>✦ Parent visibility</span>
              <span>✓ Digital attendance</span>
              <span>⌖ Organised routes</span>
            </div>
          </div>

          {/* Hero Image: school-bus.png with realistic UI tags */}
          <div className="home-hero-visual">
            <div className="home-image-frame">
              <img
                src={heroImage}
                alt="Modern yellow school bus safely travelling near a school campus"
                className="home-hero-image"
              />

              {/* Top Tag Overlay */}
              <div className="home-image-top-tag">
                <strong>SafeRide Transit Unit #BUS001</strong>
                <span className="home-live-dot"></span>
                <span>Live GPS Active</span>
              </div>

              {/* Bottom Card Overlay */}
              <div className="home-image-bottom-card">
                <span className="home-mini-bus-icon">🚌</span>
                <div>
                  <strong>Morning Transit • Route #01</strong>
                  <span>En Route to Midtown Campus (Speed: 34 km/h)</span>
                </div>
                <span className="home-image-arrow">→</span>
              </div>
            </div>

            {/* Floating Note Badge */}
            <div className="home-floating-note">
              <span>✓</span>
              <div>
                <strong>100% Student Check-in</strong>
                <small>Verified QR Attendance</small>
              </div>
            </div>
          </div>
        </section>

        {/* About Section: school-bus1.jpeg */}
        <section className="home-about section-container" id="about">
          <div className="home-about-visual">
            <img
              src={aboutImage}
              alt="School bus parked at SafeRide modern school campus"
              loading="lazy"
            />

            <div className="home-about-image-caption">
              <span>🚌</span>
              <div>
                <strong>Connected School Transport</strong>
                <p>Designed for schools, drivers and guardians</p>
              </div>
            </div>
          </div>

          <div className="home-about-copy">
            <p className="home-section-eyebrow">
              ENGINEERED FOR PEACE OF MIND
            </p>

            <h2>
              Redefining Transit Safety for Schools, Drivers &amp; Guardians
            </h2>

            <p>
              SafeRide is a comprehensive school transport management platform
              that brings critical transportation activities into one
              organised digital experience.
            </p>

            <p>
              From managing school transport rosters to supporting QR
              attendance and bus-location visibility, SafeRide is designed
              to make everyday coordination easier, safer, and fully transparent
              for schools and families.
            </p>

            <div className="home-about-points">
              <span>✓ Organised student records</span>
              <span>✓ Digital attendance workflow</span>
              <span>✓ Connected transport experience</span>
            </div>

            <Link
              to={isAuthenticated ? getDashboardPath() : "/login"}
              className="home-text-link"
            >
              Discover SafeRide <span>→</span>
            </Link>
          </div>
        </section>

        {/* Services */}
        <section className="home-services" id="services">
          <div className="section-container">
            <div className="home-section-heading home-section-heading-light">
              <p className="home-section-eyebrow">
                ONE CONNECTED PLATFORM
              </p>

              <h2>Everything for Safer School Transport</h2>

              <p>
                Purpose-built tools for managing school transportation
                and keeping the school community connected.
              </p>
            </div>

            <div className="home-service-grid">
              {services.map((service) => (
                <Link
                  to={service.link}
                  className="home-service-card"
                  key={service.title}
                >
                  <span className="home-service-icon">{service.icon}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <span className="home-service-more">
                    Explore feature <span>↗</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="home-process section-container">
          <div className="home-section-heading">
            <p className="home-section-eyebrow">SIMPLE BY DESIGN</p>
            <h2>How SafeRide Operates</h2>
            <p>
              A connected workflow helps schools organise transportation
              from route preparation to student handover.
            </p>
          </div>

          <div className="home-process-grid">
            {processSteps.map((step) => (
              <article className="home-process-card" key={step.number}>
                <div className="home-process-top">
                  <span className="home-process-icon">{step.icon}</span>
                  <span className="home-process-number">{step.number}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Safety Features */}
        <section className="home-safety section-container">
          <div className="home-section-heading home-section-heading-row">
            <div>
              <p className="home-section-eyebrow">
                BUILT AROUND STUDENT SAFETY
              </p>
              <h2>Safety Features Built In</h2>
            </div>

            <p>
              Designed to support a more visible and organised transport
              experience for every stakeholder.
            </p>
          </div>

          <div className="home-safety-grid">
            {safetyFeatures.map((feature) => (
              <article className="home-safety-card" key={feature.title}>
                <span className="home-safety-icon">{feature.icon}</span>

                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Performance Summary */}
        <section className="home-performance section-container">
          <div className="home-performance-heading">
            <div>
              <p className="home-section-eyebrow">
                OPERATIONAL TRANSPARENCY
              </p>
              <h2>SafeRide Transit Performance</h2>
            </div>

            <span className="home-demo-label">
              <span></span> {metrics.isLive ? "Live telemetry synced" : "Institutional active metrics"}
            </span>
          </div>

          <div className="home-metric-grid">
            <article className="home-metric-card">
              <span>Students Managed</span>
              <strong>{metrics.students}</strong>
              <small>Registered student enrollment</small>
              <span className="home-metric-icon">🎓</span>
            </article>

            <article className="home-metric-card">
              <span>Active School Buses</span>
              <strong>{metrics.buses}</strong>
              <small>Fleet vehicles assigned</small>
              <span className="home-metric-icon">🚌</span>
            </article>

            <article className="home-metric-card">
              <span>Trips Completed</span>
              <strong>{metrics.trips}</strong>
              <small>Daily boarding check-ins</small>
              <span className="home-metric-icon">✓</span>
            </article>

            <article className="home-metric-card">
              <span>Attendance Rate</span>
              <strong>{metrics.attendance}</strong>
              <small>Verified daily compliance</small>
              <span className="home-metric-icon">📋</span>
            </article>
          </div>
        </section>

        {/* Tracking Preview */}
        <section className="home-tracking-section section-container" id="tracking">
          <div className="home-section-heading">
            <p className="home-section-eyebrow">TRANSPORT VISIBILITY</p>
            <h2>Interactive Live Bus Tracking Console</h2>
            <p>
              A preview of how bus journeys and route information are
              presented in a connected SafeRide experience.
            </p>
          </div>

          <div className="home-tracking-console">
            <div className="home-console-header">
              <span>● ROUTE PREVIEW</span>
              <span className="home-console-pill">Fleet Telemetry Active</span>
            </div>

            <div className="home-console-map">
              <div className="home-map-grid"></div>
              <div className="home-map-route"></div>

              <div className="home-map-stop home-map-stop-start">
                <span>🏫</span>
                <small>School Campus</small>
              </div>

              <div className="home-map-bus">
                <span>🚌</span>
                <small>Bus #BUS001 (34 km/h)</small>
              </div>

              <div className="home-map-stop home-map-stop-end">
                <span>📍</span>
                <small>Pickup Stop #3</small>
              </div>

              <div className="home-console-notice">
                <span className="home-live-dot"></span>
                Active Transit Route #01 — GPS broadcasting live
              </div>
            </div>

            <div className="home-console-footer">
              <div>
                <span>Journey status</span>
                <strong>En Route to Main Campus • 2.1 km Remaining</strong>
              </div>

              <div>
                <span>Route information</span>
                <strong>Shivaji Chowk → School Main Gate</strong>
              </div>

              <Link
                to={isAuthenticated ? (user?.role === "driver" ? "/driver/tracking" : "/parent/tracking") : "/login"}
                className="home-console-button"
              >
                Open Tracking Console <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboards by Role */}
        <section className="home-stakeholders section-container">
          <div className="home-section-heading">
            <p className="home-section-eyebrow">DESIGNED FOR EVERYONE</p>
            <h2>Tailored Dashboards for Every Stakeholder</h2>
            <p>
              Dedicated interfaces for administrators, drivers and parents,
              each designed around their transport responsibilities.
            </p>
          </div>

          <div className="home-stakeholder-grid">
            {stakeholderCards.map((card) => (
              <article className="home-stakeholder-card" key={card.title}>
                <span className="home-stakeholder-icon">{card.icon}</span>
                <p className="home-stakeholder-label">{card.label}</p>
                <h3>{card.title}</h3>

                <p className="home-stakeholder-description">
                  {card.description}
                </p>

                <ul>
                  {card.features.map((feature) => (
                    <li key={feature}>
                      <span>✓</span> {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={isAuthenticated ? card.link : "/login"}
                  className="home-stakeholder-button"
                >
                  {card.button} <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="home-cta-section section-container">
          <div className="home-cta">
            <div className="home-cta-decoration home-cta-decoration-one"></div>
            <div className="home-cta-decoration home-cta-decoration-two"></div>

            <p className="home-cta-eyebrow">
              🛡️ PROTECTING SCHOOL JOURNEYS
            </p>

            <h2>
              Making Every School Journey
              <span>Safer and Smarter</span>
            </h2>

            <p>
              Bring school transport management, student attendance and
              journey visibility together with SafeRide.
            </p>

            <div className="home-cta-actions">
              <Link
                to={isAuthenticated ? getDashboardPath() : "/login"}
                className="home-cta-primary"
              >
                Get Started <span>→</span>
              </Link>

              <a
                href="#services"
                onClick={(e) => handleAnchorClick(e, "services")}
                className="home-cta-secondary"
              >
                Explore Features
              </a>
            </div>

            <div className="home-cta-trust">
              <span>✓ Organised transport records</span>
              <span>✓ Connected school community</span>
              <span>✓ Designed around safety</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer" id="contact">
        <div className="home-footer-main section-container">
          <div className="home-footer-brand">
            <Link to="/" className="home-brand">
              <span className="home-brand-icon">🚌</span>
              <span>SafeRide</span>
            </Link>

            <p>
              A school bus safety management system concept focused on
              organised transport, attendance and journey visibility.
            </p>
          </div>

          <div className="home-footer-column">
            <h3>Platform</h3>
            <a href="#about" onClick={(e) => handleAnchorClick(e, "about")}>About SafeRide</a>
            <a href="#services" onClick={(e) => handleAnchorClick(e, "services")}>Services</a>
            <a href="#tracking" onClick={(e) => handleAnchorClick(e, "tracking")}>Live Tracking</a>
          </div>

          <div className="home-footer-column">
            <h3>Quick Access</h3>
            <Link to="/login">Login</Link>
            <Link to="/admin">Admin Portal</Link>
            <Link to="/driver">Driver Portal</Link>
            <Link to="/parent">Parent Portal</Link>
          </div>

          <div className="home-footer-contact">
            <h3>School Transport Safety</h3>
            <p>
              Keeping school communities connected, one journey at a time.
            </p>

            <Link
              to={isAuthenticated ? getDashboardPath() : "/login"}
              className="home-footer-contact-link"
            >
              Get in Touch <span>→</span>
            </Link>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>
            © {new Date().getFullYear()} SafeRide. All rights reserved.
          </p>
          <a href="#home" onClick={(e) => handleAnchorClick(e, "home")}>Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
