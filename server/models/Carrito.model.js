// server/models/Carrito.model.js
import mongoose from 'mongoose';

const carritoItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const carritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [carritoItemSchema],
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['activo', 'procesando', 'completado', 'abandonado'],
    default: 'activo'
  },
  fechaExpiracion: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
  },
  sessionId: {
    type: String, // Para usuarios no autenticados
    sparse: true
  }
}, {
  timestamps: true
});

// Middleware para calcular totales antes de guardar
carritoSchema.pre('save', function(next) {
  // Calcular subtotales de cada item
  this.items.forEach(item => {
    item.subtotal = item.cantidad * item.precioUnitario;
  });
  
  // Calcular total del carrito
  this.total = this.items.reduce((total, item) => total + item.subtotal, 0);
  
  next();
});

// Método para agregar producto al carrito
carritoSchema.methods.agregarProducto = function(producto, cantidad = 1) {
  const itemExistente = this.items.find(item => 
    item.producto.toString() === producto._id.toString()
  );
  
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
    itemExistente.precioUnitario = producto.precio;
  } else {
    this.items.push({
      producto: producto._id,
      cantidad,
      precioUnitario: producto.precio,
      subtotal: cantidad * producto.precio
    });
  }
  
  return this.save();
};

// Método para actualizar cantidad de un producto
carritoSchema.methods.actualizarCantidad = function(productoId, nuevaCantidad) {
  const item = this.items.find(item => 
    item.producto.toString() === productoId.toString()
  );
  
  if (item) {
    if (nuevaCantidad <= 0) {
      this.items = this.items.filter(item => 
        item.producto.toString() !== productoId.toString()
      );
    } else {
      item.cantidad = nuevaCantidad;
    }
  }
  
  return this.save();
};

// Método para eliminar producto del carrito
carritoSchema.methods.eliminarProducto = function(productoId) {
  this.items = this.items.filter(item => 
    item.producto.toString() !== productoId.toString()
  );
  
  return this.save();
};

// Método para vaciar el carrito
carritoSchema.methods.vaciarCarrito = function() {
  this.items = [];
  this.total = 0;
  return this.save();
};

// Índices para mejorar el rendimiento
carritoSchema.index({ usuario: 1 });
carritoSchema.index({ sessionId: 1 });
carritoSchema.index({ estado: 1 });
carritoSchema.index({ fechaExpiracion: 1 }, { expireAfterSeconds: 0 });

const Carrito = mongoose.models.Carrito || mongoose.model('Carrito', carritoSchema);

export default Carrito;