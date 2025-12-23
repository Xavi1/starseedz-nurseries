// Extend the Window interface to include setAdminDashboardNav for AdminDashboard global nav switching
export {};
declare global {
  interface Window {
    setAdminDashboardNav?: (nav: string) => void;
  }
}
