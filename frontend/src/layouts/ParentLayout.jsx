import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const ParentLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="parent" />
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};

export default ParentLayout;
