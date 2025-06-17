import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.model.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = usuario;
    next();
  } catch (error) {
    console.error('Error en verifyToken:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const isProveedor = (req, res, next) => {
  if (req.user && req.user.rol === 'proveedor') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de proveedor.' });
  }
};

export const isFundacion = (req, res, next) => {
  if (req.user && req.user.rol === 'fundacion') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de fundación.' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
}; 