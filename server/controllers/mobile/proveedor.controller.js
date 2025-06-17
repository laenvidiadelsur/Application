import Proveedor from '../../models/Proveedor.model.js';
import Fundacion from '../../models/Fundacion.model.js';

// Crear un nuevo proveedor
export const crearProveedor = async (req, res) => {
  try {
    const {
      nombre,
      nit,
      direccion,
      telefono,
      email,
      representante,
      tipoServicio,
      fundacion
    } = req.body;

    // Verificar campos requeridos
    if (!nombre || !nit || !direccion || !telefono || !email || !representante || !tipoServicio || !fundacion) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios',
        camposFaltantes: {
          nombre: !nombre,
          nit: !nit,
          direccion: !direccion,
          telefono: !telefono,
          email: !email,
          representante: !representante || !representante.nombre || !representante.ci,
          tipoServicio: !tipoServicio,
          fundacion: !fundacion
        }
      });
    }

    // Verificar si la fundación existe
    const fundacionExiste = await Fundacion.findById(fundacion);
    if (!fundacionExiste) {
      return res.status(400).json({ message: 'La fundación no existe' });
    }

    // Verificar si ya existe un proveedor con el mismo email o NIT
    const proveedorExistente = await Proveedor.findOne({
      $or: [{ email }, { nit }]
    });
    if (proveedorExistente) {
      return res.status(400).json({
        message: proveedorExistente.email === email
          ? 'Ya existe un proveedor con este email'
          : 'Ya existe un proveedor con este NIT'
      });
    }

    // Crear el proveedor
    const proveedor = await Proveedor.create({
      nombre,
      nit,
      direccion,
      telefono,
      email,
      representante,
      tipoServicio,
      fundacion,
      estado: 'pendiente'
    });

    res.status(201).json(proveedor);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los proveedores
export const obtenerProveedores = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    let query = {};
    
    // Si el usuario es una fundación, solo mostrar sus proveedores
    if (req.user.rol === 'fundacion') {
      const fundacion = req.user.entidadRelacionada;
      if (!fundacion) {
        return res.status(400).json({ message: 'Usuario no tiene una fundación asociada' });
      }
      query.fundacion = fundacion;
    }

    const proveedores = await Proveedor.find(query)
      .populate('fundacion', 'nombre')
      .sort({ createdAt: -1 });
    
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ 
      message: 'Error al obtener los proveedores',
      error: error.message 
    });
  }
};

export const obtenerTodosLosProveedores = async (req, res) => {
  try {
    // Obtener todos los proveedores
    const proveedores = await Proveedor.find().populate('fundacion', 'nombre').sort({ createdAt: -1 });

    // Devolver los proveedores
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      message: 'Error al obtener los proveedores',
      error: error.message,
    });
  }
};


// Obtener un proveedor por ID
export const obtenerProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar estado del proveedor (aprobar/rechazar)
export const actualizarEstadoProveedor = async (req, res) => {
  try {
    const { estado } = req.body;
    const proveedor = await Proveedor.findById(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    if (!['aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    proveedor.estado = estado;
    const proveedorActualizado = await proveedor.save();

    res.json(proveedorActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un proveedor
export const actualizarProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Verificar si el nuevo email o NIT ya está en uso
    if (req.body.email && req.body.email !== proveedor.email) {
      const emailExistente = await Proveedor.findOne({ email: req.body.email });
      if (emailExistente) {
        return res.status(400).json({ message: 'Ya existe un proveedor con este email' });
      }
    }

    if (req.body.nit && req.body.nit !== proveedor.nit) {
      const nitExistente = await Proveedor.findOne({ nit: req.body.nit });
      if (nitExistente) {
        return res.status(400).json({ message: 'Ya existe un proveedor con este NIT' });
      }
    }

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        if (key === 'representante') {
          proveedor.representante = { ...proveedor.representante, ...req.body.representante };
        } else {
          proveedor[key] = req.body[key];
        }
      }
    });

    const proveedorActualizado = await proveedor.save();
    res.json(proveedorActualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un proveedor
export const eliminarProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
