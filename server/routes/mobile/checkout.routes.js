import express from 'express';
import { createCheckout, getAllCheckouts, getCheckoutsByReceiverId, getCheckoutById, getCheckoutsByFoundationId, getFundraisingStats } from '../../controllers/mobile/checkout.controller.js';

const router = express.Router();

// Rutas específicas primero
router.post('/', createCheckout);
router.get('/', getAllCheckouts);
router.get('/receiver', getCheckoutsByReceiverId);
router.get('/por-fundacion', getCheckoutsByFoundationId);

// Ruta dinámica al final
router.get('/:id', getCheckoutById);

router.get('/stats/fundraising', getFundraisingStats);


export default router;
