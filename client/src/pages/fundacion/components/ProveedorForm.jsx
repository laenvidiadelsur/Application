import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Store as StoreIcon,
  MyLocation as MyLocationIcon,
  PhotoCamera,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const tiposServicio = [
  'Alimentos',
  'Materiales de construcción',
  'Equipos médicos',
  'Ropa y textiles',
  'Productos de limpieza',
  'Otros'
];

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} draggable={true} eventHandlers={{
    dragend: (e) => {
      setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]);
    },
  }} /> : null;
};

const ProveedorForm = ({ open, onClose, onSubmit, initialData, onUploadImagen }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    password: '',
    representante: {
      nombre: '',
      ci: ''
    },
    tipoServicio: '',
    fundacion: user?.entidadRelacionada || '',
    location: [-17.7833, -63.1821]
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [proveedorCreado, setProveedorCreado] = useState(null);
  const [showDataForm, setShowDataForm] = useState(true);
  const [showImageSection, setShowImageSection] = useState(true);

  const isEditing = initialData && initialData._id;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialData,
          location: initialData.location || [-17.7833, -63.1821],
          password: '' // No mostrar contraseña existente
        });
      } else {
        setFormData({
          nombre: '',
          nit: '',
          direccion: '',
          telefono: '',
          email: '',
          password: '',
          representante: {
            nombre: '',
            ci: ''
          },
          tipoServicio: '',
          fundacion: user?.entidadRelacionada || '',
          location: [-17.7833, -63.1821]
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [initialData, open, user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.nit?.trim()) newErrors.nit = 'El NIT es requerido';
    if (!formData.direccion?.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!isEditing && !formData.password?.trim()) {
      newErrors.password = 'La contraseña es requerida para nuevos proveedores';
    }
    if (!formData.tipoServicio?.trim()) newErrors.tipoServicio = 'El tipo de servicio es requerido';
    if (!formData.representante?.nombre?.trim()) newErrors['representante.nombre'] = 'El nombre del representante es requerido';
    if (!formData.representante?.ci?.trim()) newErrors['representante.ci'] = 'La cédula del representante es requerida';
    if (!formData.location || formData.location.length !== 2) newErrors.location = 'Debe seleccionar una ubicación en el mapa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('representante.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        representante: {
          ...prev.representante,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error cuando el campo se modifica
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Limpiar error de submit también
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleMapClick = (newPosition) => {
    setFormData(prev => ({
      ...prev,
      location: newPosition
    }));
    
    // Limpiar error de ubicación
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: undefined
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image selected:', file.name, file.size);
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setSubmitError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      setImagenFile(file);
      setSubmitError('');
    }
  };

  const handleRemoveImage = () => {
    setImagenFile(null);
  };

  const handleSubmitDatos = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar datos para envío
      const submitData = {
        ...formData,
        fundacion: user?.entidadRelacionada
      };

      const resultado = await onSubmit(submitData);
      
      if (isEditing) {
        // Si estamos editando, cerrar el formulario
        handleClose();
      } else {
        // Si estamos creando y hay imagen, cambiar a modo imagen
        setProveedorCreado(resultado);
        if (imagenFile) {
          setShowDataForm(false);
          setShowImageSection(true);
        } else {
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.response?.data?.message || error.message || 'Error al guardar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitImagen = async () => {
    try {
      setLoading(true);
      setSubmitError('');
      
      if (!imagenFile) {
        setSubmitError('Debe seleccionar una imagen');
        return;
      }

      const proveedorId = isEditing ? initialData._id : proveedorCreado?._id;
      
      if (!proveedorId) {
        setSubmitError('No se pudo identificar el proveedor');
        return;
      }

      console.log('Uploading image for proveedor:', proveedorId);
      
      // Subir la imagen
      const formData = new FormData();
      formData.append('imagen', imagenFile);
      await onUploadImagen(proveedorId, formData);
      
      // Cerrar formulario
      handleClose();
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: '',
      password: '',
      representante: {
        nombre: '',
        ci: ''
      },
      tipoServicio: '',
      fundacion: user?.entidadRelacionada || '',
      location: [-17.7833, -63.1821]
    });
    setImagenFile(null);
    setErrors({});
    setSubmitError('');
    setProveedorCreado(null);
    setShowDataForm(true);
    setShowImageSection(true);
    onClose();
  };

  const getDialogTitle = () => {
    if (isEditing) {
      return `Editar Proveedor: ${initialData?.nombre || 'Sin nombre'}`;
    }
    if (proveedorCreado && !showDataForm) {
      return `Agregar Imagen: ${proveedorCreado.nombre}`;
    }
    return 'Nuevo Proveedor';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* Mostrar éxito si el proveedor fue creado */}
          {!isEditing && proveedorCreado && !showDataForm && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Proveedor "{proveedorCreado.nombre}" creado exitosamente. 
              {imagenFile ? 'Ahora puede subir la imagen.' : 'Puede cerrar este diálogo o agregar una imagen.'}
            </Alert>
          )}

          {/* Formulario de datos */}
          {showDataForm && (
            <>
              {/* Información de la Empresa */}
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Nombre de la Empresa"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
                <TextField
                  fullWidth
                  label="NIT"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!errors.nit}
                  helperText={errors.nit}
                />
              </Box>

              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                disabled={loading}
                multiline
                rows={2}
                error={!!errors.direccion}
                helperText={errors.direccion}
              />

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!errors.telefono}
                  helperText={errors.telefono}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Box>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  disabled={loading}
                  error={!!errors.password}
                  helperText={isEditing ? 'Dejar en blanco para mantener la contraseña actual' : errors.password}
                />
                <FormControl fullWidth required error={!!errors.tipoServicio}>
                  <InputLabel>Tipo de Servicio</InputLabel>
                  <Select
                    name="tipoServicio"
                    value={formData.tipoServicio}
                    onChange={handleChange}
                    label="Tipo de Servicio"
                    disabled={loading}
                  >
                    {tiposServicio.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipoServicio && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.tipoServicio}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Información del Representante */}
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Representante Legal
              </Typography>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Nombre del Representante"
                  name="representante.nombre"
                  value={formData.representante?.nombre || ''}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!errors['representante.nombre']}
                  helperText={errors['representante.nombre']}
                />
                <TextField
                  fullWidth
                  label="CI del Representante"
                  name="representante.ci"
                  value={formData.representante?.ci || ''}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!errors['representante.ci']}
                  helperText={errors['representante.ci']}
                />
              </Box>

              {/* Ubicación en el Mapa */}
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <MyLocationIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1">
                    Ubicación en el Mapa
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Haga clic en el mapa para seleccionar la ubicación exacta del proveedor
                </Typography>
                
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 300, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    border: errors.location ? '1px solid #f44336' : '1px solid #e0e0e0'
                  }}
                >
                  <MapContainer
                    center={formData.location}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker 
                      position={formData.location} 
                      setPosition={handleMapClick}
                    />
                  </MapContainer>
                </Box>
                
                {errors.location && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.location}
                  </Typography>
                )}
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Coordenadas seleccionadas: {formData.location[0].toFixed(6)}, {formData.location[1].toFixed(6)}
                </Typography>
              </Box>
            </>
          )}

          {/* Sección de imagen */}
          {showImageSection && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Imagen del Proveedor (Opcional)
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
              (isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor')
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

export default ProveedorForm;