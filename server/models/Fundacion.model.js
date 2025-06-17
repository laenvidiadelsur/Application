import mongoose from 'mongoose';

const fundacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  nit: {
    type: String,
    required: true,
    unique: true
  },
  direccion: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  representante: {
    nombre: {
      type: String,
      required: true
    },
    ci: {
      type: String,
      required: true
    }
  },
  mision: {
    type: String,
    required: true
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now
  },
  areaAccion: {
    type: String,
    required: true
  },
  cuentaBancaria: {
    type: String
  },
  logo: {
    type: String
  },
  descripcion: {
    type: String
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Verificar si el modelo ya existe antes de crearlo
const Fundacion = mongoose.models.Fundacion || mongoose.model('Fundacion', fundacionSchema);

export default Fundacion;