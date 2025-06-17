// ecommerce/src/context/CarritoContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../lib/api';

const CarritoContext = createContext();

// Estados del carrito
const INITIAL_STATE = {
  items: [],
  total: 0,
  cantidadItems: 0,
  loading: false,
  error: null
};

// Acciones del carrito
const CARRITO_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CARRITO: 'SET_CARRITO',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CARRITO: 'CLEAR_CARRITO',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer del carrito
const carritoReducer = (state, action) => {
  switch (action.type) {
    case CARRITO_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case CARRITO_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case CARRITO_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case CARRITO_ACTIONS.SET_CARRITO:
      const { items = [], total = 0 } = action.payload;
      return {
        ...state,
        items,
        total,
        cantidadItems: items.reduce((sum, item) => sum + item.cantidad, 0),
        loading: false,
        error: null
      };
      
    case CARRITO_ACTIONS.ADD_ITEM:
      const newItems = [...state.items];
      const existingItem = newItems.find(item => 
        item.producto._id === action.payload.producto._id
      );
      
      if (existingItem) {
        existingItem.cantidad += action.payload.cantidad;
        existingItem.subtotal = existingItem.cantidad * existingItem.precioUnitario;
      } else {
        newItems.push(action.payload);
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newCantidad = newItems.reduce((sum, item) => sum + item.cantidad, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidad,
        error: null
      };
      
    case CARRITO_ACTIONS.UPDATE_ITEM:
      const updatedItems = state.items.map(item => {
        if (item.producto._id === action.payload.productoId) {
          return {
            ...item,
            cantidad: action.payload.cantidad,
            subtotal: action.payload.cantidad * item.precioUnitario
          };
        }
        return item;
      }).filter(item => item.cantidad > 0);
      
      const updatedTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const updatedCantidad = updatedItems.reduce((sum, item) => sum + item.cantidad, 0);
      
      return {
        ...state,
        items: updatedItems,
        total: updatedTotal,
        cantidadItems: updatedCantidad
      };
      
    case CARRITO_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => 
        item.producto._id !== action.payload
      );
      
      const filteredTotal = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
      const filteredCantidad = filteredItems.reduce((sum, item) => sum + item.cantidad, 0);
      
      return {
        ...state,
        items: filteredItems,
        total: filteredTotal,
        cantidadItems: filteredCantidad
      };
      
    case CARRITO_ACTIONS.CLEAR_CARRITO:
      return {
        ...state,
        items: [],
        total: 0,
        cantidadItems: 0
      };
      
    default:
      return state;
  }
};

// Generador de Session ID para usuarios no autenticados
const generateSessionId = () => {
  let sessionId = localStorage.getItem('carritoSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('carritoSessionId', sessionId);
  }
  return sessionId;
};

