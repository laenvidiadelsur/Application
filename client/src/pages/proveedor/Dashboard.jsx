import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Alert,
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
  Typography,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Category as CategoryIcon,
  PhotoCamera,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductosTable from './components/ProductosTable';
import ProductoForm from './components/ProductoForm';
import OrdenesView from './components/OrdenesView';
import { useProductos } from './hooks/useProductos';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openProductoForm, setOpenProductoForm] = useState(false);
  const [openOrdenesView, setOpenOrdenesView] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Estados para el flujo de creación de productos
  const [productoCreado, setProductoCreado] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);

  const {
    productos,
    loading: loadingProductos,
    error: errorProductos,
    handleAddProducto,
    handleUploadImagen,
    handleEditProducto,
    handleDeleteProducto,
    refreshProductos
  } = useProductos();

  useEffect(() => {
    console.log('Dashboard Proveedor mounted');
    console.log('Productos:', productos);
  }, [productos]);

  const handleOpenProductoForm = (producto = null) => {
    setSelectedProducto(producto);
    setProductoCreado(null); // Resetear el producto creado
    setImagenFile(null); // Resetear la imagen
    setOpenProductoForm(true);
  };

  const handleCloseProductoForm = () => {
    setOpenProductoForm(false);
    setSelectedProducto(null);
    setProductoCreado(null);
    setImagenFile(null);
  };

  // Manejar la creación del producto (solo datos)
  const handleCreateProducto = async (productoData, imagenFile) => {
    try {
      console.log('Creando producto con datos:', productoData);
      const nuevoProducto = await handleAddProducto(productoData);
      
      // Si hay una imagen, subirla inmediatamente
      if (imagenFile) {
        await handleUploadImagen(nuevoProducto._id, imagenFile);
        showSnackbar('Producto creado e imagen subida correctamente');
      } else {
        showSnackbar('Producto creado correctamente');
      }
      
      // Refrescar la lista de productos
      await refreshProductos();
      
      // Cerrar el formulario
      handleCloseProductoForm();
    } catch (error) {
      console.error('Error al crear producto:', error);
      showSnackbar(error.response?.data?.message || 'Error al crear el producto', 'error');
    }
  };

  // Manejar la subida de imagen
  const handleImageUpload = async (productoId, imagenFile) => {
    try {
      console.log('Subiendo imagen para producto:', productoId);
      await handleUploadImagen(productoId, imagenFile);
      showSnackbar('Imagen subida correctamente');
      
      // Refrescar la lista de productos para mostrar la imagen actualizada
      await refreshProductos();
      
      // Cerrar el formulario
      handleCloseProductoForm();
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showSnackbar(error.response?.data?.message || 'Error al subir la imagen', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showSnackbar('Error al cerrar sesión', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
    
    // Auto-hide después de 3 segundos
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 3000);
  };

  const handleDeleteProductoClick = async (productoId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await handleDeleteProducto(productoId);
        showSnackbar('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        showSnackbar(error.response?.data?.message || 'Error al eliminar el producto', 'error');
      }
    }
  };

  const handleUpdateProducto = async (productoId, productoData) => {
    try {
      console.log('Editando producto:', productoId, productoData);
      await handleEditProducto(productoId, productoData);
      showSnackbar('Producto actualizado correctamente');
      
      // Refrescar la lista de productos
      await refreshProductos();
    } catch (error) {
      console.error('Error al editar producto:', error);
      showSnackbar(error.response?.data?.message || 'Error al editar el producto', 'error');
    }
  };

  if (loadingProductos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (errorProductos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert severity="error" className="max-w-md">
          {errorProductos}
        </Alert>
      </div>
    );
  }

  const categoryCounts = productos?.reduce((acc, producto) => {
    acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
    return acc;
  }, {});

  const totalStock = productos?.reduce((acc, producto) => acc + Number(producto.stock), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <InventoryIcon className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Dashboard Proveedor</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setOpenOrdenesView(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ReceiptIcon className="w-5 h-5 mr-2" />
                Ver Órdenes
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogoutIcon className="w-5 h-5 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <StatCard
            title="Total Productos"
            value={productos?.length || 0}
            icon={InventoryIcon}
            color="blue"
            subtitle="Productos registrados"
          />
          <StatCard
            title="Stock Total"
            value={totalStock || 0}
            icon={CartIcon}
            color="green"
            subtitle="Unidades disponibles"
          />
          <StatCard
            title="Categorías"
            value={Object.keys(categoryCounts || {}).length}
            icon={CategoryIcon}
            color="purple"
            subtitle="Tipos de productos"
          />
        </div>

        {/* Productos Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Mis Productos</h2>
              <button
                onClick={() => handleOpenProductoForm()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <AddIcon className="w-5 h-5 mr-2" />
                Nuevo Producto
              </button>
            </div>
          </div>
          
          {productos?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay productos registrados
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {productos.map((producto) => (
                <div
                  key={producto._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
                >
                  {/* Imagen del producto */}
                  {producto.imagenes && producto.imagenes.length > 0 ? (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={producto.imagenes[0].url}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                      <PhotoCamera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{producto.nombre}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenProductoForm(producto)}
                        className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProductoClick(producto._id)}
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
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {producto.categoria}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Producto Form Dialog */}
      <ProductoForm
        open={openProductoForm}
        onClose={handleCloseProductoForm}
        onAddProducto={handleCreateProducto}
        onEditProducto={handleUpdateProducto}
        onUploadImagen={handleImageUpload}
        selectedProducto={selectedProducto}
        productoCreado={productoCreado}
        imagenFile={imagenFile}
        setImagenFile={setImagenFile}
      />

      {/* Ordenes View Dialog */}
      <OrdenesView
        open={openOrdenesView}
        onClose={() => setOpenOrdenesView(false)}
      />

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
          snackbar.severity === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="text-sm font-medium">{snackbar.message}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;