import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalFundaciones: 0,
    totalProveedores: 0,
    totalUsuarios: 0,
    newFundaciones: 0,
    newProveedores: 0,
    newUsuarios: 0,
  });

  const [activities, setActivities] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, activitiesResponse] = await Promise.all([
          axios.get(`${API_URL}/dashboard/stats`),
          axios.get(`${API_URL}/dashboard/activities`)
        ]);

        setStats(statsResponse.data);
        const activitiesWithId = activitiesResponse.data.map((activity, index) => ({
          ...activity,
          tempId: index
        }));
        setActivities(activitiesWithId);
        setRecentActivities(activitiesWithId);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      showSnackbar('Error al cerrar sesión', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleDeleteActivity = async (activityId) => {
    if (activityId === undefined) {
      showSnackbar('No se puede eliminar la actividad: ID no válido', 'error');
      return;
    }

    try {
      setActivities(prevActivities => prevActivities.filter(activity => activity.tempId !== activityId));
      setRecentActivities(prevActivities => prevActivities.filter(activity => activity.tempId !== activityId));
      showSnackbar('Actividad eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      showSnackbar('Error al eliminar la actividad', 'error');
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {subtitle && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
              {subtitle}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-gray-900">Dashboard Administrativo</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <LogoutIcon className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            title="Fundaciones"
            value={stats.totalFundaciones}
            icon={<BusinessIcon />}
            color="blue"
            subtitle={`+${stats.newFundaciones} este mes`}
            onClick={() => navigate('/admin/fundaciones')}
          />
          <StatCard
            title="Proveedores"
            value={stats.totalProveedores}
            icon={<StoreIcon />}
            color="green"
            subtitle={`+${stats.newProveedores} nuevos`}
            onClick={() => navigate('/admin/proveedores')}
          />
          <StatCard
            title="Usuarios"
            value={stats.totalUsuarios}
            icon={<PeopleIcon />}
            color="red"
            subtitle={`+${stats.newUsuarios} registrados`}
            onClick={() => navigate('/admin/usuarios')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <nav className="space-y-2">
              {[
                { label: 'Fundaciones', icon: <BusinessIcon />, color: 'blue', path: '/admin/fundaciones' },
                { label: 'Proveedores', icon: <StoreIcon />, color: 'green', path: '/admin/proveedores' },
                { label: 'Usuarios', icon: <PeopleIcon />, color: 'red', path: '/admin/usuarios' },
                { label: 'Reportes', icon: <AssessmentIcon />, color: 'purple', path: '/admin/reportes' },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-${action.color}-50 hover:text-${action.color}-700 transition-colors duration-200`}
                >
                  <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg bg-${action.color}-100 text-${action.color}-600 mr-3`}>
                    {action.icon}
                  </span>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Actividades Recientes */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Actividades Recientes</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Ver todo
              </button>
            </div>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.tempId} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
                      <NotificationsIcon className="h-5 w-5 text-blue-600" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500">{new Date(activity.time).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.tempId)}
                    className="inline-flex items-center p-1.5 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <DeleteIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
          snackbar.severity === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="text-sm font-medium">{snackbar.message}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;