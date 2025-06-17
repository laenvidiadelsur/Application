import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProveedores } from './hooks/useProveedores';
import { useProductos } from './hooks/useProductos';
import StatCard from './components/StatCard';
import QuickActions from './components/QuickActions';
import ProveedoresTable from './components/ProveedoresTable';
import ProductosTable from './components/ProductosTable';
import ProductoForm from './components/ProductoForm';
import ProveedorForm from './components/ProveedorForm';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openProductoForm, setOpenProductoForm] = useState(false);
  const [openProveedorForm, setOpenProveedorForm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);

  const {
    proveedores,
    loading: loadingProveedores,
    error: errorProveedores,
    handleAddProveedor,
    handleEditProveedor,
    handleDeleteProveedor,
    handleUploadImagen
  } = useProveedores();

  const {
    productos,
    loading: loadingProductos,
    error: errorProductos,
    handleAddProducto,
    handleUploadImagen: handleUploadImagenProductos, // Nueva función separada
    handleEditProducto,
    handleDeleteProducto
  } = useProductos();

  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('Proveedores:', proveedores);
    console.log('Productos:', productos);
  }, [proveedores, productos]);

  const handleOpenProductoForm = (producto = null) => {
    console.log('Abriendo formulario de producto:', producto);
    setSelectedProducto(producto);
    setOpenProductoForm(true);
  };

  const handleCloseProductoForm = () => {
    console.log('Cerrando formulario de producto');
    setOpenProductoForm(false);
    setSelectedProducto(null);
  };

  const handleOpenProveedorForm = (proveedor = null) => {
    console.log('Abriendo formulario de proveedor:', proveedor);
    setSelectedProveedor(proveedor);
    setOpenProveedorForm(true);
  };

  const handleCloseProveedorForm = () => {
    console.log('Cerrando formulario de proveedor');
    setOpenProveedorForm(false);
    setSelectedProveedor(null);
  };

  // Función para crear solo los datos del producto
  const handleSubmitProductoDatos = async (productoData) => {
    try {
      console.log('=== CREAR PRODUCTO (SOLO DATOS) ===');
      console.log('Producto data:', productoData);
      
      const nuevoProducto = await handleAddProducto(productoData);
      console.log('Producto creado exitosamente:', nuevoProducto);
      
      return nuevoProducto;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  };

  // Función para subir imagen del producto
  const handleSubmitProductoImagen = async (productoId, imagenFile) => {
    try {
      console.log('=== SUBIR IMAGEN DE PRODUCTO ===');
      console.log('Producto ID:', productoId);
      console.log('Imagen file:', imagenFile);
      
      const productoActualizado = await handleUploadImagenProductos(productoId, imagenFile);
      console.log('Imagen subida exitosamente:', productoActualizado);
      
      return productoActualizado;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  };

  // Función para editar producto (con o sin imagen)
  const handleSubmitProductoEdit = async (productoId, productoData, imagenFile = null) => {
    try {
      console.log('=== EDITAR PRODUCTO ===');
      console.log('Producto ID:', productoId);
      console.log('Producto data:', productoData);
      console.log('Imagen file:', imagenFile);
      
      const productoActualizado = await handleEditProducto(productoId, productoData, imagenFile);
      console.log('Producto editado exitosamente:', productoActualizado);
      
      return productoActualizado;
    } catch (error) {
      console.error('Error al editar producto:', error);
      throw error;
    }
  };

  const handleSubmitProveedor = async (proveedorData) => {
    try {
      console.log('Enviando datos del proveedor:', proveedorData);
      if (selectedProveedor) {
        await handleEditProveedor(selectedProveedor._id, proveedorData);
      } else {
        await handleAddProveedor(proveedorData);
      }
      handleCloseProveedorForm();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loadingProveedores || loadingProductos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (errorProveedores || errorProductos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert severity="error" className="max-w-md">
          {errorProveedores || errorProductos}
        </Alert>
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
              <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-gray-900">Dashboard Fundación</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <LogoutIcon className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section y Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Proveedores</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{proveedores?.length || 0}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <StoreIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Productos</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{productos?.length || 0}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <InventoryIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <nav className="space-y-2">
              <button
                onClick={() => handleOpenProveedorForm()}
                className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-green-100 text-green-600 mr-3">
                  <StoreIcon />
                </span>
                <span className="font-medium">Agregar Proveedor</span>
              </button>
              <button
                onClick={() => handleOpenProductoForm()}
                className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-600 mr-3">
                  <InventoryIcon />
                </span>
                <span className="font-medium">Agregar Producto</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tablas */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proveedores</h2>
            <ProveedoresTable
              proveedores={proveedores || []}
              loading={loadingProveedores}
              error={errorProveedores}
              onEdit={(id) => {
                const proveedor = proveedores?.find(p => p._id === id);
                handleOpenProveedorForm(proveedor);
              }}
              onDelete={handleDeleteProveedor}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
            <ProductosTable
              productos={productos || []}
              loading={loadingProductos}
              error={errorProductos}
              onEdit={(id) => {
                const producto = productos?.find(p => p._id === id);
                handleOpenProductoForm(producto);
              }}
              onDelete={handleDeleteProducto}
            />
          </div>
        </div>
      </main>

      {/* Forms */}
      <ProductoForm
        open={openProductoForm}
        onClose={handleCloseProductoForm}
        onAddProducto={handleSubmitProductoDatos}
        onEditProducto={handleSubmitProductoEdit}
        onUploadImagen={handleSubmitProductoImagen}
        initialData={selectedProducto}
        proveedores={proveedores || []}
      />
      <ProveedorForm
        open={openProveedorForm}
        onClose={handleCloseProveedorForm}
        onSubmit={handleSubmitProveedor}
        initialData={selectedProveedor}
        onUploadImagen={handleUploadImagen}
      />
    </div>
  );
};

export default Dashboard;