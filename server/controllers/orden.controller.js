// orden.controller.js - VERSIÓN CORREGIDA

import Orden from '../models/Orden.model.js';
import Producto from '../models/Producto.model.js';
import mongoose from 'mongoose';

// ... otras funciones existentes ...

export const getOrdenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DEBUG GET ORDEN BY ID ===');
    console.log('ID recibido:', id);
    console.log('Usuario:', req.user?.id);
    console.log('Tipo de usuario:', req.user?.tipo);
    
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('ID no válido');
      return res.status(400).json({ 
        success: false,
        message: 'ID de orden no válido' 
      });
    }
    
    // Buscar la orden con populate completo
    const orden = await Orden.findById(id)
      .populate('items.producto', 'nombre precio categoria proveedor imagenes')
      .populate('items.proveedor', 'nombre email') 
      .populate('usuario', 'nombre email');
    
    if (!orden) {
      console.log('Orden no encontrada');
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada' 
      });
    }
    
    // Verificar permisos: el usuario debe ser el dueño de la orden O un proveedor con items en la orden
    const esUsuarioDeLaOrden = orden.usuario._id.toString() === req.user.id;
    const esProveedorDeLaOrden = req.user.tipo === 'proveedor' && 
      orden.items.some(item => 
        item.proveedor && item.proveedor._id.toString() === req.user.entidadRelacionada
      );
    
    if (!esUsuarioDeLaOrden && !esProveedorDeLaOrden) {
      console.log('Sin permisos para ver esta orden');
      return res.status(403).json({ 
        success: false,
        message: 'No tienes permisos para ver esta orden' 
      });
    }
    
    console.log('Orden encontrada y autorizada:', {
      id: orden._id,
      estadoEnvio: orden.estadoEnvio,
      estadoPago: orden.estadoPago,
      usuario: orden.usuario.nombre,
      itemsCount: orden.items.length
    });
    
    // IMPORTANTE: Asegurar que la respuesta sea JSON válido
    const response = {
      success: true,
      data: orden,
      // Campos adicionales para el frontend
      _id: orden._id,
      estadoEnvio: orden.estadoEnvio,
      estadoPago: orden.estadoPago,
      subtotal: orden.subtotal,
      total: orden.total,
      items: orden.items,
      usuario: orden.usuario,
      direccionEnvio: orden.direccionEnvio,
      datosContacto: orden.datosContacto,
      createdAt: orden.createdAt,
      updatedAt: orden.updatedAt
    };
    
    console.log('=== FIN DEBUG GET ORDEN ===');
    
    // Enviar respuesta JSON
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('Error al obtener orden por ID:', error);
    
    // Asegurar respuesta JSON incluso en caso de error
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar para procesar órdenes (EXISTENTE - mejorada)
function procesarOrdenes(ordenes, proveedorObjectId) {
  const ordenesConItemsDelProveedor = ordenes.map(orden => {
    const itemsDelProveedor = orden.items.filter(item => {
      // Verificar por campo proveedor directo
      if (item.proveedor) {
        const coincide = item.proveedor.toString() === proveedorObjectId.toString();
        if (coincide) return true;
      }
      
      // Verificar por proveedor del producto si está poblado
      if (item.producto && item.producto.proveedor) {
        const coincide = item.producto.proveedor.toString() === proveedorObjectId.toString();
        if (coincide) return true;
      }
      
      return false;
    });

    if (itemsDelProveedor.length === 0) return null;

    // Calcular totales solo para los items del proveedor
    const subtotalProveedor = itemsDelProveedor.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      ...orden.toObject(),
      items: itemsDelProveedor,
      subtotalProveedor,
      totalItemsProveedor: itemsDelProveedor.length,
      subtotalOriginal: orden.subtotal,
      totalOriginal: orden.total
    };
  }).filter(orden => orden !== null);

  return ordenesConItemsDelProveedor;
}

// Permitir que el proveedor actualice el estado de envío de una orden (MEJORADA)
export const actualizarEstadoEnvioOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    const proveedorId = req.user.entidadRelacionada;

    console.log('=== DEBUG ACTUALIZAR ESTADO ===');
    console.log('Orden ID:', id);
    console.log('Nuevo estado:', nuevoEstado);
    console.log('Proveedor ID:', proveedorId);

    // Verificar que el estado sea válido
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ 
        success: false,
        message: 'Estado de envío no válido. Estados permitidos: ' + estadosValidos.join(', ')
      });
    }

    // Buscar la orden que tenga items de este proveedor
    const orden = await Orden.findOne({ 
      _id: id, 
      'items.proveedor': proveedorId 
    }).populate('items.producto', 'nombre proveedor');

    if (!orden) {
      console.log('Orden no encontrada o sin permisos');
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada o no tienes permisos para modificarla' 
      });
    }

    // Actualizar el estado
    const estadoAnterior = orden.estadoEnvio;
    orden.estadoEnvio = nuevoEstado;
    
    // Agregar timestamp de última actualización
    orden.updatedAt = new Date();
    
    await orden.save();

    console.log(`Estado actualizado de "${estadoAnterior}" a "${nuevoEstado}"`);
    console.log('=== FIN DEBUG ACTUALIZAR ===');

    // Respuesta exitosa
    res.status(200).json({ 
      success: true,
      message: 'Estado de envío actualizado correctamente',
      data: {
        ordenId: orden._id,
        estadoAnterior,
        estadoNuevo: orden.estadoEnvio,
        fechaActualizacion: orden.updatedAt
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado de envío:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función existente mejorada
export const getOrdenesProveedor = async (req, res) => {
  try {
    const proveedorId = req.user.entidadRelacionada;
    
    console.log('=== DEBUG BÚSQUEDA ÓRDENES ===');
    console.log('Proveedor ID:', proveedorId);
    
    const proveedorObjectId = new mongoose.Types.ObjectId(proveedorId);
    
    // Búsqueda principal
    const ordenes = await Orden.find({ 
      'items.proveedor': proveedorObjectId 
    })
    .populate('items.producto', 'nombre precio categoria')
    .populate('usuario', 'nombre email')
    .sort({ createdAt: -1 });
    
    console.log('Órdenes encontradas:', ordenes.length);
    console.log('=== FIN DEBUG BÚSQUEDA ===');
    
    const ordenesProcessadas = procesarOrdenes(ordenes, proveedorObjectId);
    
    res.status(200).json({
      success: true,
      data: ordenesProcessadas,
      count: ordenesProcessadas.length
    });
    
  } catch (error) {
    console.error('Error al obtener órdenes del proveedor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener órdenes de un usuario
export const getOrdenesUsuario = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    console.log('=== DEBUG BÚSQUEDA ÓRDENES USUARIO ===');
    console.log('Usuario ID:', usuarioId);
    
    const ordenes = await Orden.find({ 
      usuario: usuarioId 
    })
    .populate('items.producto', 'nombre precio categoria imagenes')
    .populate('items.proveedor', 'nombre')
    .sort({ createdAt: -1 });
    
    console.log('Órdenes encontradas:', ordenes.length);
    console.log('=== FIN DEBUG BÚSQUEDA ===');
    
    res.status(200).json({
      success: true,
      data: ordenes,
      count: ordenes.length
    });
    
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
