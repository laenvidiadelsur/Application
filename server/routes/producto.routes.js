import express from 'express';
import {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerTodosProductosdef,
  obtenerProductosProveedor,
  subirImagenProducto,
  eliminarImagenProducto
} from '../controllers/producto.controller.js';
import { upload } from '../config/cloudinary.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Rutas para productos
router.post('/', auth, crearProducto);
router.get('/', auth, obtenerProductos);
router.get('/todos', auth, obtenerTodosProductosdef);
router.get('/proveedor', auth, obtenerProductosProveedor);
router.get('/:id', auth, obtenerProducto);
router.put('/:id', auth, actualizarProducto);
router.delete('/:id', auth, eliminarProducto);

// Rutas para imágenes de productos
router.post('/:id/imagen', auth, upload.single('imagen'), subirImagenProducto);
router.delete('/:productoId/imagen/:publicId', auth, eliminarImagenProducto);

export default router; 