// server/controllers/carrito.controller.js
import Carrito from '../models/Carrito.model.js';
import Producto from '../models/Producto.model.js';
import Orden from '../models/Orden.model.js';
import stripe from '../config/stripe.js';
import mongoose from 'mongoose';

// Obtener carrito del usuario
export const obtenerCarrito = async (req, res) => {
  try {
    let carrito;
    
    if (req.user) {
      // Usuario autenticado
      carrito = await Carrito.findOne({ 
        usuario: req.user._id, 
        estado: 'activo' 
      }).populate({
        path: 'items.producto',
        select: 'nombre precio imagenes stock categoria'
      });
      
      if (!carrito) {
        carrito = await Carrito.create({
          usuario: req.user._id,
          items: []
        });
      }
    } else {
      // Usuario no autenticado - usar sessionId
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requerido para usuarios no autenticados' });
      }
      
      carrito = await Carrito.findOne({ 
        sessionId, 
        estado: 'activo' 
      }).populate({
        path: 'items.producto',
        select: 'nombre precio imagenes stock categoria'
      });
      
      if (!carrito) {
        carrito = await Carrito.create({
          sessionId,
          items: []
        });
      }
    }
    
    res.json(carrito);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Agregar producto al carrito
export const agregarAlCarrito = async (req, res) => {
  try {
    const { productoId, cantidad = 1 } = req.body;
    
    if (!productoId) {
      return res.status(400).json({ message: 'ID del producto es requerido' });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }
    
    // Verificar que el producto existe y está activo
    const producto = await Producto.findOne({ 
      _id: productoId, 
      estado: 'activo' 
    });
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado o no disponible' });
    }
    
    // Verificar stock disponible
    if (producto.stock < cantidad) {
      return res.status(400).json({ 
        message: 'Stock insuficiente',
        stockDisponible: producto.stock
      });
    }
    
    let carrito;
    
    if (req.user) {
      // Usuario autenticado
      carrito = await Carrito.findOne({ 
        usuario: req.user._id, 
        estado: 'activo' 
      });
      
      if (!carrito) {
        carrito = new Carrito({
          usuario: req.user._id,
          items: []
        });
      }
    } else {
      // Usuario no autenticado
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requerido' });
      }
      
      carrito = await Carrito.findOne({ 
        sessionId, 
        estado: 'activo' 
      });
      
      if (!carrito) {
        carrito = new Carrito({
          sessionId,
          items: []
        });
      }
    }
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.items.find(item => 
      item.producto.toString() === productoId
    );
    
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (producto.stock < nuevaCantidad) {
        return res.status(400).json({ 
          message: 'Stock insuficiente para la cantidad solicitada',
          stockDisponible: producto.stock,
          cantidadEnCarrito: itemExistente.cantidad
        });
      }
      itemExistente.cantidad = nuevaCantidad;
      itemExistente.precioUnitario = producto.precio;
    } else {
      carrito.items.push({
        producto: productoId,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: cantidad * producto.precio
      });
    }
    
    await carrito.save();
    
    // Poblar los datos del producto para la respuesta
    await carrito.populate({
      path: 'items.producto',
      select: 'nombre precio imagenes stock categoria'
    });
    
    res.json({
      message: 'Producto agregado al carrito',
      carrito
    });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar cantidad de un producto en el carrito
