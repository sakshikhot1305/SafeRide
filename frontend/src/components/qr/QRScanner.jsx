import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard, AlertCircle, CheckCircle2, RotateCcw, ScanLine, Sparkles } from 'lucide-react';

const QRScanner = ({ onScanSuccess, action = 'BOARD', loading = false, disabled = false }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const html5QrCodeRef = useRef(null);
  const isCooldownRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    try {
      await stopScanner();

      const qrScanner = new Html5Qrcode('saferide-qr-reader');
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (isCooldownRef.current) return;
          isCooldownRef.current = true;

          setLastScanned(decodedText);
          onScanSuccess(decodedText.trim());

          setTimeout(() => {
            isCooldownRef.current = false;
          }, 2500);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera start failed:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions in your browser or use the manual ID fallback below.'
      );
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    onScanSuccess(manualId.trim());
    setManualId('');
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        maxWidth: '520px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <span
          className={`badge ${action === 'BOARD' ? 'badge-info' : 'badge-warning'}`}
          style={{ marginBottom: '0.5rem', padding: '0.35rem 0.85rem' }}
        >
          ● Active Mode: {action === 'BOARD' ? 'STUDENT BOARDING (IN)' : 'STUDENT DROP-OFF (OUT)'}
        </span>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
          {action === 'BOARD' ? 'Pickup Boarding Scanner' : 'Drop-off Exit Scanner'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Align the student's digital or printed QR pass within the viewfinder.
        </p>
      </div>

      {/* Viewfinder Box */}
      <div
        style={{
          minHeight: '300px',
          background: 'linear-gradient(180deg, #071524 0%, #0F2847 100%)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '1.25rem',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div id="saferide-qr-reader" style={{ width: '100%', height: '100%' }} />

        {/* Laser Scanning Line Animation when active */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              left: '10%',
              width: '80%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #38BDF8, #22C55E, transparent)',
              boxShadow: '0 0 15px #38BDF8',
              animation: 'scanBeam 2.5s infinite ease-in-out',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}

        {!isScanning && (
          <div style={{ padding: '2rem', color: '#CBD5E1' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Camera size={32} color="var(--sky-blue)" />
            </div>
            <p style={{ fontSize: '0.925rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              Camera is currently standby.
            </p>
            <button
              onClick={startScanner}
              disabled={loading || disabled}
              className="btn btn-secondary btn-lg"
              style={{ margin: '0 auto', gap: '0.5rem', fontWeight: 700 }}
            >
              <Camera size={20} /> Open Camera Scanner
            </button>
          </div>
        )}

        {isScanning && (
          <button
            onClick={stopScanner}
            className="btn btn-danger btn-sm"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 20,
              gap: '0.35rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <CameraOff size={14} /> Stop Camera
          </button>
        )}
      </div>

      {cameraError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '1rem',
            border: '1px solid var(--error-border)',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{cameraError}</span>
        </div>
      )}

      {lastScanned && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem',
            border: '1px solid var(--success-border)',
          }}
        >
          <CheckCircle2 size={18} /> Verified: {lastScanned}
        </div>
      )}

      {/* Manual Entry Fallback */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <button
          onClick={() => setShowManual((prev) => !prev)}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', marginBottom: showManual ? '1rem' : '0' }}
        >
          <Keyboard size={16} /> {showManual ? 'Hide Manual Entry' : 'Manual Student ID Search / Input'}
        </button>

        {showManual && (
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. STU001 or Student Name"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              disabled={loading || disabled}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || disabled || !manualId.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
