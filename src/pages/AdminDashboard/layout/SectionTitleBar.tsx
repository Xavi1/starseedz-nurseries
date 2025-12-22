import React from 'react';

interface SectionTitleBarProps {
  title: string;
  children?: React.ReactNode;
}

const SectionTitleBar: React.FC<SectionTitleBarProps> = ({ title, children }) => (
  <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {children && <div className="mt-3 sm:mt-0 sm:ml-4">{children}</div>}
  </div>
);

export default SectionTitleBar;
