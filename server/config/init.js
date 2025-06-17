import { crearAdminInicial } from '../controllers/usuario.controller.js';

export const initializeApp = async () => {
  try {
    // Crear usuario admin si no existe
    await crearAdminInicial();
    console.log('✅ Inicialización completada');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
}; 