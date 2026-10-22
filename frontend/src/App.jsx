import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';
import ParentLayout from './layouts/ParentLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Contact from './pages/public/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import DriverManagement from './pages/admin/DriverManagement';
import BusManagement from './pages/admin/BusManagement';
import RouteManagement from './pages/admin/RouteManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import AnalyticsView from './pages/admin/AnalyticsView';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import QRAttendance from './pages/driver/QRAttendance';
import BusTracking from './pages/driver/BusTracking';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import MyChild from './pages/parent/MyChild';
import AttendanceHistory from './pages/parent/AttendanceHistory';
import Notifications from './pages/parent/Notifications';
import LiveTracking from './pages/parent/LiveTracking';

// Not Found
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/tracking" element={<Navigate to="/parent/tracking" replace />} />
            <Route element={<PublicLayout />}>
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Dashboard Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="drivers" element={<DriverManagement />} />
              <Route path="buses" element={<BusManagement />} />
              <Route path="routes" element={<RouteManagement />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="analytics" element={<AnalyticsView />} />
            </Route>

            {/* Driver Dashboard Protected Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DriverDashboard />} />
              <Route path="qr-attendance" element={<QRAttendance />} />
              <Route path="tracking" element={<BusTracking />} />
            </Route>

            {/* Parent Dashboard Protected Routes */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ParentDashboard />} />
              <Route path="child" element={<MyChild />} />
              <Route path="attendance" element={<AttendanceHistory />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="tracking" element={<LiveTracking />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
