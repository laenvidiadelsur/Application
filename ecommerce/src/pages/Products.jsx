import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCarritoAvanzado } from "../hooks/useCarritoAvanzado";
import { Button } from "../components/ui/button";
import { Heart, ShoppingCart, Filter, Plus, Check, History } from "lucide-react";
import CarritoMejorado from "../components/carrito/CarritoMejorado";
import 'react-toastify/dist/ReactToastify.css';

const ProductosProveedor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const proveedorId = searchParams.get('proveedorId');
  const [proveedorInfo, setProveedorInfo] = useState(null);
  
  // Usar el hook modificado pasando el proveedorId
  const {
    products,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    categories,
    priceRanges,
    clearFilters,
    handleAddToCart,
    handleToggleFavorite,
    favorites,
    notification
  } = useProducts(proveedorId);

  // Hook del carrito
  const {
    cantidadItems,
    setIsCartOpen,
    agregarConNotificacion,
    estaEnCarrito,
    getCantidadEnCarrito,
    actualizarCantidad
  } = useCarritoAvanzado();

  // Obtener información del proveedor
  useEffect(() => {
    const fetchProveedorInfo = async () => {
      if (!proveedorId) return;
      
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
        
        const response = await fetch(`${API_URL}/proveedores/${proveedorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProveedorInfo(data);
          console.log('Información del proveedor:', data);
        } else {
          console.error('Error al obtener proveedor:', response.status);
        }
      } catch (error) {
        console.error("Error al obtener información del proveedor:", error);
      }
    };

    fetchProveedorInfo();
  }, [proveedorId]);

  const handleAddToCartWithNotification = async (product) => {
    await agregarConNotificacion(product, 1);
  };

  if (!proveedorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Proveedor no especificado
          </h2>
          <Button onClick={() => navigate('/proveedores')}>
            Volver a Proveedores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Notificación */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/proveedores')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver a Proveedores
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {proveedorInfo?.nombre || 'Productos del Proveedor'}
              </h1>
              {proveedorInfo && (
                <p className="text-sm text-gray-500">
                  {proveedorInfo.tipoServicio}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/historial-compras')}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 transition-colors duration-300"
          >
            <History className="w-4 h-4" />
            Ver mis pedidos
          </Button>
        </div>
      </header>

      {/* Filtros */}
      <div className="px-4 py-6 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {/* Filtro de Categoría */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Filtro de Precio */}
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
              <p className="text-xl mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
              >
                Reintentar
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <p className="text-xl text-gray-600 mb-4">
                Este proveedor no tiene productos disponibles
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Proveedor ID: {proveedorId}
              </p>
              <Button onClick={() => navigate('/proveedores')}>
                Ver Otros Proveedores
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-gray-600">
                Mostrando {products.length} productos de {proveedorInfo?.nombre || 'este proveedor'}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => {
                  const enCarrito = estaEnCarrito(product.id);
                  const cantidadEnCarrito = getCantidadEnCarrito(product.id);
                  
                  return (
                    <div
                      key={product.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-2xl hover:border-orange-400 border border-gray-100 transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Imagen del producto */}
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover transition-all duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=Sin+Imagen";
                          }}
                        />
                        
                        {/* Botón de favoritos */}
                        <button
                          onClick={() => handleToggleFavorite(product)}
                          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.some(fav => fav.id === product.id)
                                ? 'text-red-500 fill-current'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>

                        {/* Badge de stock */}
                        {product.stock > 0 && (
                          <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-bold text-orange-600">
                            ${product.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            por {product.unit}
                          </span>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center justify-between pt-2">
                          {enCarrito ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  actualizarCantidad(
                                    product.id,
                                    getCantidadEnCarrito(product.id) + 1
                                  );
                                }}
                                disabled={product.stock === 0}
                                className="flex-1 border-gray-200 hover:bg-gray-50 transition-colors duration-300"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar más
                              </Button>
                              <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                <Check className="w-4 h-4" />
                                {cantidadEnCarrito}
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAddToCartWithNotification(product)}
                              disabled={product.stock <= 0}
                              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                            >
                              {product.stock > 0 ? (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Agregar al Carrito
                                </>
                              ) : (
                                'Sin Stock'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Componente del carrito */}
      <CarritoMejorado />
    </div>
  );
};

export default ProductosProveedor;