import express from 'express';
import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
  transferirCarrito,
  obtenerResumenCarrito,
  crearPaymentIntent,
  confirmarPago,
  webhookStripe
} from '../controllers/carrito.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Webhook de Stripe (sin auth, debe ir antes que body parser)
router.post('/webhook-stripe', express.raw({ type: 'application/json' }), webhookStripe);

// Rutas del carrito
router.get('/', auth, obtenerCarrito);
router.post('/agregar', auth, agregarAlCarrito);
router.put('/actualizar/:productoId', auth, actualizarCantidadCarrito);
router.delete('/eliminar/:productoId', auth, eliminarDelCarrito);
router.delete('/vaciar', auth, vaciarCarrito);
router.post('/transferir', auth, transferirCarrito);
router.get('/resumen', auth, obtenerResumenCarrito);

// Rutas de pago con Stripe
router.post('/crear-pago', auth, crearPaymentIntent);
router.post('/confirmar-pago', auth, confirmarPago);

export default router;