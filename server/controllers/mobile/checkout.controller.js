import Checkout from '../../models/Orden.model.js';
import Product from '../../models/Producto.model.js';
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

    if (!foundationId) {
      return res.status(400).json({ message: 'foundationId es requerido' });
    }

    // Buscar órdenes que tengan al menos un item con ese foundationId
    const ordenes = await Orden.find({
      'items.foundationId': foundationId
    });

    if (ordenes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron checkouts para esta fundación' });
    }

    // Mapear las órdenes al DTO
    const checkoutsDto = ordenes.map(ordenToCheckoutDto);

    res.json(checkoutsDto);
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
////////////////////////////////////////////////////////////////
export const createCheckout = async (req, res) => {
  try {
    const checkoutDto = req.body;

    // Validar stock para cada producto
    for (const item of checkoutDto.orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productName}` });
      }
      if (product.stock < item.productQuantity) {
        return res.status(400).json({
          message: `Stock insuficiente para el producto "${item.productName}". Disponible: ${product.stock}, solicitado: ${item.productQuantity}`
        });
      }
    }

    // Restar stock de todos los productos
    for (const item of checkoutDto.orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.productQuantity } }
      );
    }

    // Mapear DTO a orden
    const ordenData = checkoutDtoToOrden(checkoutDto);

    // Calcular subtotal
    const subtotal = ordenData.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Generar número de orden único aquí
    const count = await Orden.countDocuments();
    const numeroOrdenGenerado = `ORD-${Date.now()}-${count + 1}`;

    // Completar datos para modelo Orden
    const ordenCompleta = {
      ...ordenData,
      subtotal,
      impuestos: 0,
      estadoPago: 'pendiente',
      fechaPago: null,
      numeroOrden: numeroOrdenGenerado,  // asignamos el número generado aquí
      direccionEnvio: {
        ...ordenData.direccionEnvio,
        calle: checkoutDto.receiverStreet || '',
        ciudad: checkoutDto.receiverCity || '',
        estado: checkoutDto.receiverState || '',
        codigoPostal: checkoutDto.receiverZip || ''
      },
      datosContacto: {
        nombre: ordenData.datosContacto.nombre,
        telefono: checkoutDto.receiverPhone || '',
        email: checkoutDto.receiverEmail || ''
      }
    };

    // Crear y guardar la orden
    const newOrder = new Orden(ordenCompleta);
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);

  } catch (error) {
    console.error('Error al crear el checkout:', error);
    res.status(500).json({ message: 'Error al crear el checkout' });
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
