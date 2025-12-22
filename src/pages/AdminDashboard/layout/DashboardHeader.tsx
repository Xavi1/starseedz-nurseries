import React from 'react';
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showNotificationsDropdown: boolean;
  setShowNotificationsDropdown: (open: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (open: boolean) => void;
  notifications: string[];
  currentUser: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  showNotificationsDropdown,
  setShowNotificationsDropdown,
  showProfileDropdown,
  setShowProfileDropdown,
  notifications,
  currentUser,
}) => (
  <header className="bg-white shadow-sm z-10">
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex">
          <button className="md:hidden px-4 text-gray-500 focus:outline-none" onClick={() => setSidebarOpen(true)}>
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="flex-1 flex items-center md:ml-0">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="search" name="search" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-sm" placeholder="Search" type="search" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                setShowProfileDropdown(false);
              }}
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </div>
            </button>
            {showNotificationsDropdown && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 px-4 border-b font-semibold text-gray-700">Notifications</div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-3 text-gray-500 text-sm">No new notifications.</li>
                  ) : (
                    notifications.map((notif, idx) => (
                      <li key={idx} className="px-4 py-3 hover:bg-gray-100 text-sm border-b last:border-b-0">
                        {notif}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          {/* Profile dropdown */}
          <div className="ml-3 relative">
            <button
              className="flex items-center focus:outline-none"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationsDropdown(false);
              }}
            >
              <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center text-white font-medium">
                {currentUser && (typeof currentUser === 'object') && ('displayName' in currentUser || 'email' in currentUser)
                  ? (currentUser.displayName?.[0] || currentUser.email?.[0] || 'A')
                  : 'A'}
              </div>
              <span className="hidden md:flex md:items-center ml-2">
                <span className="text-sm font-medium text-gray-700 mr-1">
                  {currentUser && (typeof currentUser === 'object') && ('displayName' in currentUser || 'email' in currentUser)
                    ? (currentUser.displayName || currentUser.email || 'Admin User')
                    : 'Admin User'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </span>
            </button>
            {showProfileDropdown && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <Link to={currentUser ? `/account` : '#'} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowProfileDropdown(false)}>
                  Profile
                </Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { setShowProfileDropdown(false); alert('Settings clicked!'); }}>Settings</button>
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setShowProfileDropdown(false); }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
