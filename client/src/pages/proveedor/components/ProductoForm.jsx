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
  Grid,
  Alert
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

const ProductoForm = ({
  open,
  onClose,
  onAddProducto,
  onEditProducto, // Nueva prop para editar
  onUploadImagen,
  selectedProducto, // Producto a editar (null para crear nuevo)
  productoCreado,
  imagenFile,
  setImagenFile
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    unidad: '',
    stock: '',
    categoria: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determinar si estamos editando o creando
  const isEditing = selectedProducto && selectedProducto._id;

  // Cargar datos del producto cuando se selecciona para editar
  useEffect(() => {
    if (isEditing) {
      setFormData({
        nombre: selectedProducto.nombre || '',
        descripcion: selectedProducto.descripcion || '',
        precio: selectedProducto.precio || '',
        unidad: selectedProducto.unidad || '',
        stock: selectedProducto.stock || '',
        categoria: selectedProducto.categoria || ''
      });
    } else {
      // Limpiar formulario para nuevo producto
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        unidad: '',
        stock: '',
        categoria: ''
      });
    }
  }, [selectedProducto, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagenFile(null);
  };

  const handleSubmitDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validar que todos los campos estén llenos
      if (!formData.nombre || !formData.descripcion || !formData.precio || 
          !formData.unidad || !formData.stock || !formData.categoria) {
        setError('Todos los campos son requeridos');
        return;
      }

      if (isEditing) {
        // Editar producto existente
        await onEditProducto(selectedProducto._id, formData);
        // Cerrar el formulario después de editar
        handleClose();
      } else {
        // Crear nuevo producto con imagen si existe
        await onAddProducto(formData, imagenFile);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 
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

      const productoId = isEditing ? selectedProducto._id : productoCreado?._id;
      
      if (!productoId) {
        setError('No se pudo identificar el producto');
        return;
      }

      // Subir la imagen
      await onUploadImagen(productoId, imagenFile);
      
      // Limpiar formulario y cerrar
      handleClose();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      unidad: '',
      stock: '',
      categoria: ''
    });
    setImagenFile(null);
    setError('');
    onClose();
  };

  // Determinar el título del diálogo
  const getDialogTitle = () => {
    if (isEditing) {
      return `Editar Producto: ${selectedProducto.nombre}`;
    }
    return 'Nuevo Producto';
  };

  const showDataForm = true; 
  const showImageSection = true; 

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Mostrar éxito si el producto fue creado (solo para nuevos productos) */}
          {!isEditing && productoCreado && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Producto "{productoCreado.nombre}" creado exitosamente. 
              Ahora puede agregar una imagen.
            </Alert>
          )}

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
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <FormControl fullWidth required>
                  <InputLabel>Unidad</InputLabel>
                  <Select
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleChange}
                    label="Unidad"
                    disabled={loading}
                  >
                    <MenuItem value="kg">Kilogramo (kg)</MenuItem>
                    <MenuItem value="unidad">Unidad</MenuItem>
                    <MenuItem value="litro">Litro</MenuItem>
                    <MenuItem value="metro">Metro</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    label="Categoría"
                    disabled={loading}
                  >
                    <MenuItem value="materiales">Materiales</MenuItem>
                    <MenuItem value="equipos">Equipos</MenuItem>
                    <MenuItem value="alimentos">Alimentos</MenuItem>
                    <MenuItem value="gaseosas">Gaseosas</MenuItem>
                    <MenuItem value="otros">Otros</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          )}

          {/* Sección de imagen */}
          {showImageSection && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Imagen del Producto (Opcional)
              </Typography>
              
              {/* Mostrar imagen actual si existe (solo en modo edición) */}
              {isEditing && selectedProducto.imagenes && selectedProducto.imagenes.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Imagen actual:
                  </Typography>
                  <img
                    src={selectedProducto.imagenes[0].url}
                    alt={selectedProducto.nombre}
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
        
        {/* Botón para subir imagen (solo para productos ya creados o en edición) */}
        {showImageSection && !showDataForm && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitImagen}
            disabled={loading || !imagenFile}
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