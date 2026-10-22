import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Bus,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import analyticsService from '../../services/analyticsService';
import attendanceService from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [analyticsData, attendanceData] = await Promise.all([
        analyticsService.getAdminAnalytics(),
        attendanceService.getAttendance(),
      ]);

      setAnalytics(analyticsData);
      if (attendanceData && attendanceData.attendance) {
        setRecentAttendance(attendanceData.attendance.slice(0, 5));
      }
      if (isManual) addToast('Dashboard data refreshed successfully', 'success');
    } catch (err) {
      console.error('Admin dashboard error:', err);
      addToast('Failed to load live analytics data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader title="System Overview" subtitle="Loading live school transport telemetry..." />
        <div className="dashboard-content">
          <LoadingSpinner size={40} text="Fetching institutional records..." />
        </div>
      </>
    );
  }

  const summary = analytics?.summary || {};
  const trendData = analytics?.attendanceTrend || [];
  const busLoadData = analytics?.studentsPerBus || [];

  return (
    <>
      <DashboardHeader
        title="Administrative Command Center"
        subtitle="Live monitoring of school buses, driver routes, and student safety"
      />

      <div className="dashboard-content">
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reporting Date: <strong>{analytics?.date || new Date().toISOString().slice(0, 10)}</strong>
            </span>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            {refreshing ? 'Syncing...' : 'Refresh Live Data'}
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Students"
            value={summary.totalStudents}
            subtext={`${summary.activeStudents || 0} active enrollment`}
            icon={Users}
            variant="navy"
          />
          <StatCard
            title="Active Buses"
            value={`${summary.activeBuses || 0} / ${summary.totalBuses || 0}`}
            subtext="Fleet vehicles deployed"
            icon={Bus}
            variant="sky"
          />
          <StatCard
            title="Registered Drivers"
            value={summary.totalDrivers}
            subtext="Transport crew"
            icon={UserCheck}
            variant="navy"
          />
          <StatCard
            title="Today's Attendance Rate"
            value={`${summary.attendancePercentage || 0}%`}
            subtext={`${summary.boardedStudents || 0} boarded • ${summary.droppedOffStudents || 0} dropped`}
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Chart 1: 7-Day Attendance Trend */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Calendar size={18} color="var(--secondary-blue)" /> 7-Day Student Attendance Trends
                </h3>
                <p className="card-subtitle">Daily count of students who boarded and dropped off</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '280px' }}>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBoarded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2678C8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2678C8" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorDropped" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.85rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="boarded"
                      name="Boarded Students"
                      stroke="#2678C8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBoarded)"
                    />
                    <Area
                      type="monotone"
                      dataKey="droppedOff"
                      name="Dropped Off"
                      stroke="#16A34A"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDropped)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No historical attendance data yet
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Students Per Bus Allocation */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <BarChart2 size={18} color="var(--primary-navy)" /> Fleet Student Distribution
                </h3>
                <p className="card-subtitle">Active student allocations per registered school bus</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '280px' }}>
              {busLoadData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={busLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="busNumber" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.85rem',
                      }}
                    />
                    <Bar
                      dataKey="studentCount"
                      name="Students Assigned"
                      fill="#12345A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No bus allocations recorded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts & Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Quick Actions Panel */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
              Administrative Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link to="/admin/students" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.85rem' }}>
                <Users size={16} color="var(--secondary-blue)" /> Enroll Student
              </Link>
              <Link to="/admin/buses" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.85rem' }}>
                <Bus size={16} color="var(--primary-navy)" /> Manage Buses
              </Link>
              <Link to="/admin/drivers" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.85rem' }}>
                <UserCheck size={16} color="var(--secondary-blue)" /> Assign Driver
              </Link>
              <Link to="/admin/routes" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.85rem' }}>
                <Calendar size={16} color="var(--success)" /> Route Waypoints
              </Link>
            </div>
          </div>

          {/* Recent Attendance Activity */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 className="card-title">Recent Attendance Activity</h3>
              <Link to="/admin/attendance" style={{ fontSize: '0.825rem', color: 'var(--secondary-blue)', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            {recentAttendance.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {recentAttendance.map((rec) => (
                  <div
                    key={rec._id}
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
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rec.studentId?.name || 'Student ID'} ({rec.studentId?.studentId || 'ID'})
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Bus: {rec.busId?.busNumber || 'N/A'} • {rec.attendanceDate}
                      </p>
                    </div>
                    <span className={`badge ${rec.status === 'Dropped Off' ? 'badge-success' : 'badge-info'}`}>
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>
                No attendance scans recorded for today yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
