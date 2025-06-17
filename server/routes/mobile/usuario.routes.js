import express from 'express';
import {
  registrarUsuario,
  autenticarUsuario,
  obtenerPerfil,
  actualizarPerfil
} from '../../controllers/mobile/usuario.controller.js';
import auth from '../../middlewares/auth.js'; // ✅ CORRECTO



const router = express.Router();

// Rutas para usuarios
router.post('/registro', registrarUsuario);
router.post('/login', autenticarUsuario);
router.get('/perfil', obtenerPerfil);
router.put('/perfil', actualizarPerfil);

export default router;