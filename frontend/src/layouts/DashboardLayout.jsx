import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

/**
 * Main dashboard container layout providing navigation alignment and responsive margins.
 */
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse width

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-darkBg flex relative">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleCollapse}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Drawer Background Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        ></div>
      )}

      {/* Main Panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        <Navbar onMenuClick={toggleMobileSidebar} />

        {/* Content body container wrapper */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
