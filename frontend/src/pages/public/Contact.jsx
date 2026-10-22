import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    // As specified in project requirements:
    // Clearly labelled frontend-only preview with direct mailto option.
    setSubmitted(true);
  };

  const mailtoLink = `mailto:support@saferide.school.edu?subject=${encodeURIComponent(
    formData.subject || 'SafeRide Inquiry'
  )}&body=${encodeURIComponent(
    `From: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`
  )}`;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', paddingBottom: '5rem' }}>
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Contact Transport & Support
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#B2C7DF', lineHeight: 1.6 }}>
            Have questions regarding student bus route allocations, emergency queries, or technical assistance? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div style={{ maxWidth: '1100px', margin: '3.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Contact Information Cards */}
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1.25rem' }}>
              Transport Administration Office
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              The central transport desk manages student bus routes, driver rosters, and emergency assistance throughout school operating hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
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
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Office Location</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    SafeRide Transport Wing, Campus Hub, Kolhapur, Maharashtra
                  </p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#DCFCE7',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Helpline Hotline</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>+91 98765 43210 (6:30 AM - 6:30 PM)</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--warm-cream)',
                    color: 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Email Correspondence</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>support@saferide.school.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="card" style={{ padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
              Send an Inquiry
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-main)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.775rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              <Info size={16} color="var(--secondary-blue)" style={{ flexShrink: 0 }} />
              <span>Frontend Inquiry Form — Click below to generate direct email or view formatted inquiry.</span>
            </div>

            {submitted ? (
              <div
                style={{
                  padding: '2rem',
                  backgroundColor: 'var(--success-bg)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '1px solid var(--success-border)',
                }}
              >
                <CheckCircle2 size={44} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                  Inquiry Prepared!
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Your message has been validated. As this project uses an MCA demonstration backend without a public message storage table, you can send this inquiry directly via your email client below:
                </p>
                <a href={mailtoLink} className="btn btn-primary" style={{ gap: '0.5rem', width: '100%' }}>
                  <Mail size={16} /> Open Email Client with Prefilled Inquiry
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  Write Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--error-bg)',
                      color: 'var(--error)',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Your Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Bus Route Question / Student ID"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Message <span className="req">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                    placeholder="Describe your inquiry or request..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Send size={16} /> Format & Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
