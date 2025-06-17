import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { useFundaciones } from './hooks/useFundaciones';
import StatCard from './components/StatCard';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  const defaultPosition = [-17.7833, -63.1821]; // Santa Cruz, Bolivia

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker 
      position={position} 
      draggable={true} 
      eventHandlers={{
        dragend: (e) => {
          setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]);
        },
      }} 
    />
  ) : (
    <Marker 
      position={defaultPosition} 
      draggable={true} 
      eventHandlers={{
        dragend: (e) => {
          setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]);
        },
      }} 
    />
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en el componente:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">Algo salió mal</h2>
          <p className="text-red-600">Por favor, intenta recargar la página</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const Fundaciones = () => {
  const navigate = useNavigate();
  const {
    fundaciones,
    openDialog,
    editingFundacion,
    formData,
    errors,
    snackbar,
    loading,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleSubmit,
    handleDelete,
  } = useFundaciones();

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '8px',
    marginTop: '8px'
  };

  const defaultCenter = [-17.7833, -63.1821]; // Santa Cruz, Bolivia

  // Función para validar coordenadas
  const isValidCoordinates = (coords) => {
    return Array.isArray(coords) && 
           coords.length === 2 && 
           typeof coords[0] === 'number' && 
           typeof coords[1] === 'number';
  };

  // Obtener coordenadas válidas
  const getValidCoordinates = () => {
    if (formData.location && isValidCoordinates(formData.location)) {
      return formData.location;
    }
    return defaultCenter;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <ArrowBackIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="ml-2 text-xl font-semibold text-gray-900">Fundaciones</span>
              </div>
            </div>
            <button
              onClick={() => handleOpenDialog()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Nueva Fundación
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Fundaciones"
            value={fundaciones.length}
            icon={BusinessIcon}
            color="blue"
            subtitle="Fundaciones registradas"
          />
          <StatCard
            title="Ubicaciones"
            value={new Set(fundaciones.map(f => f.areaAccion)).size}
            icon={LocationIcon}
            color="green"
            subtitle="Áreas de acción únicas"
          />
          <StatCard
            title="Contactos"
            value={fundaciones.length}
            icon={PhoneIcon}
            color="yellow"
            subtitle="Fundaciones con contacto"
          />
          <StatCard
            title="Emails"
            value={fundaciones.length}
            icon={EmailIcon}
            color="purple"
            subtitle="Fundaciones con email"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fundaciones.map((fundacion) => (
                  <tr key={fundacion._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BusinessIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{fundacion.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <LocationIcon className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm text-gray-500">{fundacion.direccion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-gray-500">{fundacion.telefono}</span>
                        </div>
                        <div className="flex items-center">
                          <EmailIcon className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="text-sm text-gray-500">{fundacion.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 line-clamp-2">{fundacion.descripcion}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenDialog(fundacion)}
                          className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fundacion._id)}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-lg"
        }}
      >
        <DialogTitle className="border-b border-gray-200 px-6 py-4">
          {editingFundacion ? 'Editar Fundación' : 'Nueva Fundación'}
        </DialogTitle>
        <DialogContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              error={errors.nombre}
              helperText={errors.nombre ? 'El nombre es requerido' : ''}
            />
            <TextField
              fullWidth
              label="NIT"
              name="nit"
              value={formData.nit}
              onChange={handleInputChange}
              required
              error={errors.nit}
              helperText={errors.nit ? 'El NIT es requerido' : ''}
            />
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              required
              error={errors.direccion}
              helperText={errors.direccion ? 'La dirección es requerida' : ''}
              className="md:col-span-2"
            />
            <div className="md:col-span-2">
              <Box className="flex items-center mb-2">
                <MyLocationIcon className="text-primary-600 mr-2" />
                <Typography variant="h6" className="text-gray-900">
                  Ubicación en el Mapa
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" className="mb-2">
                Haga clic en el mapa para seleccionar la ubicación exacta de la fundación
              </Typography>
              <div style={mapContainerStyle}>
                <MapContainer
                  center={getValidCoordinates()}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  key={`map-${getValidCoordinates().join(',')}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker 
                    position={getValidCoordinates()} 
                    setPosition={(newPosition) => handleInputChange({ target: { name: 'location', value: newPosition } })}
                  />
                </MapContainer>
              </div>
              {errors.location && (
                <Typography variant="caption" color="error" className="mt-1">
                  {errors.location}
                </Typography>
              )}
              <Box className="mt-2">
                <Typography variant="body2">
                  Coordenadas seleccionadas: {isValidCoordinates(formData.location) 
                    ? `${formData.location[0].toFixed(6)}, ${formData.location[1].toFixed(6)}` 
                    : 'No seleccionada'}
                </Typography>
              </Box>
            </div>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
              error={errors.telefono}
              helperText={errors.telefono ? 'El teléfono es requerido' : ''}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              error={errors.email}
              helperText={errors.email ? 'El email es requerido' : ''}
            />
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Representante</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Nombre del Representante"
                  name="representante.nombre"
                  value={formData.representante.nombre}
                  onChange={handleInputChange}
                  required
                  error={errors.representante}
                  helperText={errors.representante ? 'El nombre del representante es requerido' : ''}
                />
                <TextField
                  fullWidth
                  label="CI del Representante"
                  name="representante.ci"
                  value={formData.representante.ci}
                  onChange={handleInputChange}
                  required
                  error={errors.representante}
                  helperText={errors.representante ? 'El CI del representante es requerido' : ''}
                />
              </div>
            </div>
            <TextField
              fullWidth
              label="Misión"
              name="mision"
              value={formData.mision}
              onChange={handleInputChange}
              required
              error={errors.mision}
              helperText={errors.mision ? 'La misión es requerida' : ''}
              multiline
              rows={2}
              className="md:col-span-2"
            />
            <TextField
              fullWidth
              label="Área de Acción"
              name="areaAccion"
              value={formData.areaAccion}
              onChange={handleInputChange}
              required
              error={errors.areaAccion}
              helperText={errors.areaAccion ? 'El área de acción es requerida' : ''}
              className="md:col-span-2"
            />
            <TextField
              fullWidth
              label="Cuenta Bancaria"
              name="cuentaBancaria"
              value={formData.cuentaBancaria}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Logo (URL)"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
            />
            {!editingFundacion && (
              <TextField
                fullWidth
                label="Contraseña del Administrador"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                error={errors.password}
                helperText={errors.password ? 'La contraseña es requerida' : 'Esta contraseña será utilizada por el administrador de la fundación'}
                className="md:col-span-2"
              />
            )}
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              multiline
              rows={3}
              className="md:col-span-2"
            />
          </div>
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleCloseDialog}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {editingFundacion ? 'Actualizar' : 'Crear'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
          snackbar.severity === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="text-sm font-medium">{snackbar.message}</p>
        </div>
      )}
    </div>
  );
};

// Wrap the entire component with ErrorBoundary
export default function FundacionesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Fundaciones />
    </ErrorBoundary>
  );
} 