// Provider del contexto
export const CarritoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, INITIAL_STATE);

  // Headers para las peticiones
  const getHeaders = () => {
    const headers = {};
    const token = localStorage.getItem('token');
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      headers['X-Session-Id'] = generateSessionId();
    }
    
    return headers;
  };

  // Cargar carrito al inicializar
  useEffect(() => {
    cargarCarrito();
  }, []);

  // Funciones del carrito
  const cargarCarrito = async () => {
    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.get('/carrito', {
        headers: getHeaders()
      });
      
      dispatch({ 
        type: CARRITO_ACTIONS.SET_CARRITO, 
        payload: response.data 
      });
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      dispatch({ 
        type: CARRITO_ACTIONS.SET_ERROR, 
        payload: 'Error al cargar el carrito' 
      });
    }
  };

  const agregarAlCarrito = async (producto, cantidad = 1) => {
    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.post('/carrito/agregar', {
        productoId: producto.id || producto._id,
        cantidad
      }, {
        headers: getHeaders()
      });
      
      dispatch({ 
        type: CARRITO_ACTIONS.SET_CARRITO, 
        payload: response.data.carrito 
      });
      
      return { success: true, message: 'Producto agregado al carrito' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al agregar producto';
      dispatch({ 
        type: CARRITO_ACTIONS.SET_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };

  const actualizarCantidad = async (productoId, cantidad) => {
    try {
      const response = await api.put(`/carrito/actualizar/${productoId}`, {
        cantidad
      }, {
        headers: getHeaders()
      });
      
      dispatch({ 
        type: CARRITO_ACTIONS.SET_CARRITO, 
        payload: response.data.carrito 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar cantidad';
      dispatch({ 
        type: CARRITO_ACTIONS.SET_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };

  const eliminarDelCarrito = async (productoId) => {
    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.delete(`/carrito/eliminar/${productoId}`, {
        headers: getHeaders()
      });
      
      dispatch({ type: CARRITO_ACTIONS.REMOVE_ITEM, payload: productoId });
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: 'Producto eliminado del carrito' };
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: false });
      dispatch({ 
        type: CARRITO_ACTIONS.SET_ERROR, 
        payload: 'Error al eliminar el producto del carrito' 
      });
      return { success: false, message: error.response?.data?.message || 'Error al eliminar el producto' };
    }
  };

  const vaciarCarrito = async () => {
    try {
      await api.delete('/carrito/vaciar', {
        headers: getHeaders()
      });
      
      dispatch({ type: CARRITO_ACTIONS.CLEAR_CARRITO });
      return { success: true, message: 'Carrito vaciado' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al vaciar carrito';
      dispatch({ 
        type: CARRITO_ACTIONS.SET_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };

  const transferirCarrito = async () => {
    try {
      const sessionId = localStorage.getItem('carritoSessionId');
      if (!sessionId) return { success: true };
      
      const response = await api.post('/carrito/transferir', {
        sessionId
      }, {
        headers: getHeaders()
      });
      
      // Limpiar sessionId después de transferir
      localStorage.removeItem('carritoSessionId');
      
      dispatch({ 
        type: CARRITO_ACTIONS.SET_CARRITO, 
        payload: response.data.carrito 
      });
      
      return { success: true, message: 'Carrito transferido correctamente' };
    } catch (error) {
      console.error('Error al transferir carrito:', error);
      return { success: false, message: 'Error al transferir carrito' };
    }
  };

  const obtenerResumen = async () => {
    try {
      const response = await api.get('/carrito/resumen', {
        headers: getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      return {
        cantidadItems: 0,
        total: 0,
        items: 0
      };
    }
  };

  const clearError = () => {
    dispatch({ type: CARRITO_ACTIONS.CLEAR_ERROR });
  };

  // TODO: Implementar la lógica de creación de pago real
  const crearPago = async (datosPedido) => {
    try {
      const response = await api.post('/carrito/crear-pago', datosPedido, {
        headers: getHeaders()
      });
      
      return {
        success: true,
        clientSecret: response.data.clientSecret,
        ordenId: response.data.ordenId,
        message: 'Pago creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear pago:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear el pago'
      };
    }
  };

  // TODO: Implementar la lógica de confirmación de pago real
  const confirmarPago = async (ordenId, paymentIntentId) => {
    try {
      const response = await api.post('/carrito/confirmar-pago', {
        ordenId,
        paymentIntentId
      }, {
        headers: getHeaders()
      });
      
      return {
        success: true,
        orden: response.data.orden,
        message: 'Pago confirmado exitosamente'
      };
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al confirmar el pago'
      };
    }
  };

  // Valor del contexto
  const value = {
    // Estado
    items: state.items,
    total: state.total,
    cantidadItems: state.cantidadItems,
    loading: state.loading,
    error: state.error,
    
    // Funciones
    cargarCarrito,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    transferirCarrito,
    obtenerResumen,
    clearError,
    // Exponer las funciones de pago simuladas
    crearPago,
    confirmarPago,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  
  return context;
};

export default CarritoContext;