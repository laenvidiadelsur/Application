import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const API_URL = '/api';

export const useDashboard = () => {
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

  return {
    stats,
    activities,
    loading,
    error,
    snackbar,
    handleLogout,
    handleDeleteActivity,
    showSnackbar
  };
}; 