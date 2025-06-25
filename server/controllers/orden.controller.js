// orden.controller.js - VERSIÓN CORREGIDA
// orden.controller.js - VERSIÓN CORREGIDA

import Orden from '../models/Orden.model.js';
import Producto from '../models/Producto.model.js';
import mongoose from 'mongoose';
import { format, subDays } from 'date-fns';
import Usuario from '../models/Usuario.model.js';

// ... otras funciones existentes ...

export const getOrdenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DEBUG GET ORDEN BY ID ===');
    console.log('ID recibido:', id);
    console.log('Usuario:', req.user?.id);
    console.log('Tipo de usuario:', req.user?.rol);
    
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
    const esProveedorDeLaOrden = req.user.rol === 'proveedor' && 
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

// Obtener órdenes de una fundación
export const getOrdenesFundacion = async (req, res) => {
  try {
    const fundacionId = req.user.entidadRelacionada;
    
    console.log('=== DEBUG BÚSQUEDA ÓRDENES FUNDACIÓN ===');
    console.log('Fundación ID:', fundacionId);
    
    const fundacionObjectId = new mongoose.Types.ObjectId(fundacionId);
    
    // Primero, obtener todos los productos que pertenecen a esta fundación
    const productosDeLaFundacion = await Producto.find({ 
      fundacion: fundacionObjectId 
    }).select('_id');
    
    const productosIds = productosDeLaFundacion.map(p => p._id);
    
    console.log('Productos de la fundación encontrados:', productosIds.length);
    
    // Buscar órdenes que contengan productos de esta fundación
    const ordenes = await Orden.find({ 
      'items.producto': { $in: productosIds }
    })
    .populate('items.producto', 'nombre precio categoria fundacion')
    .populate('usuario', 'nombre email')
    .sort({ createdAt: -1 });
    
    console.log('Órdenes encontradas:', ordenes.length);
    console.log('=== FIN DEBUG BÚSQUEDA ===');
    
    // Procesar órdenes para mostrar solo los items de esta fundación
    const ordenesProcessadas = ordenes.map(orden => {
      const itemsDeLaFundacion = orden.items.filter(item => {
        // Verificar si el producto del item pertenece a esta fundación
        if (item.producto && item.producto.fundacion) {
          return item.producto.fundacion.toString() === fundacionObjectId.toString();
        }
        return false;
      });

      if (itemsDeLaFundacion.length === 0) return null;

      // Calcular totales solo para los items de la fundación
      const subtotalFundacion = itemsDeLaFundacion.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...orden.toObject(),
        items: itemsDeLaFundacion,
        subtotalFundacion,
        totalItemsFundacion: itemsDeLaFundacion.length,
        subtotalOriginal: orden.subtotal,
        totalOriginal: orden.total
      };
    }).filter(orden => orden !== null);
    
    res.status(200).json({
      success: true,
      data: ordenesProcessadas,
      count: ordenesProcessadas.length
    });
    
  } catch (error) {
    console.error('Error al obtener órdenes de la fundación:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas detalladas para reportes
export const getEstadisticasReportes = async (req, res) => {
  try {
    const fundacionId = req.user.entidadRelacionada;
    const { fechaInicio, fechaFin, proveedor, cliente, estado } = req.query;
    
    console.log('=== DEBUG ESTADÍSTICAS REPORTES ===');
    console.log('Fundación ID:', fundacionId);
    console.log('Filtros:', { fechaInicio, fechaFin, proveedor, cliente, estado });
    
    const fundacionObjectId = new mongoose.Types.ObjectId(fundacionId);
    
    // Construir filtros de fecha
    const filtrosFecha = {};
    if (fechaInicio && fechaFin) {
      filtrosFecha.createdAt = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + 'T23:59:59.999Z')
      };
    }
    
    // Obtener productos de la fundación
    const productosDeLaFundacion = await Producto.find({ 
      fundacion: fundacionObjectId 
    }).select('_id');
    
    const productosIds = productosDeLaFundacion.map(p => p._id);
    
    // Construir filtro principal
    const filtroPrincipal = {
      'items.producto': { $in: productosIds },
      ...filtrosFecha
    };
    
    // Aplicar filtros adicionales
    if (estado && estado !== 'todos') {
      filtroPrincipal.estadoEnvio = estado;
    }
    
    if (cliente && cliente !== 'todos') {
      // Buscar usuario por nombre
      const usuario = await Usuario.findOne({ nombre: cliente });
      if (usuario) {
        filtroPrincipal.usuario = usuario._id;
      }
    }
    
    // Buscar órdenes con filtros
    const ordenes = await Orden.find(filtroPrincipal)
      .populate('items.producto', 'nombre precio categoria fundacion')
      .populate('usuario', 'nombre email')
      .populate('items.proveedor', 'nombre')
      .sort({ createdAt: -1 });
    
    console.log('Órdenes encontradas:', ordenes.length);
    
    // Procesar datos para estadísticas
    const estadisticas = {
      resumen: {
        totalOrdenes: 0,
        totalProductos: 0,
        totalValor: 0,
        promedioPorOrden: 0,
        ordenesEntregadas: 0,
        ordenesPendientes: 0
      },
      porEstado: {},
      porCliente: {},
      porProveedor: {},
      porDia: {},
      productosMasDonados: {},
      tendencias: {
        ultimos7Dias: [],
        ultimos30Dias: []
      }
    };
    
    // Procesar cada orden
    ordenes.forEach(orden => {
      const itemsDeLaFundacion = orden.items.filter(item => {
        if (item.producto && item.producto.fundacion) {
          return item.producto.fundacion.toString() === fundacionObjectId.toString();
        }
        return false;
      });
      
      if (itemsDeLaFundacion.length === 0) return;
      
      const subtotalFundacion = itemsDeLaFundacion.reduce((sum, item) => sum + item.subtotal, 0);
      const totalProductos = itemsDeLaFundacion.reduce((sum, item) => sum + item.cantidad, 0);
      
      // Actualizar resumen
      estadisticas.resumen.totalOrdenes++;
      estadisticas.resumen.totalProductos += totalProductos;
      estadisticas.resumen.totalValor += subtotalFundacion;
      
      if (orden.estadoEnvio === 'entregado') {
        estadisticas.resumen.ordenesEntregadas++;
      } else {
        estadisticas.resumen.ordenesPendientes++;
      }
      
      // Estadísticas por estado
      const estado = orden.estadoEnvio;
      if (!estadisticas.porEstado[estado]) {
        estadisticas.porEstado[estado] = { count: 0, valor: 0 };
      }
      estadisticas.porEstado[estado].count++;
      estadisticas.porEstado[estado].valor += subtotalFundacion;
      
      // Estadísticas por cliente
      const cliente = orden.usuario?.nombre || 'Anónimo';
      if (!estadisticas.porCliente[cliente]) {
        estadisticas.porCliente[cliente] = { count: 0, valor: 0 };
      }
      estadisticas.porCliente[cliente].count++;
      estadisticas.porCliente[cliente].valor += subtotalFundacion;
      
      // Estadísticas por día
      const fecha = format(new Date(orden.createdAt), 'yyyy-MM-dd');
      if (!estadisticas.porDia[fecha]) {
        estadisticas.porDia[fecha] = { count: 0, valor: 0 };
      }
      estadisticas.porDia[fecha].count++;
      estadisticas.porDia[fecha].valor += subtotalFundacion;
      
      // Productos más donados
      itemsDeLaFundacion.forEach(item => {
        const productoNombre = item.producto?.nombre || item.nombre;
        if (!estadisticas.productosMasDonados[productoNombre]) {
          estadisticas.productosMasDonados[productoNombre] = { cantidad: 0, valor: 0 };
        }
        estadisticas.productosMasDonados[productoNombre].cantidad += item.cantidad;
        estadisticas.productosMasDonados[productoNombre].valor += item.subtotal;
      });
    });
    
    // Calcular promedio
    if (estadisticas.resumen.totalOrdenes > 0) {
      estadisticas.resumen.promedioPorOrden = estadisticas.resumen.totalValor / estadisticas.resumen.totalOrdenes;
    }
    
    // Generar tendencias de los últimos días
    const hoy = new Date();
    for (let i = 6; i >= 0; i--) {
      const fecha = format(subDays(hoy, i), 'yyyy-MM-dd');
      const datos = estadisticas.porDia[fecha] || { count: 0, valor: 0 };
      estadisticas.tendencias.ultimos7Dias.push({
        fecha,
        ordenes: datos.count,
        valor: datos.valor
      });
    }
    
    for (let i = 29; i >= 0; i--) {
      const fecha = format(subDays(hoy, i), 'yyyy-MM-dd');
      const datos = estadisticas.porDia[fecha] || { count: 0, valor: 0 };
      estadisticas.tendencias.ultimos30Dias.push({
        fecha,
        ordenes: datos.count,
        valor: datos.valor
      });
    }
    
    console.log('=== FIN DEBUG ESTADÍSTICAS ===');
    
    res.status(200).json({
      success: true,
      data: estadisticas,
      ordenes: ordenes.length
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas de reportes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};