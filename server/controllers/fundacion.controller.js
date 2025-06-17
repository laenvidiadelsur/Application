import Fundacion from '../models/Fundacion.model.js';
import Usuario from '../models/Usuario.model.js';
import { generateToken } from '../config/jwt.js';

// Crear una nueva fundación
// Crear una nueva fundación
export const crearFundacion = async (req, res) => {
  try {
    // Imprimir los datos recibidos
    console.log('Datos recibidos en req.body:', req.body);

    const {
      nombre,
      nit,
      direccion,
      location,
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