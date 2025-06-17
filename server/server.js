import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { crearAdminInicial } from './controllers/usuario.controller.js';

dotenv.config();

const PORT = process.env.PORT || 5003;

// Conectar a la base de datos
//connectDB();

mongoose.connect(process.env.MONGO_URI, { /* opciones */ })
  .then(async () => {
    console.log('MongoDB Connected...');
    await crearAdminInicial();
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

    // Manejar errores no capturados
    process.on('unhandledRejection', (err, promise) => {
      console.error(`Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
  });