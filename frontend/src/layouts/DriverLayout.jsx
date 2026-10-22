import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const DriverLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="driver" />
      <div className="dashboard-main" style={{ maxWidth: '100%' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default DriverLayout;
