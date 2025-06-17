// ecommerce/src/hooks/useCarritoAvanzado.js
import { useState, useEffect, useCallback } from 'react';
import { useCarrito } from '../context/CarritoContext';

/**
 * Hook avanzado para manejo del carrito con funcionalidades adicionales
 */
export const useCarritoAvanzado = () => {
  const carrito = useCarrito();
  const [notifications, setNotifications] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Mostrar notificación
  const showNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Remover notificación después de 3 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Agregar producto con notificación
  const agregarConNotificacion = useCallback(async (producto, cantidad = 1) => {
    const result = await carrito.agregarAlCarrito(producto, cantidad);
    
    if (result.success) {
      showNotification(`${producto.nombre || producto.name} agregado al carrito`);
    } else {
      showNotification(result.message, 'error');
    }
    
    return result;
  }, [carrito, showNotification]);

  // Eliminar producto con notificación
  const eliminarConNotificacion = useCallback(async (productoId, nombreProducto) => {
    const result = await carrito.eliminarDelCarrito(productoId);
    
    if (result.success) {
      showNotification(`${nombreProducto} eliminado del carrito`);
    } else {
      showNotification(result.message, 'error');
    }
    
    return result;
  }, [carrito, showNotification]);

  // Calcular totales adicionales
  const totales = {
    subtotal: carrito.total,
    impuestos: carrito.total * 0.16, // 16% de IVA
    envio: carrito.total > 500 ? 0 : 5, // Envío gratis sobre $500
    total: carrito.total + (carrito.total * 0.16) + (carrito.total > 500 ? 0 : 5)
  };

  // Verificar si un producto está en el carrito
  const estaEnCarrito = useCallback((productoId) => {
    if (!productoId) return false;
    return carrito.items.some(item => {
      const itemId = item.producto?._id || item.producto?.id;
      return itemId === productoId;
    });
  }, [carrito.items]);

  // Obtener cantidad de un producto en el carrito
  const getCantidadEnCarrito = useCallback((productoId) => {
    const item = carrito.items.find(item => 
      (item.producto._id || item.producto.id) === productoId
    );
    return item ? item.cantidad : 0;
  }, [carrito.items]);

  // Transferir carrito al hacer login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('carritoSessionId');
    
    if (token && sessionId) {
      // Usuario se acaba de loguear y tiene carrito de sesión
      carrito.transferirCarrito().then(result => {
        if (result.success) {
          showNotification('Carrito sincronizado correctamente');
        }
      });
    }
  }, [carrito, showNotification]);

  return {
    // Estado del carrito original
    ...carrito,
    
    // Estado adicional
    notifications,
    isCartOpen,
    totales,
    
    // Funciones mejoradas
    agregarConNotificacion,
    eliminarConNotificacion,
    estaEnCarrito,
    getCantidadEnCarrito,
    
    // Funciones de UI
    setIsCartOpen,
    
    // Función para limpiar notificaciones
    clearNotifications: () => setNotifications([])
  };
};