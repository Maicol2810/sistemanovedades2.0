import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FileText, Heart, Stethoscope, Users, TrendingUp, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalNovedades: number;
  totalIncapacidades: number;
  totalEnfermeria: number;
  totalUsuarios: number;
}

const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalNovedades: 0,
    totalIncapacidades: 0,
    totalEnfermeria: 0,
    totalUsuarios: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [novedadesRes, incapacidadesRes, enfermeriaRes, usuariosRes] = await Promise.all([
        hasPermission('novedades', 'read') ? supabase.from('novedades').select('id', { count: 'exact' }) : { count: 0 },
        hasPermission('incapacidades', 'read') ? supabase.from('incapacidades').select('id', { count: 'exact' }) : { count: 0 },
        hasPermission('enfermeria', 'read') ? supabase.from('enfermeria').select('id', { count: 'exact' }) : { count: 0 },
        user?.role === 'Admin' ? supabase.from('users').select('id', { count: 'exact' }) : { count: 0 }
      ]);

      setStats({
        totalNovedades: novedadesRes.count || 0,
        totalIncapacidades: incapacidadesRes.count || 0,
        totalEnfermeria: enfermeriaRes.count || 0,
        totalUsuarios: usuariosRes.count || 0
      });

      // Prepare chart data
      setChartData({
        labels: ['Novedades', 'Incapacidades', 'Enfermería'],
        datasets: [
          {
            label: 'Registros',
            data: [
              novedadesRes.count || 0,
              incapacidadesRes.count || 0,
              enfermeriaRes.count || 0
            ],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 101, 101, 0.8)',
              'rgba(248, 113, 113, 0.8)'
            ],
            borderColor: [
              'rgb(239, 68, 68)',
              'rgb(245, 101, 101)',
              'rgb(248, 113, 113)'
            ],
            borderWidth: 1
          }
        ]
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Novedades',
      value: stats.totalNovedades,
      icon: FileText,
      color: 'bg-red-500',
      show: hasPermission('novedades', 'read')
    },
    {
      title: 'Total Incapacidades',
      value: stats.totalIncapacidades,
      icon: Heart,
      color: 'bg-red-600',
      show: hasPermission('incapacidades', 'read')
    },
    {
      title: 'Total Enfermería',
      value: stats.totalEnfermeria,
      icon: Stethoscope,
      color: 'bg-red-700',
      show: hasPermission('enfermeria', 'read')
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'bg-red-800',
      show: user?.role === 'Admin'
    }
  ].filter(card => card.show);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.email} - {user?.role}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="h-5 w-5" />
            <span>{new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Activo</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen de Registros
            </h3>
            <div className="h-64">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribución por Módulo
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Sistema iniciado correctamente
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {new Date().toLocaleTimeString('es-ES')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;