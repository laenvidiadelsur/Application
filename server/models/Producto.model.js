import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  unidad: {
    type: String,
    required: true,
    enum: ['kg', 'unidad', 'litro', 'metro']
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    enum: ['materiales', 'equipos','alimentos','gaseosas', 'otros']
  },
  imagenes: [{
    url: String,
    public_id: String
  }],
  proveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proveedor',
    required: true
  },
  fundacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fundacion',
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las búsquedas
productoSchema.index({ nombre: 1 });
productoSchema.index({ categoria: 1 });
productoSchema.index({ proveedor: 1 });
productoSchema.index({ fundacion: 1 });

const Producto = mongoose.models.Producto || mongoose.model('Producto', productoSchema);

export default Producto; 