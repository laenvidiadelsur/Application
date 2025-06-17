import express from 'express';
import {
  crearProveedor,
  obtenerProveedores,
  obtenerProveedor,
  actualizarProveedor,
  eliminarProveedor,
  actualizarEstadoProveedor,
  subirImagenProveedor,
  eliminarImagenProveedor
} from '../controllers/proveedor.controller.js';
import auth from '../middlewares/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Rutas para proveedores
router.post('/', auth, crearProveedor);
router.get('/', auth, obtenerProveedores);
router.get('/:id', auth, obtenerProveedor);
router.put('/:id', auth, actualizarProveedor);
router.put('/:id/estado', auth, actualizarEstadoProveedor);
router.delete('/:id', auth, eliminarProveedor);

// Rutas para imágenes de proveedores
router.post('/:id/imagen', auth, upload.single('imagen'), subirImagenProveedor);
router.delete('/:proveedorId/imagen/:publicId', auth, eliminarImagenProveedor);

export default router;