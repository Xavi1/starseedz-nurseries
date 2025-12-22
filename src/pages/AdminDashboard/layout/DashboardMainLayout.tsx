import React from 'react';

interface DashboardMainLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

const DashboardMainLayout: React.FC<DashboardMainLayoutProps> = ({ sidebar, header, children }) => (
  <div className="flex h-screen bg-gray-50">
    {sidebar}
    <div className="flex-1 flex flex-col overflow-hidden">
      {header}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardMainLayout;
