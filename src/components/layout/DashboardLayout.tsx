import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, User, FileText, Briefcase, Bell, Bookmark, 
  Package, MessageSquare, Lock, LogOut, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  danger?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/user-dashboard' },
    { name: 'My Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
    { name: 'My Resume', icon: <FileText className="w-5 h-5" />, path: '/resume' },
    { name: 'Applied Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/applied-jobs' },
    { name: 'Job Alerts', icon: <Bell className="w-5 h-5" />, path: '/job-alerts' },
    { name: 'Shortlisted Jobs', icon: <Bookmark className="w-5 h-5" />, path: '/shortlisted-jobs' },
    { name: 'CV Manager', icon: <FileText className="w-5 h-5" />, path: '/cv-manager' },
    { name: 'Packages', icon: <Package className="w-5 h-5" />, path: '/packages' },
    { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    { name: 'Change Password', icon: <Lock className="w-5 h-5" />, path: '/change-password' },
    { name: 'Logout', icon: <LogOut className="w-5 h-5" />, path: '/logout', danger: true },
    { name: 'Delete Profile', icon: <Trash2 className="w-5 h-5" />, path: '/delete-profile', danger: true },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/logout') {
      // Handle logout logic
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-xl font-bold text-gray-900">Can Hiring</h1>
            </div>
            <div className="flex flex-col flex-grow px-4">
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg',
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100',
                      item.danger ? 'text-red-600 hover:bg-red-50' : ''
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
