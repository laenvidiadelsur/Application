import express from 'express';
import {
  crearFundacion,
  obtenerFundaciones,
  obtenerFundacion,
  actualizarFundacion,
  eliminarFundacion,
  obtenerNombreFundacion,
  obtenerDetallesFundacion,
  
} from '../../controllers/mobile/fundacion.controller.js';
import auth from '../../middlewares/auth.js'; // ✅ CORRECTO

const router = express.Router();

// Rutas para fundaciones
router.post('/', crearFundacion);
router.get('/', obtenerFundaciones);
router.get('/:id', obtenerFundacion);
router.put('/:id', actualizarFundacion);
router.delete('/:id', eliminarFundacion);
router.get('/:id/nombre', obtenerNombreFundacion);

router.get('/:idFundacion/detalles', obtenerDetallesFundacion);




export default router;