import express from 'express';
import {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto,
  getAllProducts,
  getSortedProducts,
  getProductsByCategory,
  getSingleProduct,
  obtenerTodosLosProductos,
  getAllProductsByProveedorId
} from '../../controllers/mobile/producto.controller.js';
import auth from '../../middlewares/auth.js'; // ✅ CORRECTO


const router = express.Router();

// Rutas protegidas (requieren auth)
router.post('/', crearProducto);
router.get('/', obtenerProductos);
router.get('/ByFoundationid', getAllProductsByProveedorId);

router.get('/todos', obtenerTodosLosProductos);

router.get('/:id', getSingleProduct);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);





export default router;
