import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = async () => {
    try {
      console.log('Fetching productos...');
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(`${API_URL}/productos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
      console.log('=== ADDING PRODUCTO (DATOS SOLAMENTE) ===');
      console.log('Producto data:', productoData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Validar campos requeridos
      const requiredFields = ['nombre', 'descripcion', 'precio', 'unidad', 'stock', 'categoria', 'proveedor'];
      const missingFields = requiredFields.filter(field => {
        const value = productoData[field];
        return !value || value === '' || value.toString().trim() === '';
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Los siguientes campos son requeridos: ${missingFields.join(', ')}`);
      }

      // Crear objeto con datos limpios
      const cleanData = {
        nombre: productoData.nombre.trim(),
        descripcion: productoData.descripcion.trim(),
        precio: Number(productoData.precio),
        unidad: productoData.unidad,
        stock: Number(productoData.stock),
        categoria: productoData.categoria,
        proveedor: productoData.proveedor,
        estado: productoData.estado || 'activo'
      };

      console.log('Clean data to send:', cleanData);

      const response = await axios.post(`${API_URL}/productos`, cleanData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      console.log('=== UPLOADING IMAGEN ===');
      console.log('Producto ID:', productoId);
      console.log('Image file:', imagenFile);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      if (!imagenFile) {
        throw new Error('No se proporcionó archivo de imagen');
      }

      const formData = new FormData();
      formData.append('imagen', imagenFile);

      console.log('FormData para imagen creado');

      const response = await axios.post(`${API_URL}/productos/${productoId}/imagen`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
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

  const handleEditProducto = async (id, productoData, imagenFile = null) => {
    try {
      console.log('=== EDITING PRODUCTO ===');
      console.log('ID:', id);
      console.log('Data:', productoData);
      console.log('Image file:', imagenFile);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Si hay imagen, usar FormData; si no, usar JSON
      if (imagenFile) {
        const formData = new FormData();
        
        // Agregar todos los campos del producto al FormData
        Object.keys(productoData).forEach(key => {
          const value = productoData[key];
          if (value !== null && value !== undefined && value !== '') {
            const finalValue = (key === 'precio' || key === 'stock') ? 
              Number(value).toString() : value.toString();
            formData.append(key, finalValue);
          }
        });

        // Agregar la imagen
        formData.append('imagen', imagenFile);

        const response = await axios.put(`${API_URL}/productos/${id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Edit producto with image response:', response.data);
        setProductos(prev => prev.map(p => p._id === id ? response.data : p));
        return response.data;
      } else {
        // Solo actualizar datos, sin imagen
        const cleanData = {
          nombre: productoData.nombre.trim(),
          descripcion: productoData.descripcion.trim(),
          precio: Number(productoData.precio),
          unidad: productoData.unidad,
          stock: Number(productoData.stock),
          categoria: productoData.categoria,
          proveedor: productoData.proveedor,
          estado: productoData.estado || 'activo'
        };

        const response = await axios.put(`${API_URL}/productos/${id}`, cleanData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Edit producto response:', response.data);
        setProductos(prev => prev.map(p => p._id === id ? response.data : p));
        return response.data;
      }
    } catch (err) {
      console.error('Error editing producto:', err.response || err);
      throw err;
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      console.log('=== DELETING PRODUCTO ===', id);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      await axios.delete(`${API_URL}/productos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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