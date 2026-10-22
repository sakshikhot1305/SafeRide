import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';

const QRCodeDisplay = ({ value, studentName, studentId, size = 180 }) => {
  if (!value) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
        <QrCode size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '0.85rem' }}>No QR code data available</p>
      </div>
    );
  }

  const handleDownload = () => {
    const svg = document.getElementById(`qr-code-${studentId || 'student'}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 60;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      ctx.fillStyle = '#12345A';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${studentName || 'Student'} (${studentId || ''})`, canvas.width / 2, canvas.height - 15);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `SafeRide_QR_${studentId || 'student'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        maxWidth: '260px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          padding: '0.75rem',
          background: 'var(--warm-cream)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--warm-cream-border)',
        }}
      >
        <QRCodeSVG
          id={`qr-code-${studentId || 'student'}`}
          value={String(value)}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
          {studentName || 'Student QR Pass'}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{studentId || value}</span>
        </p>
      </div>

      <button
        onClick={handleDownload}
        className="btn btn-outline btn-sm"
        style={{ marginTop: '0.85rem', width: '100%', gap: '0.4rem' }}
        title="Download QR code image"
      >
        <Download size={14} /> Download QR
      </button>
    </div>
  );
};

export default QRCodeDisplay;
