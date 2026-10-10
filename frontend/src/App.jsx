
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>🚌 SafeRide</h2>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-text">
          <p className="tag">SAFE • SMART • SECURE</p>
          <h1>Every Student's Journey, <span>Our Responsibility.</span></h1>
          <p>
            A smart school bus safety management system
            that helps schools and parents keep students safe.
          </p>
          <button className="primary-btn">Explore SafeRide →</button>
        </div>

        <div className="bus-card">
          <div className="bus-icon">🚌</div>
          <h3>School Bus Safety</h3>
          <p>Safe journeys start here.</p>
          <div className="status">
            <span></span> Safety comes first
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <h2>Everything for a Safer Journey</h2>
        <p className="section-subtitle">
          Simple tools to support schools, drivers and parents.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Bus Tracking</h3>
            <p>Help monitor school bus journeys and routes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍🎓</div>
            <h3>Student Safety</h3>
            <p>Keep student transport information organized.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Safety Alerts</h3>
            <p>Provide a place for important journey updates.</p>
          </div>
        </div>
      </section>

      <footer id="about">
        <h3>SafeRide</h3>
        <p>Making school transportation safer and smarter.</p>
        <small>© 2026 SafeRide. School Bus Safety Management System.</small>
      </footer>
    </div>
  );
}

export default App;
