import express from 'express';
import {
  crearProveedor,
  obtenerProveedores,
  obtenerProveedor,
  actualizarProveedor,
  eliminarProveedor,
  actualizarEstadoProveedor,
  obtenerTodosLosProveedores
} from '../../controllers/mobile/proveedor.controller.js';

const router = express.Router();

// Rutas para proveedores (sin middleware auth)
router.post('/', crearProveedor);
router.get('/', obtenerProveedores);
router.get('/obtenerTodosLosProveedores', obtenerTodosLosProveedores);

router.get('/:id', obtenerProveedor);
router.put('/:id', actualizarProveedor);
router.put('/:id/estado', actualizarEstadoProveedor);
router.delete('/:id', eliminarProveedor);

export default router;
