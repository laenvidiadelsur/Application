import express from 'express';
import {
  crearFundacion,
  obtenerFundaciones,
  obtenerFundacion,
  actualizarFundacion,
  eliminarFundacion
} from '../controllers/fundacion.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Rutas para fundaciones
router.post('/', auth, crearFundacion);
router.get('/', obtenerFundaciones);
router.get('/:id', obtenerFundacion);
router.put('/:id', auth, actualizarFundacion);
router.delete('/:id', auth, eliminarFundacion);

export default router;