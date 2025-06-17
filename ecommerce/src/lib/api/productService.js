import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

/**
 * Servicio para gestionar las operaciones de API relacionadas con productos
 */
const productService = {
  /**
   * Obtiene todos los productos con filtros opcionales
   * @param {Object} filters - Filtros para la consulta (categoria, proveedor, estado)
   * @returns {Promise<Array>} Lista de productos
   */
  getAllProducts: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      // Construir parámetros de consulta
      const params = {};
      if (filters.category) params.categoria = filters.category;
      if (filters.proveedor) params.proveedor = filters.proveedor;
      if (filters.status) params.estado = filters.status;

      console.log('Enviando filtros:', params);

      const response = await axios.get(`${API_URL}/productos/todos`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  /**
   * Obtiene productos específicos de un proveedor
   * @param {string} proveedorId - ID del proveedor
   * @param {Object} filters - Filtros adicionales (categoria, estado)
   * @returns {Promise<Array>} Lista de productos del proveedor
   */
  getProductsByProvider: async (proveedorId, filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      const params = {
        proveedor: proveedorId,
        ...filters
      };

      console.log('Obteniendo productos del proveedor:', proveedorId, 'con filtros:', params);

      const response = await axios.get(`${API_URL}/productos/todos`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos del proveedor ${proveedorId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene un producto por su ID
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getProductById: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/productos/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo producto
   * @param {Object} productData - Datos del nuevo producto
   * @returns {Promise<Object>} Producto creado
   */
  createProduct: async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/productos`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  /**
   * Actualiza un producto existente
   * @param {string} productId - ID del producto a actualizar
   * @param {Object} productData - Datos actualizados del producto
   * @returns {Promise<Object>} Producto actualizado
   */
  updateProduct: async (productId, productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/productos/${productId}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un producto
   * @param {string} productId - ID del producto a eliminar
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  deleteProduct: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/productos/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${productId}:`, error);
      throw error;
    }
  }
};

export default productService;