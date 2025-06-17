import express from 'express';
import {
  registrarUsuario,
  autenticarUsuario,
  obtenerPerfil,
  actualizarPerfil,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuario.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Rutas para usuarios
router.post('/registro', registrarUsuario);
router.post('/login', autenticarUsuario);
router.get('/perfil', auth, obtenerPerfil);
router.put('/perfil', auth, actualizarPerfil);
router.get('/', auth, obtenerUsuarios);
router.put('/:id', auth, actualizarUsuario);
router.delete('/:id', auth, eliminarUsuario);

export default router;