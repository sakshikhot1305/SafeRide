import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Bus,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import attendanceService from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { addToast } = useToast();

  const loadHistory = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await attendanceService.getMyChildrenAttendance();
      setRecords(res.attendance || []);
      if (isManual) addToast('Attendance records refreshed', 'success');
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      addToast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = records.filter((r) => {
    const studentName = r.studentId?.name?.toLowerCase() || '';
    const studentId = r.studentId?.studentId?.toLowerCase() || '';
    const busNum = r.busId?.busNumber?.toLowerCase() || '';
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      studentId.includes(searchTerm.toLowerCase()) ||
      busNum.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <DashboardHeader
        title="Student Transit History"
        subtitle="Chronological boarding and drop-off timeline logged by school bus drivers"
      />

      <div className="dashboard-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="input-with-icon" style={{ maxWidth: '320px', flex: 1 }}>
            <Search size={18} className="input-icon-left" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by child name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => loadHistory(true)}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            {refreshing ? 'Updating...' : 'Refresh Logs'}
          </button>
        </div>

        {/* History Table */}
        {loading ? (
          <LoadingSpinner text="Retrieving student logs..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No Attendance Logs Found"
            description="Your child has not had any boarding or drop-off scans recorded yet. Logs will populate automatically when the driver scans their QR pass."
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Child Name</th>
                  <th>Bus</th>
                  <th>Boarding Time</th>
                  <th>Drop-off Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{item.attendanceDate}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {item.studentId?.name || 'Student'}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ID: {item.studentId?.studentId || 'ID'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bus size={15} color="var(--secondary-blue)" />
                        <span style={{ fontWeight: 600 }}>{item.busId?.busNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      {item.boardingTime ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Clock size={14} color="var(--secondary-blue)" />
                          <span>{new Date(item.boardingTime).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>--</span>
                      )}
                    </td>
                    <td>
                      {item.dropOffTime ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Clock size={14} color="var(--success)" />
                          <span>{new Date(item.dropOffTime).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Dropped Off' ? 'badge-success' : 'badge-info'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AttendanceHistory;
