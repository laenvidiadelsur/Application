import { useState, useEffect } from 'react';
import axios from '../../../config/axios';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProveedores = async () => {
    try {
      console.log('Fetching proveedores...');
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/proveedores');
      console.log('Proveedores response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setProveedores(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('Error details:', err.response || err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (err.response.status === 403) {
          setError('No tiene permisos para acceder a esta información.');
        } else {
          setError(err.response.data?.message || 'Error al cargar los proveedores');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useProveedores hook mounted');
    fetchProveedores();
  }, []);

  const handleAddProveedor = async (proveedorData) => {
    try {
      console.log('Adding proveedor:', proveedorData);
      setError(null);
      
      const response = await axios.post('/proveedores', proveedorData);
      console.log('Add proveedor response:', response.data);
      
      if (response.data) {
        setProveedores(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error adding proveedor:', err.response || err);
      if (err.response) {
        setError(err.response.data?.message || 'Error al agregar el proveedor');
      } else {
        setError('Error al agregar el proveedor');
      }
      throw err;
    }
  };

  const handleUploadImagen = async (proveedorId, formData) => {
    try {
      console.log('=== UPLOADING PROVEEDOR IMAGEN ===');
      console.log('Proveedor ID:', proveedorId);
      
      const response = await axios.post(`/proveedores/${proveedorId}/imagen`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload imagen response:', response.data);
      
      setProveedores(prev => prev.map(p => 
        p._id === proveedorId ? response.data : p
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error uploading imagen:', err.response || err);
      if (err.response) {
        setError(err.response.data?.message || 'Error al subir la imagen');
      } else {
        setError('Error al subir la imagen');
      }
      throw err;
    }
  };

  const handleEditProveedor = async (id, proveedorData) => {
    try {
      console.log('Editing proveedor:', id, proveedorData);
      setError(null);
      
      const response = await axios.put(`/proveedores/${id}`, proveedorData);
      console.log('Edit proveedor response:', response.data);
      
      if (response.data) {
        setProveedores(prev => prev.map(p => p._id === id ? response.data : p));
        return response.data;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error editing proveedor:', err.response || err);
      if (err.response) {
        setError(err.response.data?.message || 'Error al editar el proveedor');
      } else {
        setError('Error al editar el proveedor');
      }
      throw err;
    }
  };

  const handleDeleteProveedor = async (id) => {
    try {
      console.log('Deleting proveedor:', id);
      setError(null);
      
      await axios.delete(`/proveedores/${id}`);
      setProveedores(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting proveedor:', err.response || err);
      if (err.response) {
        setError(err.response.data?.message || 'Error al eliminar el proveedor');
      } else {
        setError('Error al eliminar el proveedor');
      }
      throw err;
    }
  };

  return {
    proveedores,
    loading,
    error,
    handleAddProveedor,
    handleUploadImagen,
    handleEditProveedor,
    handleDeleteProveedor,
    refreshProveedores: fetchProveedores
  };
}; 