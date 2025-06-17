import { useState, useEffect } from 'react';
import axios from '../../../config/axios';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = async () => {
    try {
      console.log('Fetching productos del proveedor...');
      setLoading(true);
      
      const response = await axios.get('/productos/proveedor');
      console.log('Productos response:', response.data);
      setProductos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error details:', err.response || err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (err.response.status === 403) {
          setError('No tiene permisos para acceder a esta información.');
        } else {
          setError(err.response.data?.message || 'Error al cargar los productos');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError(err.message || 'Error al cargar los productos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useProductos hook mounted');
    fetchProductos();
  }, []);

  // Función para crear solo los datos del producto (sin imagen)
  const handleAddProducto = async (productoData) => {
    try {
      console.log('Adding producto:', productoData);
      const response = await axios.post('/productos', {
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        precio: productoData.precio,
        unidad: productoData.unidad,
        stock: productoData.stock,
        categoria: productoData.categoria
      });
      console.log('Add producto response:', response.data);
      
      // Agregar el producto a la lista local
      setProductos(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error adding producto:', err.response || err);
      throw err;
    }
  };

  // Función separada para subir imagen
  const handleUploadImagen = async (productoId, imagenFile) => {
    try {
      console.log('Uploading imagen for producto:', productoId);
      const formData = new FormData();
      formData.append('imagen', imagenFile);

      const response = await axios.post(`/productos/${productoId}/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Upload imagen response:', response.data);
      
      // Actualizar el producto en la lista local con las nuevas imágenes
      setProductos(prev => prev.map(p => 
        p._id === productoId ? response.data : p
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error uploading imagen:', err.response || err);
      throw err;
    }
  };

  const handleEditProducto = async (id, productoData) => {
    try {
      console.log('Editing producto:', id, productoData);
      const response = await axios.put(`/productos/${id}`, productoData);
      console.log('Edit producto response:', response.data);
      setProductos(prev => prev.map(p => p._id === id ? response.data : p));
      return response.data;
    } catch (err) {
      console.error('Error editing producto:', err.response || err);
      throw err;
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      console.log('Deleting producto:', id);
      await axios.delete(`/productos/${id}`);
      setProductos(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting producto:', err.response || err);
      throw err;
    }
  };

  return {
    productos,
    loading,
    error,
    handleAddProducto,
    handleUploadImagen, // Nueva función separada para subir imágenes
    handleEditProducto,
    handleDeleteProducto,
    refreshProductos: fetchProductos
  };
};