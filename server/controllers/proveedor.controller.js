import Proveedor from '../models/Proveedor.model.js';
import Fundacion from '../models/Fundacion.model.js';
import Usuario from '../models/Usuario.model.js';
import { cloudinary } from '../config/cloudinary.js';

// Crear un nuevo proveedor
export const crearProveedor = async (req, res) => {
  try {
    const {
      nombre,
      nit,
      direccion,
      telefono,
      email,
      password,
      representante,
      tipoServicio,
      fundacion
    } = req.body;

    // Verificar campos requeridos
    const camposFaltantes = {
      nombre: !nombre || nombre.trim() === '',
      nit: !nit || nit.trim() === '',
      direccion: !direccion || direccion.trim() === '',
      telefono: !telefono || telefono.trim() === '',
      email: !email || email.trim() === '',
      password: !password || password.trim() === '',
      representante: !representante,
      'representante.nombre': !representante?.nombre || representante.nombre.trim() === '',
      'representante.ci': !representante?.ci || representante.ci.trim() === '',
      tipoServicio: !tipoServicio || tipoServicio.trim() === '',
      fundacion: !fundacion
    };

    const hayCamposFaltantes = Object.values(camposFaltantes).some(faltante => faltante);
    
    if (hayCamposFaltantes) {
      const camposFaltantesLista = Object.entries(camposFaltantes)
        .filter(([_, faltante]) => faltante)
        .map(([campo]) => {
          switch(campo) {
            case 'nombre': return 'Nombre del proveedor';
            case 'nit': return 'NIT';
            case 'direccion': return 'Dirección';
            case 'telefono': return 'Teléfono';
            case 'email': return 'Email';
            case 'password': return 'Contraseña';
            case 'representante.nombre': return 'Nombre del representante';
            case 'representante.ci': return 'CI del representante';
            case 'tipoServicio': return 'Tipo de servicio';
            case 'fundacion': return 'Fundación';
            default: return campo;
          }
        });

      return res.status(400).json({
        message: 'Faltan campos obligatorios',
        camposFaltantes,
        detalles: camposFaltantesLista
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

    // Verificar si ya existe un usuario con el mismo email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Ya existe un usuario con este email' });
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

    // Crear el usuario asociado al proveedor usando la contraseña proporcionada
    const usuario = await Usuario.create({
      nombre: representante.nombre,
      email,
      password,
      rol: 'proveedor',
      entidadRelacionada: proveedor._id,
      rolModel: 'Proveedor'
    });

    res.status(201).json({
      ...proveedor.toObject(),
      credenciales: {
        email
      }
    });
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
      .populate('productos')
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

// Subir imagen de proveedor
export const subirImagenProveedor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Agregar la nueva imagen al array de imágenes
    proveedor.imagenes.push({
      url: req.file.path,
      public_id: req.file.filename
    });

    await proveedor.save();
    res.json(proveedor);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar imagen de proveedor
export const eliminarImagenProveedor = async (req, res) => {
  try {
    const { proveedorId, publicId } = req.params;
    
    const proveedor = await Proveedor.findById(proveedorId);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Eliminar la imagen de Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Eliminar la imagen del array de imágenes del proveedor
    proveedor.imagenes = proveedor.imagenes.filter(img => img.public_id !== publicId);
    await proveedor.save();

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: error.message });
  }
};
