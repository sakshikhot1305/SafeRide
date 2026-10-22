import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  Clock,
  Bus,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import QRScanner from '../../components/qr/QRScanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import attendanceService from '../../services/attendanceService';
import driverService from '../../services/driverService';
import { useToast } from '../../context/ToastContext';

const QRAttendance = () => {
  const [action, setAction] = useState('BOARD'); // 'BOARD' or 'DROP'
  const [students, setStudents] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanProcessing, setScanProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success: bool, message: string, student: obj }

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        driverService.getMyBusStudents(),
        attendanceService.getMyBusAttendance(),
      ]);
      setStudents(studentsRes.students || []);
      setRecentScans(attendanceRes.attendance || []);
    } catch (err) {
      console.error('Error fetching driver attendance info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScanSuccess = async (rawIdentifier) => {
    if (scanProcessing) return;
    setScanProcessing(true);
    setScanResult(null);

    try {
      // Resolve student identifier (handles both MongoDB _id and formatted studentId like "STU001")
      let targetMongoId = rawIdentifier;
      const matchedStudent = students.find(
        (s) =>
          s._id.toString() === rawIdentifier.trim() ||
          s.studentId.toLowerCase() === rawIdentifier.trim().toLowerCase()
      );

      if (matchedStudent) {
        targetMongoId = matchedStudent._id;
      }

      const res = await attendanceService.scanStudentQR({
        studentId: targetMongoId,
        action,
      });

      const message = res.message || 'Attendance recorded successfully!';
      setScanResult({
        success: true,
        message,
        studentName: matchedStudent ? matchedStudent.name : 'Student',
        studentId: matchedStudent ? matchedStudent.studentId : rawIdentifier,
        action,
        timestamp: new Date().toLocaleTimeString(),
      });

      addToast(message, 'success');
      // Refresh recent scans list
      loadData();
    } catch (err) {
      console.error('Scan submission error:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to record attendance.';
      setScanResult({
        success: false,
        message: errorMsg,
        identifier: rawIdentifier,
      });
      addToast(errorMsg, 'error');
    } finally {
      setScanProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="QR Attendance Scanner" subtitle="Loading bus student records..." />
        <div className="dashboard-content">
          <LoadingSpinner text="Initializing terminal..." />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        title="Driver QR Attendance Terminal"
        subtitle="Record student boarding and drop-off with smartphone camera"
      />

      <div className="dashboard-content" style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Navigation Link back */}
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

        {/* Action Toggle Selector */}
        <div
          className="card"
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              SELECT SCANNING MODE:
            </span>
            <span className={`badge ${action === 'BOARD' ? 'badge-info' : 'badge-warning'}`}>
              Mode: {action}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setAction('BOARD');
                setScanResult(null);
              }}
              className={`btn ${action === 'BOARD' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                padding: '0.85rem',
                fontSize: '1rem',
                backgroundColor: action === 'BOARD' ? 'var(--primary-navy)' : 'transparent',
              }}
            >
              1. BOARD (Morning Pickup)
            </button>

            <button
              type="button"
              onClick={() => {
                setAction('DROP');
                setScanResult(null);
              }}
              className={`btn ${action === 'DROP' ? 'btn-secondary' : 'btn-outline'}`}
              style={{
                padding: '0.85rem',
                fontSize: '1rem',
                backgroundColor: action === 'DROP' ? 'var(--secondary-blue)' : 'transparent',
              }}
            >
              2. DROP (Destination Exit)
            </button>
          </div>
        </div>

        {/* Feedback Alert for Last Scan Result */}
        {scanResult && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: `1px solid ${scanResult.success ? 'var(--success-border)' : 'var(--error-border)'}`,
              backgroundColor: scanResult.success ? 'var(--success-bg)' : 'var(--error-bg)',
              color: scanResult.success ? 'var(--success)' : 'var(--error)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            {scanResult.success ? (
              <CheckCircle2 size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {scanResult.success ? 'Attendance Recorded Successfully!' : 'Scan Validation Error'}
              </h4>
              <p style={{ fontSize: '0.85rem' }}>{scanResult.message}</p>
              {scanResult.success && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Student: {scanResult.studentName} ({scanResult.studentId}) • {scanResult.action} at {scanResult.timestamp}
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Scanner Component */}
        <QRScanner
          action={action}
          onScanSuccess={handleScanSuccess}
          loading={scanProcessing}
        />

        {/* Quick Students Selection / Roster */}
        <div className="card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">
              <Users size={18} /> Bus Student Roster ({students.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click student for instant manual scan
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {students.map((stu) => (
              <div
                key={stu._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {stu.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    ID: {stu.studentId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleScanSuccess(stu._id)}
                  disabled={scanProcessing}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  Record {action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Scans List */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">
              <Clock size={18} /> Today's Attendance Scans ({recentScans.length})
            </h3>
            <button
              onClick={loadData}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.25rem 0.5rem', gap: '0.3rem' }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {recentScans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentScans.map((record) => (
                <div
                  key={record._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {record.studentId?.name || 'Student'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      ({record.studentId?.studentId || 'ID'})
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {record.boardingTime && `Board: ${new Date(record.boardingTime).toLocaleTimeString()}`}
                      {record.dropOffTime && ` • Drop: ${new Date(record.dropOffTime).toLocaleTimeString()}`}
                    </div>
                  </div>
                  <span className={`badge ${record.status === 'Dropped Off' ? 'badge-success' : 'badge-info'}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.75rem 0' }}>
              No scans recorded on your bus today yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default QRAttendance;
