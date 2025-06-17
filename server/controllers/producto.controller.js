import Producto from '../models/Producto.model.js';
import Proveedor from '../models/Proveedor.model.js';
import { cloudinary } from '../config/cloudinary.js';
import { upload } from '../config/cloudinary.js';

// Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, unidad, stock, categoria, proveedor, fundaciones_asociadas } = req.body;
    let imagenes = [];
    if (req.file) {
      imagenes.push({
        url: req.file.path,
        public_id: req.file.filename
      });
    }
    
    // Obtener la fundación según el rol del usuario
    let fundacion;
    if (req.user.rol === 'fundacion') {
      fundacion = req.user.entidadRelacionada;
    } else if (req.user.rol === 'proveedor') {
      // Si es proveedor, obtener su fundación asociada
      const proveedorDoc = await Proveedor.findById(req.user.entidadRelacionada);
      if (!proveedorDoc) {
        return res.status(400).json({ message: 'Proveedor no encontrado' });
      }
      fundacion = proveedorDoc.fundacion;
    } else {
      return res.status(403).json({ message: 'No tiene permisos para crear productos' });
    }

    // Validar campos requeridos
    if (!nombre || !descripcion || !precio || !unidad || !stock || !categoria) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos',
        errores: {
          nombre: !nombre ? 'El nombre es requerido' : null,
          descripcion: !descripcion ? 'La descripción es requerida' : null,
          precio: !precio ? 'El precio es requerido' : null,
          unidad: !unidad ? 'La unidad es requerida' : null,
          stock: !stock ? 'El stock es requerido' : null,
          categoria: !categoria ? 'La categoría es requerida' : null
        }
      });
    }

    // Si es proveedor, usar su ID como proveedor
    const proveedorId = req.user.rol === 'proveedor' ? req.user.entidadRelacionada : proveedor;

    // Verificar que el proveedor existe y pertenece a la fundación
    const proveedorExiste = await Proveedor.findOne({
      _id: proveedorId,
      fundacion: fundacion
    });

    if (!proveedorExiste) {
      return res.status(400).json({ 
        message: 'Proveedor no encontrado o no pertenece a la fundación' 
      });
    }

    if (proveedorExiste.estado === 'rechazado') {
      return res.status(400).json({ 
        message: 'No se puede crear un producto con un proveedor rechazado' 
      });
    }

    const producto = await Producto.create({
      nombre,
      descripcion,
      precio: Number(precio),
      unidad,
      stock: Number(stock),
      categoria,
      proveedor: proveedorId,
      fundacion,
      fundaciones_asociadas: fundaciones_asociadas || [],
      imagenes
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los productos de una fundación
export const obtenerProductos = async (req, res) => {
  try {
    console.log('Usuario:', req.user);
    const fundacion = req.user?.entidadRelacionada;
    
    if (!fundacion) {
      console.log('No se encontró fundación asociada al usuario');
      return res.status(200).json([]); // Devolver array vacío si no hay fundación
    }

    const { categoria, proveedor, estado } = req.query;
    const query = { fundacion };
    
    if (categoria) query.categoria = categoria;
    if (proveedor) query.proveedor = proveedor;
    if (estado) query.estado = estado;

    console.log('Consulta:', query);

    const productos = await Producto.find(query)
      .populate('proveedor', 'nombre email')
      .sort({ createdAt: -1 });

    console.log('Productos encontrados:', productos.length);
    console.log('Primer producto (si existe):', productos[0]);

    // Evitar el caché en desarrollo
    res.set('Cache-Control', 'no-store');
    
    if (!productos || productos.length === 0) {
      console.log('No se encontraron productos para la fundación');
      return res.status(200).json([]); // Devolver array vacío si no hay productos
    }

    res.json(productos);
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    res.status(500).json({ message: error.message });
  }
};


// Obtener un producto por ID
export const obtenerProducto = async (req, res) => {
  try {
    const fundacion = req.user.entidadRelacionada;
    const producto = await Producto.findOne({
      _id: req.params.id,
      fundacion
    }).populate('proveedor', 'nombre email');

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto);
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
        fundacion
      });

      if (!proveedorExiste) {
        return res.status(400).json({ message: 'Proveedor no encontrado o no pertenece a la fundación' });
      }
    }

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      if (key === 'fundaciones_asociadas') {
        producto[key] = req.body[key] || [];
      } else {
        producto[key] = req.body[key];
      }
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
    let query = { _id: req.params.id };

    // Permitir que fundaciones eliminen productos de su fundación
    if (req.user.rol === 'fundacion') {
      query.fundacion = req.user.entidadRelacionada;
    }
    // Permitir que proveedores eliminen productos que ellos crearon
    else if (req.user.rol === 'proveedor') {
      query.proveedor = req.user.entidadRelacionada;
    } else {
      return res.status(403).json({ message: 'No tiene permisos para eliminar productos' });
    }

    const producto = await Producto.findOneAndDelete(query);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado o no tiene permisos para eliminarlo' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Obtener todos los productos // Actualización para la función obtenerTodosProductosdef
export const obtenerTodosProductosdef = async (req, res) => {
  try {
    const { categoria, proveedor, estado } = req.query;
    const query = {};

    // Filtro por categoría
    if (categoria) query.categoria = categoria;
    
    // Filtro por proveedor - verificar si es un ObjectId válido
    if (proveedor) {
      if (mongoose.Types.ObjectId.isValid(proveedor)) {
        query.proveedor = proveedor;
      } else {
        console.log('ID de proveedor no válido:', proveedor);
        return res.status(400).json({ message: 'ID de proveedor no válido' });
      }
    }
    
    // Filtro por estado
    if (estado) query.estado = estado;

    console.log('Consulta (todos):', query);

    const productos = await Producto.find(query)
      .populate('proveedor', 'nombre email tipoServicio')
      .populate('fundacion', 'nombre') // Añadir fundación también
      .sort({ createdAt: -1 });

    console.log(`Productos encontrados: ${productos.length}`);
    
    res.set('Cache-Control', 'no-store');
    return res.json(productos);
  } catch (error) {
    console.error('Error en obtenerTodosProductos:', error);
    res.status(500).json({ message: error.message });
  }
};


// Obtener productos por proveedor
export const obtenerProductosProveedor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Si el usuario es proveedor, obtener sus productos
    if (req.user.rol === 'proveedor') {
      const productos = await Producto.find({ 
        proveedor: req.user.entidadRelacionada,
        estado: 'activo'
      }).sort({ createdAt: -1 });
      return res.json(productos);
    }

    // Si no es proveedor, no tiene acceso
    return res.status(403).json({ message: 'No tiene permisos para ver estos productos' });
  } catch (error) {
    console.error('Error al obtener productos del proveedor:', error);
    res.status(500).json({ message: error.message });
  }
};

// Subir imagen de producto
export const subirImagenProducto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Agregar la nueva imagen al array de imágenes
    producto.imagenes.push({
      url: req.file.path,
      public_id: req.file.filename
    });

    await producto.save();
    res.json(producto);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar imagen de producto
export const eliminarImagenProducto = async (req, res) => {
  try {
    const { productoId, publicId } = req.params;
    
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar la imagen de Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Eliminar la imagen del array de imágenes del producto
    producto.imagenes = producto.imagenes.filter(img => img.public_id !== publicId);
    await producto.save();

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: error.message });
  }
};