export const actualizarCantidadCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;
    
    if (cantidad < 0) {
      return res.status(400).json({ message: 'La cantidad no puede ser negativa' });
    }
    
    let carrito;
    
    if (req.user) {
      carrito = await Carrito.findOne({ 
        usuario: req.user._id, 
        estado: 'activo' 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        estado: 'activo' 
      });
    }
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    if (cantidad === 0) {
      // Eliminar producto del carrito
      carrito.items = carrito.items.filter(item => 
        item.producto.toString() !== productoId
      );
    } else {
      // Verificar stock disponible
      const producto = await Producto.findById(productoId);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      if (producto.stock < cantidad) {
        return res.status(400).json({ 
          message: 'Stock insuficiente',
          stockDisponible: producto.stock
        });
      }
      
      const item = carrito.items.find(item => 
        item.producto.toString() === productoId
      );
      
      if (item) {
        item.cantidad = cantidad;
        item.precioUnitario = producto.precio;
      } else {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
      }
    }
    
    await carrito.save();
    
    await carrito.populate({
      path: 'items.producto',
      select: 'nombre precio imagenes stock categoria'
    });
    
    res.json({
      message: cantidad === 0 ? 'Producto eliminado del carrito' : 'Cantidad actualizada',
      carrito
    });
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar producto del carrito
export const eliminarDelCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    let carrito;
    
    if (req.user) {
      carrito = await Carrito.findOne({ 
        usuario: req.user._id, 
        estado: 'activo' 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        estado: 'activo' 
      });
    }
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    const itemIndex = carrito.items.findIndex(item => 
      item.producto.toString() === productoId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
    
    carrito.items.splice(itemIndex, 1);
    await carrito.save();
    
    await carrito.populate({
      path: 'items.producto',
      select: 'nombre precio imagenes stock categoria'
    });
    
    res.json({
      message: 'Producto eliminado del carrito',
      carrito
    });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Vaciar carrito
export const vaciarCarrito = async (req, res) => {
  try {
    let carrito;
    
    if (req.user) {
      carrito = await Carrito.findOne({ 
        usuario: req.user._id,
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId,
      });
    }
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    carrito.items = [];
    carrito.total = 0;
    await carrito.save();
    
    res.json({
      message: 'Carrito vaciado correctamente',
      carrito
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Transferir carrito de sesión a usuario autenticado
export const transferirCarrito = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID requerido' });
    }
    
    // Buscar carrito de sesión
    const carritoSesion = await Carrito.findOne({ 
      sessionId, 
      estado: 'activo' 
    });
    
    if (!carritoSesion || carritoSesion.items.length === 0) {
      return res.status(404).json({ message: 'No hay carrito de sesión para transferir' });
    }
    
    // Buscar carrito del usuario autenticado
    let carritoUsuario = await Carrito.findOne({ 
      usuario: req.user._id, 
      estado: 'activo' 
    });
    
    if (!carritoUsuario) {
      // Transferir directamente el carrito de sesión al usuario
      carritoSesion.usuario = req.user._id;
      carritoSesion.sessionId = undefined;
      await carritoSesion.save();
      carritoUsuario = carritoSesion;
    } else {
      // Fusionar carritos
      for (const itemSesion of carritoSesion.items) {
        const itemExistente = carritoUsuario.items.find(item => 
          item.producto.toString() === itemSesion.producto.toString()
        );
        
        if (itemExistente) {
          itemExistente.cantidad += itemSesion.cantidad;
        } else {
          carritoUsuario.items.push(itemSesion);
        }
      }
      
      await carritoUsuario.save();
      
      // Eliminar carrito de sesión
      await carritoSesion.deleteOne();
    }
    
    await carritoUsuario.populate({
      path: 'items.producto',
      select: 'nombre precio imagenes stock categoria'
    });
    
    res.json({
      message: 'Carrito transferido correctamente',
      carrito: carritoUsuario
    });
  } catch (error) {
    console.error('Error al transferir carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener resumen del carrito
export const obtenerResumenCarrito = async (req, res) => {
  try {
    let carrito;
    
    if (req.user) {
      carrito = await Carrito.findOne({ 
        usuario: req.user._id, 
        estado: 'activo' 
      }).populate({
        path: 'items.producto',
        select: 'nombre precio imagenes stock categoria'
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        estado: 'activo' 
      }).populate({
        path: 'items.producto',
        select: 'nombre precio imagenes stock categoria'
      });
    }
    
    if (!carrito) {
      return res.json({
        cantidadItems: 0,
        total: 0,
        items: []
      });
    }
    
    const resumen = {
      cantidadItems: carrito.items.reduce((total, item) => total + item.cantidad, 0),
      total: carrito.total,
      items: carrito.items.length,
      productos: carrito.items.map(item => ({
        producto: item.producto.nombre,
        cantidad: item.cantidad,
        subtotal: item.subtotal
      }))
    };
    
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen del carrito:', error);
    res.status(500).json({ message: error.message });
  }
};

// Crear Payment Intent de Stripe

export const crearPaymentIntent = async (req, res) => {
  try {
    const { direccionEnvio, datosContacto } = req.body;
    
    // Obtener carrito del usuario
    let carrito;
    if (req.user) {
      carrito = await Carrito.findOne({ 
        usuario: req.user._id, 
        estado: 'activo' 
      }).populate({
        path: 'items.producto',
        select: 'nombre precio imagenes stock categoria proveedor'
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requerido para usuarios no autenticados' });
      }
      carrito = await Carrito.findOne({ 
        sessionId, 
        estado: 'activo' 
      }).populate({
        path: 'items.producto',
        select: 'nombre precio imagenes stock categoria proveedor'
      });
    }
    
    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }
    
    console.log('=== DEBUG CREACIÓN DE ORDEN ===');
    console.log('Items en carrito:', carrito.items.length);
    
    // Verificar y preparar items con validación estricta
    const itemsValidados = [];
    
    for (let i = 0; i < carrito.items.length; i++) {
      const item = carrito.items[i];
      
      console.log(`\nItem ${i + 1}:`);
      console.log('  Producto:', item.producto.nombre);
      console.log('  Producto ID:', item.producto._id);
      console.log('  Proveedor en producto:', item.producto.proveedor);
      console.log('  Tipo proveedor:', typeof item.producto.proveedor);
      console.log('  Stock disponible:', item.producto.stock);
      console.log('  Cantidad solicitada:', item.cantidad);
      
      // Validación 1: Producto debe tener proveedor
      if (!item.producto.proveedor) {
        return res.status(400).json({ 
          message: `El producto "${item.producto.nombre}" no tiene proveedor asignado`,
          producto: item.producto.nombre
        });
      }
      
      // Validación 2: Stock suficiente
      if (item.producto.stock < item.cantidad) {
        return res.status(400).json({ 
          message: `Stock insuficiente para "${item.producto.nombre}"`,
          stockDisponible: item.producto.stock,
          cantidadSolicitada: item.cantidad
        });
      }
      
      // Validación 3: Proveedor debe ser ObjectId válido
      let proveedorId = item.producto.proveedor;
      
      if (typeof proveedorId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
          return res.status(400).json({ 
            message: `ID de proveedor inválido para producto "${item.producto.nombre}": ${proveedorId}`
          });
        }
        proveedorId = new mongoose.Types.ObjectId(proveedorId);
      } else if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
        return res.status(400).json({ 
          message: `Proveedor debe ser un ObjectId válido para producto "${item.producto.nombre}"`
        });
      }
      
      console.log('  Proveedor final (ObjectId):', proveedorId);
      console.log('  Es ObjectId válido:', mongoose.Types.ObjectId.isValid(proveedorId));
      
      // Crear item validado
      const itemValidado = {
        producto: new mongoose.Types.ObjectId(item.producto._id),
        proveedor: proveedorId, // Ya validado como ObjectId
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal
      };
      
      itemsValidados.push(itemValidado);
    }
    
    console.log('\nItems validados:', itemsValidados.length);
    console.log('Todos los proveedores:');
    itemsValidados.forEach((item, index) => {
      console.log(`  Item ${index + 1} - Proveedor: ${item.proveedor} (${typeof item.proveedor})`);
    });
    
    // Calcular totales
    const subtotal = carrito.total;
    const impuestos = subtotal * 0.16;
    const envio = subtotal > 500 ? 0 : 50;
    const total = subtotal + impuestos + envio;
    
    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'mxn',
      metadata: {
        carritoId: carrito._id.toString(),
        usuarioId: req.user ? req.user._id.toString() : 'invitado',
        items: JSON.stringify(itemsValidados.map(item => ({
          productoId: item.producto,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precioUnitario,
          proveedor: item.proveedor
        })))
      }
    });
    
    console.log('\nCreando orden con items:', itemsValidados.length);
    
    // Crear orden con items validados
    const orden = await Orden.create({
      numeroOrden: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      usuario: req.user ? new mongoose.Types.ObjectId(req.user._id) : null,
      items: itemsValidados, // Items ya validados con ObjectIds correctos
      subtotal,
      impuestos,
      envio,
      total,
      direccionEnvio: {
        ...direccionEnvio,
        coordenadas: {
          type: 'Point',
          coordinates: [
            parseFloat(direccionEnvio.latitud || -17.7863),
            parseFloat(direccionEnvio.longitud || -63.1812)
          ]
        }
      },
      datosContacto,
      stripePaymentIntentId: paymentIntent.id,
      estadoPago: 'pendiente',
      estadoEnvio: 'pendiente'
    });
    
    console.log('Orden creada exitosamente:');
    console.log('  ID:', orden._id);
    console.log('  Número:', orden.numeroOrden);
    console.log('  Items guardados:', orden.items.length);
    
    // Verificar que se guardó correctamente
    orden.items.forEach((item, index) => {
      console.log(`  Item guardado ${index + 1}:`);
      console.log(`    Producto: ${item.producto}`);
      console.log(`    Proveedor: ${item.proveedor} (${typeof item.proveedor})`);
      console.log(`    Es ObjectId: ${mongoose.Types.ObjectId.isValid(item.proveedor)}`);
    });
    
    // Actualizar estado del carrito
    carrito.estado = 'procesando';
    await carrito.save();
    
    console.log('=== FIN DEBUG CREACIÓN ===\n');
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      ordenId: orden._id,
      total,
      desglose: {
        subtotal,
        impuestos,
        envio,
        total
      }
    });
    
  } catch (error) {
    console.error('Error al crear payment intent:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};

// Confirmar pago
export const confirmarPago = async (req, res) => {
  try {
    const { ordenId, paymentIntentId } = req.body;
    
    // Verificar el estado del pago en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'El pago no se ha completado',
        estado: paymentIntent.status 
      });
    }
    
    // Buscar la orden
    const orden = await Orden.findById(ordenId);
    if (!orden) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Actualizar orden
    orden.estadoPago = 'completado';
    orden.fechaPago = new Date();
    orden.stripeChargeId = paymentIntent.latest_charge;
    
    // Obtener detalles del método de pago
    if (paymentIntent.payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method
      );
      if (paymentMethod.card) {
        orden.stripePagoDetalles = {
          marca: paymentMethod.card.brand,
          ultimos4: paymentMethod.card.last4,
          tipo: paymentMethod.card.funding
        };
      }
    }
    
    await orden.save();
    
    // Actualizar stock de productos
    for (const item of orden.items) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: -item.cantidad } }
      );
    }
    
    // Vaciar el carrito
    const carrito = await Carrito.findOne({
      $or: [
        { usuario: req.user?._id, estado: 'procesando' },
        { _id: paymentIntent.metadata.carritoId }
      ]
    });
    
    if (carrito) {
      carrito.items = [];
      carrito.total = 0;
      carrito.estado = 'completado';
      await carrito.save();
    }
    
    res.json({
      message: 'Pago confirmado exitosamente',
      orden: {
        _id: orden._id,
        numeroOrden: orden.numeroOrden,
        total: orden.total,
        estadoPago: orden.estadoPago,
        estadoEnvio: orden.estadoEnvio,
        direccionEnvio: orden.direccionEnvio,
        datosContacto: orden.datosContacto,
        // Puedes agregar más campos si lo deseas
      }
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ message: error.message });
  }
};

// Webhook Stripe con clave directa (no recomendado para producción)
export const webhookStripe = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      'whsec_xQQdpqCZLb1Co4nyHmozj4iMO05gOebp'  // clave webhook directamente aquí
    );
  } catch (err) {
    console.error('Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent exitoso:', paymentIntent.id);

        const orden = await Orden.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (orden && orden.estadoPago !== 'completado') {
          orden.estadoPago = 'completado';
          orden.fechaPago = new Date();
          orden.stripeChargeId = paymentIntent.latest_charge;
          await orden.save();

          for (const item of orden.items) {
            await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: -item.cantidad } });
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Pago fallido:', failedPayment.id);

        const ordenFallida = await Orden.findOne({ stripePaymentIntentId: failedPayment.id });
        if (ordenFallida) {
          ordenFallida.estadoPago = 'fallido';
          await ordenFallida.save();
        }
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error procesando evento del webhook:', err);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
};
