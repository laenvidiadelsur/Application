import Usuario from '../models/Usuario.model.js';
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcrypt';

// Registrar un nuevo usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, entidadRelacionada } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol,
      entidadRelacionada,
      rolModel: rol === 'fundacion' ? 'Fundacion' : rol === 'proveedor' ? 'Proveedor' : null
    });

    // Generar token JWT
    const token = generateToken(usuario._id);

    const response = {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token
    };
    if (usuario.entidadRelacionada) {
      response.entidadRelacionada = usuario.entidadRelacionada;
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Autenticar usuario
export const autenticarUsuario = async (req, res) => {
  try {
    const { email, password, rol } = req.body;
    console.log('Intento de login:', { email, rol });
    
    const usuario = await Usuario.findOne({ email });
    console.log('Usuario encontrado:', usuario ? { 
      _id: usuario._id, 
      email: usuario.email, 
      rol: usuario.rol,
      activo: usuario.activo 
    } : 'No encontrado');
    
    if (!usuario || !(await usuario.matchPassword(password))) {
      console.log('Fallo de autenticación: credenciales inválidas');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      console.log('Fallo de autenticación: usuario inactivo');
      return res.status(401).json({ message: 'Usuario desactivado' });
    }

    if (rol && usuario.rol !== rol) {
      console.log('Fallo de autenticación: rol incorrecto', { rolSolicitado: rol, rolUsuario: usuario.rol });
      return res.status(403).json({ message: 'No tienes permisos para este rol' });
    }

    const token = generateToken(usuario._id);
    console.log('Login exitoso, token generado');

    const response = {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token
    };
    if (usuario.entidadRelacionada) {
      response.entidadRelacionada = usuario.entidadRelacionada;
    }

    // Si el cliente pide formato e-commerce (por header, query, etc.)
    if (req.headers['x-client'] === 'ecommerce') {
      res.json({ user: response, token: response.token });
    } else {
      res.json(response);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener perfil de usuario
export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user._id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar perfil de usuario
export const actualizarPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    usuario.nombre = req.body.nombre || usuario.nombre;
    usuario.email = req.body.email || usuario.email;
    
    if (req.body.password) {
      usuario.password = req.body.password;
    }
    
    const usuarioActualizado = await usuario.save();
    
    res.json({
      _id: usuarioActualizado._id,
      nombre: usuarioActualizado.nombre,
      email: usuarioActualizado.email,
      rol: usuarioActualizado.rol
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Crear usuario admin al iniciar (solo en desarrollo)
export const crearAdminInicial = async () => {
  try {
    const adminExiste = await Usuario.findOne({ email: "admin@gmail.com" });
    if (!adminExiste) {
      const admin = await Usuario.create({
        nombre: "Administrador",
        email: "admin@gmail.com",
        password:"1234", // Contraseña más segura
        rol: "admin",
        activo: true
      });
      console.log("✅ Usuario admin creado exitosamente");
      return admin;
    }
    console.log("ℹ️ Usuario admin ya existe");
    return adminExiste;
  } catch (error) {
    console.error("❌ Error creando admin:", error.message);
    throw error;
  }
};

// No ejecutar automáticamente, se llamará desde el archivo principal
// crearAdminInicial();

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Actualizar campos
    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    usuario.rol = rol || usuario.rol;
    usuario.activo = activo !== undefined ? activo : usuario.activo;

    // Si se proporciona una nueva contraseña, actualizarla
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(req.body.password, salt);
    }

    await usuario.save();

    res.json({
      msg: 'Usuario actualizado correctamente',
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ msg: 'Error al actualizar el usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // No permitir eliminar el último administrador
    if (usuario.rol === 'admin') {
      const adminCount = await Usuario.countDocuments({ rol: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ msg: 'No se puede eliminar el último administrador' });
      }
    }

    await Usuario.findByIdAndDelete(id);

    res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ msg: 'Error al eliminar el usuario' });
  }
};