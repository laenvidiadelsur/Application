import { useState, useEffect } from 'react';
import axios from '../../../config/axios';

export const useEnvios = () => {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnvios = async () => {
    try {
      console.log('Fetching envíos del proveedor...');
      setLoading(true);
      
      const response = await axios.get('/envios/proveedor');
      console.log('Envíos response:', response.data);
      setEnvios(response.data);
      setError(null);
    } catch (err) {
      console.error('Error details:', err.response || err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (err.response.status === 403) {
          setError('No tiene permisos para acceder a esta información.');
        } else {
          setError(err.response.data?.message || 'Error al cargar los envíos');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError(err.message || 'Error al cargar los envíos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEnvios hook mounted');
    fetchEnvios();
  }, []);

  const handleUpdateEstado = async (id, estado) => {
    try {
      console.log('Updating estado envío:', id, estado);
      const response = await axios.put(`/envios/${id}/estado`, { estado });
      console.log('Update estado response:', response.data);
      setEnvios(prev => prev.map(e => e._id === id ? response.data : e));
      return response.data;
    } catch (err) {
      console.error('Error updating envío estado:', err.response || err);
      throw err;
    }
  };

  return {
    envios,
    loading,
    error,
    handleUpdateEstado,
    refreshEnvios: fetchEnvios
  };
}; 