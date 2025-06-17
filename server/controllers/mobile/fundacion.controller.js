import Fundacion from '../../models/Fundacion.model.js';
import Usuario from '../../models/Usuario.model.js';
import Producto from '../../models/Producto.model.js';

import { generateToken } from '../../config/jwt.js';
import mongoose from 'mongoose';


export const obtenerDetallesFundacion = async (req, res) => {
  const { idFundacion } = req.params;

  if (!mongoose.Types.ObjectId.isValid(idFundacion)) {
    return res.status(400).json({ message: 'ID de fundación no válido.' });
  }

  try {
    const fundacion = await Fundacion.findById(idFundacion);
    if (!fundacion) {
      return res.status(404).json({ message: 'Fundación no encontrada.' });
    }

    const productos = await Producto.find({ fundacion: idFundacion });
    const totalProductos = productos.length;
    const stockTotal = productos.reduce((acc, p) => acc + (p.stock || 0), 0);

    const checkouts = await Checkout.find({
      orderItems: {
        $elemMatch: { foundationId: idFundacion }
      }
    });

    const objectIdFundacion = mongoose.Types.ObjectId(idFundacion);
    let productosVendidos = 0;
    const clientesUnicos = new Set();

    for (const checkout of checkouts) {
      for (const item of checkout.orderItems) {
        if (item.foundationId.equals(objectIdFundacion)) {
          productosVendidos += item.productQuantity || 0;
          clientesUnicos.add(checkout.receiverId);
        }
      }
    }

    return res.json({
      fundacion: {
        id: fundacion._id,
        nombre: fundacion.nombre,
      },
      totalProductos,
      stockTotal,
      productosVendidos,
      totalClientes: clientesUnicos.size
    });

  } catch (error) {
    console.error('Error al obtener detalles de la fundación:', error);
    return res.status(500).json({ message: 'Error del servidor.' });
  }
};

export const obtenerNombreFundacion = async (req, res) => {
  try {
    const { id } = req.params;

    const fundacion = await Fundacion.findById(id);

    if (!fundacion) {
      return res.status(404).json({ message: 'Fundación no encontrada' });
    }

    res.send(fundacion.nombre); // Devuelve solo el nombre como string
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};



// Crear una nueva fundación
export const crearFundacion = async (req, res) => {
  try {
    const {
      nombre,
      nit,
      direccion,
      telefono,
      email,
      representante,
      mision,
      areaAccion,
      cuentaBancaria,
      logo,
      descripcion,
      password
    } = req.body;

    // Verificar campos requeridos
    if (!nombre || !nit || !direccion || !telefono || !email || !representante || !mision || !areaAccion || !password) {
      return res.status(400).json({ 
        message: 'Todos los campos son obligatorios',
        camposFaltantes: {
          nombre: !nombre,
          nit: !nit,
          direccion: !direccion,
          telefono: !telefono,
          email: !email,
          representante: !representante || !representante.nombre || !representante.ci,
          mision: !mision,
          areaAccion: !areaAccion,
          password: !password
        }
      });
    }

    // Verificar si ya existe una fundación con el mismo email o NIT
    const fundacionExistente = await Fundacion.findOne({
      $or: [{ email }, { nit }]
    });
    if (fundacionExistente) {
      return res.status(400).json({
        message: fundacionExistente.email === email
          ? 'Ya existe una fundación con este email'
          : 'Ya existe una fundación con este NIT'
      });
    }

    // Verificar si ya existe un usuario con el mismo email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Ya existe un usuario con este email' });
    }

    // Crear la fundación
    const fundacion = await Fundacion.create({
      nombre,
      nit,
      direccion,
      telefono,
      email,
      representante,
      mision,
      areaAccion,
      cuentaBancaria,
      logo,
      descripcion
    });

    // Crear usuario asociado a la fundación
    const usuario = await Usuario.create({
      nombre: `Admin ${nombre}`,
      email,
      password,
      rol: 'fundacion',
      entidadRelacionada: fundacion._id,
      rolModel: 'Fundacion'
    });

    // Generar token JWT para el usuario
    const token = generateToken(usuario._id);

    res.status(201).json({
      fundacion,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        token
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email o NIT ya está registrado' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: error.message });
  }
};



export const getFoundationNameById = async (req, res) => {
  try {
    const { id } = req.params;

    const fundacion = await Fundacion.findById(id).select('nombre');

    if (!fundacion) {
      return res.status(404).send('Fundación no encontrada');
    }

    // Devuelve solo el nombre como texto plano
    res.send(fundacion.nombre);
  } catch (error) {
    console.error('Error al obtener el nombre de la fundación:', error);
    res.status(500).send('Error del servidor');
  }
};


// Obtener todas las fundaciones
export const obtenerFundaciones = async (req, res) => {
  try {
    const fundaciones = await Fundacion.find();
    res.json(fundaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una fundación por ID
export const obtenerFundacion = async (req, res) => {
  try {
    const fundacion = await Fundacion.findById(req.params.id);
    if (!fundacion) {
      return res.status(404).json({ message: 'Fundación no encontrada' });
    }
    res.json(fundacion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una fundación
export const actualizarFundacion = async (req, res) => {
  try {
    const fundacion = await Fundacion.findById(req.params.id);
    if (!fundacion) {
      return res.status(404).json({ message: 'Fundación no encontrada' });
    }

    // Verificar si el nuevo email o NIT ya está en uso por otra fundación
    if (req.body.email && req.body.email !== fundacion.email) {
      const emailExistente = await Fundacion.findOne({ email: req.body.email });
      if (emailExistente) {
        return res.status(400).json({ message: 'Ya existe una fundación con este email' });
      }
    }

    if (req.body.nit && req.body.nit !== fundacion.nit) {
      const nitExistente = await Fundacion.findOne({ nit: req.body.nit });
      if (nitExistente) {
        return res.status(400).json({ message: 'Ya existe una fundación con este NIT' });
      }
    }

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      if (key !== 'password' && key !== '_id' && key !== '__v') {
        if (key === 'representante') {
          fundacion.representante = { ...fundacion.representante, ...req.body.representante };
        } else {
          fundacion[key] = req.body[key];
        }
      }
    });

    const fundacionActualizada = await fundacion.save();

    // Actualizar el email del usuario asociado si se cambió
    if (req.body.email && req.body.email !== fundacion.email) {
      await Usuario.findOneAndUpdate(
        { entidadRelacionada: fundacion._id, rol: 'fundacion' },
        { email: req.body.email }
      );
    }

    res.json(fundacionActualizada);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email o NIT ya está registrado' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una fundación
export const eliminarFundacion = async (req, res) => {
  try {
    const fundacion = await Fundacion.findById(req.params.id);
    if (!fundacion) {
      return res.status(404).json({ message: 'Fundación no encontrada' });
    }

    // Eliminar el usuario asociado
    await Usuario.findOneAndDelete({ entidadRelacionada: fundacion._id, rol: 'fundacion' });

    // Eliminar la fundación
    await fundacion.deleteOne();

    res.json({ message: 'Fundación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};