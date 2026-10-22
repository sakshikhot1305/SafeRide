import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const AdminLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
