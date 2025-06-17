import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

const unidades = ['kg', 'unidad', 'litro', 'metro'];
const categorias = ['materiales', 'equipos', 'alimentos', 'gaseosas', 'otros'];

const ProductoForm = ({
  open,
  onClose,
  onAddProducto,
  onEditProducto,
  onUploadImagen,
  initialData,
  proveedores
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    unidad: '',
    stock: '',
    categoria: '',
    proveedor: '',
    estado: 'activo'
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productoCreado, setProductoCreado] = useState(null);

  // Determinar si estamos editando o creando
  const isEditing = initialData && initialData._id;

  // Estados del formulario
  const [showDataForm, setShowDataForm] = useState(true);
  const [showImageSection, setShowImageSection] = useState(true);

  useEffect(() => {
    console.log('=== PRODUCTO FORM PROPS ===');
    console.log('open:', open);
    console.log('isEditing:', isEditing);
    console.log('initialData:', initialData);
    console.log('proveedores:', proveedores?.length);

    if (open) {
      if (isEditing) {
        // Modo edición: mostrar datos del producto existente
        setFormData({
          nombre: initialData.nombre || '',
          descripcion: initialData.descripcion || '',
          precio: initialData.precio ? initialData.precio.toString() : '',
          unidad: initialData.unidad || '',
          stock: initialData.stock ? initialData.stock.toString() : '',
          categoria: initialData.categoria || '',
          proveedor: initialData.proveedor?._id || initialData.proveedor || '',
          estado: initialData.estado || 'activo'
        });
        setShowDataForm(true);
        setShowImageSection(true);
        setProductoCreado(null);
      } else {
        // Modo creación: formulario limpio
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          unidad: '',
          stock: '',
          categoria: '',
          proveedor: '',
          estado: 'activo'
        });
        setShowDataForm(true);
        setShowImageSection(true);
        setProductoCreado(null);
      }
      setImagenFile(null);
      setError('');
    }
  }, [open, isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field change: ${name} = "${value}"`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image selected:', file.name, file.size);
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      setImagenFile(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImagenFile(null);
  };

  const validateForm = () => {
    const requiredFields = ['nombre', 'descripcion', 'precio', 'unidad', 'stock', 'categoria', 'proveedor'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || value.toString().trim() === '';
    });
    
    if (missingFields.length > 0) {
      setError(`Los siguientes campos son requeridos: ${missingFields.join(', ')}`);
      return false;
    }

    // Validar precio
    const precio = parseFloat(formData.precio);
    if (isNaN(precio) || precio <= 0) {
      setError('El precio debe ser un número mayor a 0');
      return false;
    }

    // Validar stock
    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      setError('El stock debe ser un número mayor o igual a 0');
      return false;
    }

    return true;
  };

  const handleSubmitDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('=== SUBMITTING DATOS ===');
      console.log('Form data:', formData);
      
      if (!validateForm()) {
        return;
      }

      // Preparar datos limpios
      const formDataToSubmit = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (isEditing) {
        // Editar producto existente
        console.log('Editing existing producto...');
        await onEditProducto(initialData._id, formDataToSubmit, imagenFile);
        handleClose();
      } else {
        // Crear nuevo producto (solo datos)
        console.log('Creating new producto...');
        const nuevoProducto = await onAddProducto(formDataToSubmit);
        console.log('Producto created:', nuevoProducto);
        
        setProductoCreado(nuevoProducto);
        
        // Si no hay imagen, cerrar el formulario
        if (!imagenFile) {
          handleClose();
        } else {
          // Cambiar a modo "subir imagen"
          setShowDataForm(false);
          setShowImageSection(true);
        }
      }
      
    } catch (err) {
      console.error('Error submitting datos:', err);
      setError(err.response?.data?.message || err.message ||
        (isEditing ? 'Error al actualizar el producto' : 'Error al crear el producto'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitImagen = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!imagenFile) {
        setError('Debe seleccionar una imagen');
        return;
      }

      const productoId = isEditing ? initialData._id : productoCreado?._id;
      
      if (!productoId) {
        setError('No se pudo identificar el producto');
        return;
      }

      console.log('Uploading image for producto:', productoId);
      
      // Subir la imagen
      await onUploadImagen(productoId, imagenFile);
      
      // Cerrar formulario
      handleClose();
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.message || err.message || 'Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('Closing form...');
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      unidad: '',
      stock: '',
      categoria: '',
      proveedor: '',
      estado: 'activo'
    });
    setImagenFile(null);
    setError('');
    setProductoCreado(null);
    setShowDataForm(true);
    setShowImageSection(true);
    onClose();
  };

  const getDialogTitle = () => {
    if (isEditing) {
      return `Editar Producto: ${initialData?.nombre || 'Sin nombre'}`;
    }
    if (productoCreado && !showDataForm) {
      return `Agregar Imagen: ${productoCreado.nombre}`;
    }
    return 'Nuevo Producto';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Mostrar éxito si el producto fue creado */}
          {!isEditing && productoCreado && !showDataForm && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Producto "{productoCreado.nombre}" creado exitosamente. 
              {imagenFile ? 'Ahora puede subir la imagen.' : 'Puede cerrar este diálogo o agregar una imagen.'}
            </Alert>
          )}

          {/* Debug info */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              Modo: {isEditing ? 'Editando' : 'Creando'} | 
              Proveedores: {proveedores?.length || 0} | 
              Proveedor seleccionado: "{formData.proveedor}"
            </Typography>
          </Alert>

          {/* Formulario de datos */}
          {showDataForm && (
            <>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!formData.nombre.trim() && error.includes('nombre')}
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!formData.descripcion.trim() && error.includes('descripcion')}
                />
              </Box>
              
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Precio"
                  name="precio"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={(!formData.precio || parseFloat(formData.precio) <= 0) && error.includes('precio')}
                />
                <FormControl fullWidth required error={!formData.unidad && error.includes('unidad')}>
                  <InputLabel>Unidad</InputLabel>
                  <Select
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleChange}
                    label="Unidad"
                    disabled={loading}
                  >
                    {unidades.map((unidad) => (
                      <MenuItem key={unidad} value={unidad}>
                        {unidad.charAt(0).toUpperCase() + unidad.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={(!formData.stock || parseInt(formData.stock) < 0) && error.includes('stock')}
                />
                <FormControl fullWidth required error={!formData.categoria && error.includes('categoria')}>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    label="Categoría"
                    disabled={loading}
                  >
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth required error={!formData.proveedor && error.includes('proveedor')}>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  label="Proveedor"
                  disabled={loading}
                >
                  {proveedores?.length > 0 ? (
                    proveedores.map((proveedor) => (
                      <MenuItem key={proveedor._id} value={proveedor._id}>
                        {proveedor.nombre}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No hay proveedores disponibles
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </>
          )}

          {/* Sección de imagen */}
          {showImageSection && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Imagen del Producto (Opcional)
              </Typography>
              
              {/* Mostrar imagen actual si existe (solo en modo edición) */}
              {isEditing && initialData?.imagenes && initialData.imagenes.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Imagen actual:
                  </Typography>
                  <img
                    src={initialData.imagenes[0].url}
                    alt={initialData.nombre}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCamera />}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {isEditing ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {imagenFile && (
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="textSecondary">
                    {imagenFile.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}

              {/* Preview de la nueva imagen */}
              {imagenFile && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Vista previa:
                  </Typography>
                  <img
                    src={URL.createObjectURL(imagenFile)}
                    alt="Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        
        {/* Botón para guardar datos */}
        {showDataForm && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitDatos}
            disabled={loading}
          >
            {loading ? 
              (isEditing ? 'Actualizando...' : 'Creando...') : 
              (isEditing ? 'Actualizar Producto' : 'Crear Producto')
            }
          </Button>
        )}
        
        {/* Botón para subir imagen (solo cuando se está en modo imagen únicamente) */}
        {!showDataForm && showImageSection && imagenFile && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitImagen}
            disabled={loading}
          >
            {loading ? 'Subiendo...' : 'Subir Imagen'}
          </Button>
        )}
        
        {/* Botón para subir imagen cuando se está editando */}
        {isEditing && imagenFile && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSubmitImagen}
            disabled={loading}
          >
            {loading ? 'Subiendo...' : 'Actualizar Imagen'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductoForm;