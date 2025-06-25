import Checkout from '../../models/Orden.model.js';
import Producto from '../../models/Producto.model.js';
import Orden from '../../models/Orden.model.js';
import mongoose from 'mongoose';


import { checkoutDtoToOrden } from '../../models/mappers/checkoutToOrden.js';
import { ordenToCheckoutDto } from '../../models/mappers/ordenToCheckout.js';




export const getFundraisingStats = async (req, res) => {
  try {
    const checkouts = await Checkout.find({});
    const totalRaised = checkouts.reduce((sum, checkout) => sum + checkout.totalPrice, 0);

    // 🎯 Meta declarada directamente como constante
    const fundraisingGoal = 140228;
    const amountLeft = fundraisingGoal - totalRaised;

    res.status(200).json({
      raised: totalRaised,
      goal: fundraisingGoal,
      left: amountLeft
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de fundraising:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de fundraising' });
  }
};
export const getCheckoutsByFoundationId = async (req, res) => {
  try {
    const { foundationId } = req.query;
    if (!foundationId) return res.status(400).json({ message: 'foundationId es requerido' });

    const fundacionObjectId = new mongoose.Types.ObjectId(foundationId);

    // Obtener productos de la fundación
    const productos = await Producto.find({ fundacion: fundacionObjectId }).select('_id');
    const productosIds = productos.map(p => p._id);

    // Buscar órdenes que contengan esos productos
    const ordenes = await Orden.find({ 'items.producto': { $in: productosIds } })
      .populate('items.producto', 'nombre precio categoria fundacion proveedor')
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });

    // Filtrar items por fundación y agregar proveedor (importante)
    const ordenesFiltradas = ordenes
      .map(orden => {
        const itemsDeFundacion = orden.items.filter(item =>
          item.producto?.fundacion?.toString() === foundationId
        );

        if (itemsDeFundacion.length === 0) return null;

        return {
          ...orden.toObject(),
          items: itemsDeFundacion
        };
      })
      .filter(Boolean);

    // Mapear órdenes a DTO
    const checkoutsDto = ordenesFiltradas.map(ordenToCheckoutDto);

    res.status(200).json(checkoutsDto);
  } catch (error) {
    console.error('Error al obtener checkouts por foundationId:', error);
    res.status(500).json({ message: 'Error al obtener checkouts por foundationId' });
  }
};


/////////////////////////////////////////////////////////////////////
export const getCheckoutById = async (req, res) => {
  try {
    const { id } = req.params;

    const orden = await Orden.findById(id);

    if (!orden) {
      return res.status(404).json({ message: 'Checkout no encontrado' });
    }

    const checkoutDto = ordenToCheckoutDto(orden);
    res.json(checkoutDto);
  } catch (error) {
    console.error('Error al obtener checkout por ID:', error);
    res.status(500).json({ message: 'Error al obtener el checkout' });
  }
};
export const createCheckout = async (req, res) => {
  try {
    const checkoutDto = req.body;

    // ✅ Validar o añadir coordenadas manualmente si no vienen
    if (
      !Array.isArray(checkoutDto.coordinates) ||
      checkoutDto.coordinates.length !== 2 ||
      typeof checkoutDto.coordinates[0] !== 'number' ||
      typeof checkoutDto.coordinates[1] !== 'number'
    ) {
      // Puedes lanzar error o usar coordenadas por defecto
      checkoutDto.coordinates = [-17.7833, -63.1821]; // Ejemplo: Santa Cruz
    }

    // 🔁 Validar stock
    for (const item of checkoutDto.orderItems) {
      const product = await Producto.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productName}` });
      }
      if (product.stock < item.productQuantity) {
        return res.status(400).json({
          message: `Stock insuficiente para "${item.productName}". Disponible: ${product.stock}, solicitado: ${item.productQuantity}`
        });
      }
    }

    // 🧾 Restar stock
    for (const item of checkoutDto.orderItems) {
      await Producto.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.productQuantity } }
      );
    }

    // 🛠️ Mapear DTO a datos de Orden
    const ordenData = checkoutDtoToOrden(checkoutDto);

    // 🧮 Calcular subtotal
    const subtotal = ordenData.items.reduce((sum, item) => sum + item.subtotal, 0);

    // 🧾 Generar número de orden único
    const count = await Orden.countDocuments();
    const numeroOrdenGenerado = `ORD-${Date.now()}-${count + 1}`;

    // 🧩 Completar datos de orden con direcciones y contacto
    const ordenCompleta = {
      ...ordenData,
      subtotal,
      impuestos: 0,
      estadoPago: 'pendiente',
      fechaPago: null,
      numeroOrden: numeroOrdenGenerado,
      direccionEnvio: {
        ...ordenData.direccionEnvio,
        calle: checkoutDto.receiverStreet || '',
        ciudad: checkoutDto.receiverCity || '',
        estado: checkoutDto.receiverState || '',
        codigoPostal: checkoutDto.receiverZip || '',
        coordenadas: {
          type: 'Point',
          coordinates: checkoutDto.coordinates // ✅ Incluidas correctamente aquí
        }
      },
      datosContacto: {
        nombre: ordenData.datosContacto.nombre,
        telefono: checkoutDto.receiverPhone || '',
        email: checkoutDto.receiverEmail || ''
      }
    };

    // 💾 Guardar en la base de datos
    const newOrder = new Orden(ordenCompleta);
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);

  } catch (error) {
    console.error('Error al crear el checkout:', error);
    res.status(500).json({ message: 'Error al crear el checkout', error });
  }
};



 /////////////////////////////////////////////////
export const getAllCheckouts = async (req, res) => {
  try {
    const ordenes = await Orden.find();  // Asumo que tu modelo se llama Orden
    const checkoutsDto = ordenes.map(ordenToCheckoutDto);
    res.json(checkoutsDto);
  } catch (error) {
    console.error('Error al obtener checkouts:', error);
    res.status(500).json({ message: 'Error al obtener checkouts' });
  }
};
export const getCheckoutsByReceiverId = async (req, res) => {
  try {
    const { receiverId } = req.query;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId es requerido' });
    }

    const objectId = new mongoose.Types.ObjectId(receiverId);

    // ✅ Buscar órdenes donde el campo `usuario` coincide directamente con el ObjectId
    const ordenes = await Orden.find({ usuario: objectId });

    if (!ordenes.length) {
      return res.status(404).json({ message: 'No se encontraron checkouts para este usuario' });
    }

    const checkoutsDto = ordenes.map(ordenToCheckoutDto);

    res.json(checkoutsDto);
  } catch (error) {
    console.error('Error al obtener checkouts por receiverId:', error);
    res.status(500).json({ message: 'Error al obtener checkouts por receiverId' });
  }
};
