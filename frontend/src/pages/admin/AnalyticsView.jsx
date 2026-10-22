import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Bus,
  CheckCircle2,
  Calendar,
  PieChart as PieChartIcon,
  RefreshCw,
  Bell,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import analyticsService from '../../services/analyticsService';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#12345A', '#2678C8', '#55B4F0', '#16A34A', '#F59E0B'];

const AnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await analyticsService.getAdminAnalytics();
      setData(res);
      if (isManual) addToast('Analytics metrics updated', 'success');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      addToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader title="Analytics & Institutional Metrics" subtitle="Crunching fleet statistics..." />
        <div className="dashboard-content">
          <LoadingSpinner text="Computing attendance figures..." />
        </div>
      </>
    );
  }

  const summary = data?.summary || {};
  const trend = data?.attendanceTrend || [];
  const studentsPerBus = data?.studentsPerBus || [];

  const pieData = [
    { name: 'Boarded Students', value: summary.boardedStudents || 0 },
    {
      name: 'Remaining Pending',
      value: Math.max(0, (summary.totalStudents || 0) - (summary.boardedStudents || 0)),
    },
  ];

  return (
    <>
      <DashboardHeader
        title="Transport Intelligence & Safety Analytics"
        subtitle="Operational metrics derived directly from MongoDB attendance and vehicle records"
      />

      <div className="dashboard-content">
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Evaluation Date: <strong>{data?.date || new Date().toISOString().slice(0, 10)}</strong>
            </span>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            {refreshing ? 'Syncing...' : 'Refresh Metrics'}
          </button>
        </div>

        {/* High-level KPIs */}
        <div className="stats-grid">
          <StatCard
            title="Active Attendance Rate"
            value={`${summary.attendancePercentage || 0}%`}
            subtext="Enrolled students on board"
            icon={TrendingUp}
            variant="navy"
          />
          <StatCard
            title="Total Transit Fleet"
            value={summary.totalBuses}
            subtext={`${summary.activeBuses || 0} active buses`}
            icon={Bus}
            variant="sky"
          />
          <StatCard
            title="Total Students"
            value={summary.totalStudents}
            subtext={`${summary.activeStudents || 0} active`}
            icon={Users}
            variant="navy"
          />
          <StatCard
            title="Security Notifications"
            value={summary.totalNotifications || 0}
            subtext={`${summary.unreadNotifications || 0} unread parent alerts`}
            icon={Bell}
            variant="warning"
          />
        </div>

        {/* Charts Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Trend Line Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <TrendingUp size={18} color="var(--secondary-blue)" /> Daily Attendance Trajectory
                </h3>
                <p className="card-subtitle">Last 7 calendar days comparison</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="boarded"
                    name="Boarded"
                    stroke="#2678C8"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="droppedOff"
                    name="Dropped Off"
                    stroke="#16A34A"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bus Student Distribution Bar Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Bus size={18} color="var(--primary-navy)" /> Bus Load Allocation
                </h3>
                <p className="card-subtitle">Number of assigned students per bus</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsPerBus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="busNumber" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar
                    dataKey="studentCount"
                    name="Student Allocation"
                    fill="#12345A"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Today's Boarding Progress Breakdown */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            Today's Commute Completion Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Enrolled Students</p>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {summary.totalStudents}
              </h4>
            </div>

            <div style={{ padding: '1rem', background: 'var(--sky-blue-light)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-blue)' }}>Students Boarded Today</p>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary-blue)' }}>
                {summary.boardedStudents}
              </h4>
            </div>

            <div style={{ padding: '1rem', background: '#DCFCE7', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Students Dropped Off</p>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>
                {summary.droppedOffStudents}
              </h4>
            </div>

            <div style={{ padding: '1rem', background: 'var(--warm-cream)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>Transit Completion</p>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)' }}>
                {summary.boardedStudents > 0
                  ? Math.round((summary.droppedOffStudents / summary.boardedStudents) * 100)
                  : 0}
                %
              </h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsView;
