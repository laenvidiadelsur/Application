import mongoose from 'mongoose';

const proveedorSchema = new mongoose.Schema({
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
  tipoServicio: {
    type: String,
    required: true
  },
  fundacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fundacion',
    required: true
  },
  imagenes: [{
    url: String,
    public_id: String
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Referencia virtual a los productos del proveedor
proveedorSchema.virtual('productos', {
  ref: 'Producto',
  localField: '_id',
  foreignField: 'proveedor'
});

// Verificar si el modelo ya existe antes de crearlo
const Proveedor = mongoose.models.Proveedor || mongoose.model('Proveedor', proveedorSchema);

export default Proveedor;