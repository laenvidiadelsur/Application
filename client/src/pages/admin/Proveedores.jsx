import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Divider,
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
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div 
    className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        {subtitle && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
            {subtitle}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [fundaciones, setFundaciones] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
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
    fundacion: null
  });
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    unidad: '',
    stock: '',
    categoria: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchProveedores();
    fetchFundaciones();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/proveedores');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError(error.response?.data?.message || 'Error al cargar los proveedores');
      showSnackbar('Error al cargar los proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFundaciones = async () => {
    try {
      const response = await axios.get('/fundaciones');
      setFundaciones(response.data);
    } catch (error) {
      console.error('Error al cargar fundaciones:', error);
      showSnackbar('Error al cargar las fundaciones', 'error');
    }
  };

  const handleOpenDialog = (proveedor = null) => {
    if (proveedor) {
      setFormData(proveedor);
      setSelectedProveedor(proveedor);
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
        fundacion: null
      });
      setSelectedProveedor(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProveedor(null);
  };

  const handleOpenProductDialog = (producto = null) => {
    if (producto) {
      setProductoForm({
        ...producto,
        _id: producto._id
      });
    } else {
      setProductoForm({
        nombre: '',
        descripcion: '',
        precio: '',
        unidad: '',
        stock: '',
        categoria: '',
        _id: null
      });
    }
    setOpenProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProductoInputChange = (e) => {
    setProductoForm({
      ...productoForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProveedor) {
        await axios.put(`/proveedores/${selectedProveedor._id}`, formData);
        showSnackbar('Proveedor actualizado correctamente');
      } else {
        if (!formData.fundacion) {
          showSnackbar('Debe seleccionar una fundación', 'error');
          return;
        }

        const proveedorData = {
          ...formData,
          fundacion: formData.fundacion
        };

        await axios.post('/proveedores', proveedorData);
        showSnackbar('Proveedor creado correctamente');
      }
      handleCloseDialog();
      fetchProveedores();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      if (error.response?.data?.camposFaltantes) {
        const campos = Object.entries(error.response.data.camposFaltantes)
          .filter(([_, faltante]) => faltante)
          .map(([campo]) => campo);
        showSnackbar(`Faltan campos requeridos: ${campos.join(', ')}`, 'error');
      } else {
        showSnackbar(error.response?.data?.message || 'Error al guardar el proveedor', 'error');
      }
    }
  };

  const handleProductoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedProveedor) {
        showSnackbar('Debe seleccionar un proveedor', 'error');
        return;
      }

      const productoData = {
        ...productoForm,
        proveedor: selectedProveedor._id
      };

      if (productoForm._id) {
        await axios.put(`${API_URL}/productos/${productoForm._id}`, productoData);
        showSnackbar('Producto actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/productos`, productoData);
        showSnackbar('Producto creado correctamente');
      }

      handleCloseProductDialog();
      fetchProveedores();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      showSnackbar(error.response?.data?.message || 'Error al guardar el producto', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        await axios.delete(`/proveedores/${id}`);
        showSnackbar('Proveedor eliminado correctamente');
        fetchProveedores();
      } catch (error) {
        showSnackbar('Error al eliminar el proveedor', 'error');
      }
    }
  };

  const handleDeleteProducto = async (productoId) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await axios.delete(`${API_URL}/productos/${productoId}`);
        showSnackbar('Producto eliminado correctamente');
        fetchProveedores();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        showSnackbar(error.response?.data?.message || 'Error al eliminar el producto', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
                <span className="ml-2 text-xl font-semibold text-gray-900">Proveedores</span>
              </div>
            </div>
            <button
              onClick={() => handleOpenDialog()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Nuevo Proveedor
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Proveedores"
            value={proveedores.length}
            icon={BusinessIcon}
            color="blue"
            subtitle="Proveedores registrados"
          />
          <StatCard
            title="Fundaciones"
            value={new Set(proveedores.map(p => p.fundacion?._id)).size}
            icon={LocationIcon}
            color="green"
            subtitle="Fundaciones asociadas"
          />
          <StatCard
            title="Productos"
            value={proveedores.reduce((acc, p) => acc + (p.productos?.length || 0), 0)}
            icon={InventoryIcon}
            color="yellow"
            subtitle="Total de productos"
          />
          <StatCard
            title="Categorías"
            value={new Set(proveedores.map(p => p.tipoServicio)).size}
            icon={CategoryIcon}
            color="purple"
            subtitle="Tipos de servicios"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[60vh] bg-white rounded-xl shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="flex justify-center items-center min-h-[60vh] bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No hay proveedores registrados</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fundación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proveedores.map((proveedor) => (
                    <React.Fragment key={proveedor._id}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRow(proveedor._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BusinessIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{proveedor.nombre}</span>
                            {expandedRows[proveedor._id] ? <ExpandLessIcon className="ml-2" /> : <ExpandMoreIcon className="ml-2" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{proveedor.nit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            proveedor.fundacion ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {proveedor.fundacion?.nombre || 'Sin fundación'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <PhoneIcon className="w-4 h-4 text-yellow-600 mr-2" />
                              <span className="text-sm text-gray-500">{proveedor.telefono}</span>
                            </div>
                            <div className="flex items-center">
                              <EmailIcon className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="text-sm text-gray-500">{proveedor.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {proveedor.productos?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(proveedor);
                              }}
                              className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                            >
                              <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(proveedor._id);
                              }}
                              className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                            >
                              <DeleteIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[proveedor._id] && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-900">Productos</h3>
                                <button
                                  onClick={() => handleOpenProductDialog()}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                  <AddIcon className="w-4 h-4 mr-1" />
                                  Nuevo Producto
                                </button>
                              </div>
                              {proveedor.productos?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {proveedor.productos.map((producto) => (
                                    <div 
                                      key={producto._id}
                                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-medium text-gray-900">{producto.nombre}</h4>
                                        <div className="flex space-x-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenProductDialog(producto);
                                            }}
                                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                                          >
                                            <EditIcon className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteProducto(producto._id);
                                            }}
                                            className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                                          >
                                            <DeleteIcon className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{producto.descripcion}</p>
                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                          <MoneyIcon className="w-4 h-4 text-green-600 mr-1" />
                                          <span className="text-sm text-gray-900">${producto.precio}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <CartIcon className="w-4 h-4 text-blue-600 mr-1" />
                                          <span className="text-sm text-gray-900">
                                            {producto.stock} {producto.unidad}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No hay productos registrados</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Dialog Proveedor */}
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
          {selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
            />
            <TextField
              fullWidth
              label="NIT"
              name="nit"
              value={formData.nit}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              required
              className="md:col-span-2"
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!selectedProveedor}
              helperText={selectedProveedor ? "Dejar en blanco para mantener la contraseña actual" : ""}
            />
            <TextField
              fullWidth
              label="Nombre del Representante"
              name="representante.nombre"
              value={formData.representante.nombre}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="CI del Representante"
              name="representante.ci"
              value={formData.representante.ci}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Tipo de Servicio</InputLabel>
              <Select
                name="tipoServicio"
                value={formData.tipoServicio}
                onChange={handleInputChange}
                label="Tipo de Servicio"
              >
                <MenuItem value="materiales">Materiales</MenuItem>
                <MenuItem value="equipos">Equipos</MenuItem>
                <MenuItem value="servicios">Servicios</MenuItem>
                <MenuItem value="otros">Otros</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Fundación</InputLabel>
              <Select
                name="fundacion"
                value={formData.fundacion}
                onChange={handleInputChange}
                label="Fundación"
              >
                {fundaciones.map((fundacion) => (
                  <MenuItem key={fundacion._id} value={fundacion._id}>
                    {fundacion.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            {selectedProveedor ? 'Actualizar' : 'Crear'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Dialog Producto */}
      <Dialog 
        open={openProductDialog} 
        onClose={handleCloseProductDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-lg"
        }}
      >
        <DialogTitle className="border-b border-gray-200 px-6 py-4">
          {productoForm._id ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={productoForm.nombre}
              onChange={handleProductoInputChange}
              required
              className="md:col-span-2"
            />
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={productoForm.descripcion}
              onChange={handleProductoInputChange}
              multiline
              rows={2}
              className="md:col-span-2"
            />
            <TextField
              fullWidth
              label="Precio"
              name="precio"
              type="number"
              value={productoForm.precio}
              onChange={handleProductoInputChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Unidad</InputLabel>
              <Select
                name="unidad"
                value={productoForm.unidad}
                onChange={handleProductoInputChange}
                label="Unidad"
              >
                <MenuItem value="kg">Kilogramo (kg)</MenuItem>
                <MenuItem value="unidad">Unidad</MenuItem>
                <MenuItem value="litro">Litro</MenuItem>
                <MenuItem value="metro">Metro</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Stock"
              name="stock"
              type="number"
              value={productoForm.stock}
              onChange={handleProductoInputChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="categoria"
                value={productoForm.categoria}
                onChange={handleProductoInputChange}
                label="Categoría"
              >
                <MenuItem value="materiales">Materiales</MenuItem>
                <MenuItem value="equipos">Equipos</MenuItem>
                <MenuItem value="servicios">Servicios</MenuItem>
                <MenuItem value="otros">Otros</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleCloseProductDialog}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            onClick={handleProductoSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {productoForm._id ? 'Actualizar' : 'Agregar'}
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

export default Proveedores; 