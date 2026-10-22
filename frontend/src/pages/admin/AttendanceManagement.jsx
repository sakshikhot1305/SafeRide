import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Bus,
  Clock,
  Calendar,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import attendanceService from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { addToast } = useToast();

  const loadAttendance = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await attendanceService.getAttendance();
      setRecords(data.attendance || []);
      if (isManual) addToast('Attendance records refreshed', 'success');
    } catch (err) {
      console.error('Error fetching attendance:', err);
      addToast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Date', 'Student ID', 'Student Name', 'Bus Number', 'Status', 'Boarding Time', 'Drop-off Time'];
    const rows = filteredRecords.map((r) => [
      r.attendanceDate,
      r.studentId?.studentId || 'N/A',
      `"${r.studentId?.name || 'N/A'}"`,
      r.busId?.busNumber || 'N/A',
      r.status,
      r.boardingTime ? new Date(r.boardingTime).toLocaleTimeString() : 'N/A',
      r.dropOffTime ? new Date(r.dropOffTime).toLocaleTimeString() : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafeRide_Attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((r) => {
    const studentName = r.studentId?.name?.toLowerCase() || '';
    const studentId = r.studentId?.studentId?.toLowerCase() || '';
    const busNum = r.busId?.busNumber?.toLowerCase() || '';

    const matchesSearch =
      studentName.includes(searchTerm.toLowerCase()) ||
      studentId.includes(searchTerm.toLowerCase()) ||
      busNum.includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || r.attendanceDate === dateFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <>
      <DashboardHeader
        title="Student Attendance Logs"
        subtitle="Auditable boarding and drop-off history recorded by driver QR scans"
      />

      <div className="dashboard-content">
        {/* Controls Bar */}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <div className="input-with-icon" style={{ minWidth: '240px', flex: 1 }}>
              <Search size={18} className="input-icon-left" />
              <input
                type="text"
                className="form-control"
                placeholder="Search student, ID, or bus #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by attendance date"
            />

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="Boarded">Boarded Only</option>
              <option value="Dropped Off">Dropped Off</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => loadAttendance(true)}
              disabled={refreshing}
              className="btn btn-outline"
              style={{ gap: '0.4rem' }}
            >
              <RefreshCw size={15} className={refreshing ? 'spin-animation' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="btn btn-secondary"
              style={{ gap: '0.4rem' }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Retrieving attendance archives..." />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records found"
            description="No logs match your filter criteria. Try resetting the date or search query."
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Info</th>
                  <th>Bus Deployed</th>
                  <th>Boarding Time</th>
                  <th>Drop-off Time</th>
                  <th>Current State</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{item.attendanceDate}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.studentId?.name || 'Unknown Student'}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {item.studentId?.studentId || 'ID'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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

export default AttendanceManagement;
