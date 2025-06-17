import { verifyToken } from '../config/jwt.js';
import Usuario from '../models/Usuario.model.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = verifyToken(token);
    const usuario = await Usuario.findById(decoded.id);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (!usuario.activo) {
      throw new Error('Usuario desactivado');
    }

    req.user = usuario;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export default auth;