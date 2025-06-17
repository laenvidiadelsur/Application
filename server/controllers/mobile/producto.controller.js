import Producto from '../../models/Producto.model.js';
import Proveedor from '../../models/Proveedor.model.js';
import mongoose from 'mongoose';
import Fundacion from '../../models/Fundacion.model.js';


export const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      unidad,
      stock,
      categoria,
      proveedor,
      fundacion,  // Ahora un solo ObjectId, no array
      estado,
      imagenes
    } = req.body;

    // Validar campos requeridos
    const errores = {};
    if (!nombre) errores.nombre = 'El nombre es requerido';
    if (!descripcion) errores.descripcion = 'La descripción es requerida';
    if (precio === undefined || precio === null) errores.precio = 'El precio es requerido';
    if (!unidad) errores.unidad = 'La unidad es requerida';
    if (stock === undefined || stock === null) errores.stock = 'El stock es requerido';
    if (!categoria) errores.categoria = 'La categoría es requerida';
    if (!proveedor) errores.proveedor = 'El proveedor es requerido';

    // CAMBIO: validar que fundacion es un string ObjectId válido
    if (!fundacion || !mongoose.Types.ObjectId.isValid(fundacion)) {
      errores.fundacion = 'Debe incluir una fundación válida';
    }

    if (!Array.isArray(imagenes) || imagenes.length === 0) {
      errores.imagenes = 'Debe proporcionar al menos una imagen';
    } else {
      for (const img of imagenes) {
        if (!img.url || !img.public_id) {
          errores.imagenes = 'Cada imagen debe incluir url y public_id';
          break;
        }
      }
    }

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos',
        errores
      });
    }

    // Verificar que el proveedor existe
    const proveedorExistente = await Proveedor.findById(proveedor);
    if (!proveedorExistente) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Verificar que la fundación existe
    const fundacionExistente = await Fundacion.findById(fundacion);
    if (!fundacionExistente) {
      return res.status(404).json({ message: 'Fundación no encontrada' });
    }

    // Crear el producto con fundacion simple
    const producto = new Producto({
      nombre,
      descripcion,
      precio: Number(precio),
      unidad,
      stock: Number(stock),
      categoria,
      proveedor,
      fundacion,  // aquí es un solo ObjectId
      estado: estado || 'activo',
      imagenes  // array de imágenes
    });

    await producto.save();

    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los productos sin importar fundación, proveedor o estado
export const obtenerTodosLosProductos = async (req, res) => {
  try {
    const productos = await Producto.find()
      .populate('proveedor', 'nombre email')
      .populate('fundacion', 'nombre') // Puedes incluir más campos si deseas
      .sort({ createdAt: -1 });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos de una fundación
export const obtenerProductos = async (req, res) => {
  try {
    const fundacion = req.user.entidadRelacionada;  // Aquí se espera un ObjectId simple
    const { categoria, proveedor, estado } = req.query;

    const query = { fundacion };
    if (categoria) query.categoria = categoria;
    if (proveedor) query.proveedor = proveedor;
    if (estado) query.estado = estado;

    const productos = await Producto.find(query)
      .populate('proveedor', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const fundacion = req.user.entidadRelacionada;
    const producto = await Producto.findOne({
      _id: req.params.id,
      fundacion
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Si se cambia el proveedor, verificar que pertenece a la fundación
    if (req.body.proveedor && req.body.proveedor !== producto.proveedor.toString()) {
      const proveedorExiste = await Proveedor.findOne({
        _id: req.body.proveedor,
        fundacion  // aquí asumes que proveedor tiene campo fundacion para validar
      });

      if (!proveedorExiste) {
        return res.status(400).json({ message: 'Proveedor no encontrado o no pertenece a la fundación' });
      }
    }

    Object.keys(req.body).forEach(key => {
      producto[key] = req.body[key];
    });

    const productoActualizado = await producto.save();
    res.json(productoActualizado);
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

// Eliminar un producto
export const eliminarProducto = async (req, res) => {
  try {
    const fundacion = req.user.entidadRelacionada;
    const producto = await Producto.findOneAndDelete({
      _id: req.params.id,
      fundacion
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos con límite
export const getAllProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const productos = await Producto.find().limit(limit);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos ordenados por campo
export const getSortedProducts = async (req, res) => {
  try {
    const sortField = req.query.sort || 'nombre';
    const productos = await Producto.find().sort({ [sortField]: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAllProductsByProveedorId = async (req, res) => {
  try {
    // Cambiar aquí de req.params a req.query
    const { proveedorId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
      return res.status(400).json({ message: 'ID de proveedor no válido' });
    }

    const productos = await Producto.find({ proveedor: proveedorId })
      .populate('proveedor', 'nombre email')
      .populate('fundacion', 'nombre')
      .sort({ createdAt: -1 });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos por proveedorId:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};



// Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const productos = await Producto.find({ categoria: category.toLowerCase() }).limit(limit);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener producto por ID
export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id)
      .populate('proveedor')
      .populate('fundacion');

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
