import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Heart,
  Stethoscope,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      module: 'dashboard'
    },
    {
      name: 'Novedades',
      path: '/novedades',
      icon: FileText,
      module: 'novedades'
    },
    {
      name: 'Incapacidades',
      path: '/incapacidades',
      icon: Heart,
      module: 'incapacidades'
    },
    {
      name: 'Enfermería',
      path: '/enfermeria',
      icon: Stethoscope,
      module: 'enfermeria'
    },
    {
      name: 'Accidentes de Trabajo',
      path: '/accidentes-trabajo',
      icon: AlertTriangle,
      module: 'accidentes_trabajo'
    }
  ];

  const adminMenuItems = [
    {
      name: 'Usuarios',
      path: '/usuarios',
      icon: Users,
      module: 'usuarios'
    },
    {
      name: 'Configuración',
      path: '/configuracion',
      icon: Settings,
      module: 'configuracion'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.module, 'read')
  );

  const filteredAdminItems = user?.role === 'Admin' ? adminMenuItems : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/logopca.png" 
              alt="Logo UPCA" 
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold text-red-600">UPCA</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {filteredAdminItems.length > 0 && (
            <>
              <div className="mt-8 mb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administración
                </h3>
              </div>
              <div className="space-y-1">
                {filteredAdminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">
                Sistema de Control UPCA
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;