import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DashboardLayout;
