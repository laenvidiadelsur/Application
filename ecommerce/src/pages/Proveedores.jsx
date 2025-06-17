import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useProveedores } from "../hooks/useProveedores";
import { useState } from "react";
import { Home } from "lucide-react";

const Proveedores = () => {
  const { proveedores, loading, error } = useProveedores();
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState({});

  const handleNavigateToProducts = (proveedor) => {
    console.log('Navegando a productos del proveedor:', proveedor);
    navigate(`/products?proveedorId=${proveedor._id}`);
  };

  const handleImageError = (proveedorId) => {
    setImageErrors(prev => ({
      ...prev,
      [proveedorId]: true
    }));
  };

  const handleImageLoad = (proveedorId) => {
    setImageErrors(prev => ({
      ...prev,
      [proveedorId]: false
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-orange-100 transition-colors"
              title="Volver al inicio"
            >
              <Home className="w-6 h-6 text-orange-500" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Proveedores
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 mt-16">
        <div className="max-w-7xl mx-auto">
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
          ) : proveedores.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <p className="text-xl text-gray-600 mb-4">No hay proveedores disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {proveedores.map((prov) => (
                <div
                  key={prov._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-orange-300 transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleNavigateToProducts(prov)}
                >
                  {/* Contenedor de imagen mejorado */}
                  <div className="relative w-full h-52 overflow-hidden">
                    {prov.imagenes && prov.imagenes.length > 0 && !imageErrors[prov._id] ? (
                      <>
                        <img
                          src={prov.imagenes[0].url}
                          alt={prov.nombre}
                          className="w-full h-full object-contain bg-white transition-all duration-500 group-hover:scale-105"
                          onError={() => handleImageError(prov._id)}
                          onLoad={() => handleImageLoad(prov._id)}
                          loading="lazy"
                        />
                        {/* Overlay sutil en hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      /* Placeholder mejorado */
                      <div className="w-full h-full bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex flex-col items-center justify-center text-orange-500 relative">
                        {/* Patrón de fondo decorativo */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-orange-300 rounded-full"></div>
                          <div className="absolute top-8 right-6 w-4 h-4 bg-orange-200 rounded-full"></div>
                          <div className="absolute bottom-6 left-8 w-6 h-6 border-2 border-amber-300 rounded-full"></div>
                          <div className="absolute bottom-4 right-4 w-3 h-3 bg-amber-200 rounded-full"></div>
                        </div>
                        
                        {/* Icono principal */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-orange-600">
                            {prov.nombre}
                          </span>
                          <span className="text-xs text-orange-400 mt-1">
                            Logo no disponible
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido de la tarjeta */}
                  <div className="p-5">
                    {/* Nombre del proveedor */}
                    <h2 className="text-lg font-bold text-gray-900 text-center mb-2 line-clamp-1">
                      {prov.nombre}
                    </h2>
                    
                    {/* Tipo de servicio con badge */}
                    <div className="flex justify-center mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                        {prov.tipoServicio}
                      </span>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="text-xs text-gray-500 text-center mb-3 space-y-1">
                      {prov.representante?.nombre && (
                        <div className="flex items-center justify-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span>{prov.representante.nombre}</span>
                        </div>
                      )}
                      {prov.telefono && (
                        <div className="flex items-center justify-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span>{prov.telefono}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Descripción */}
                    <p className="text-xs text-gray-600 text-center mb-4 line-clamp-2 min-h-[2.5rem]">
                      {prov.descripcion || 'Proveedor de productos de alta calidad y excelente servicio.'}
                    </p>
                    
                    {/* Botón de acción mejorado */}
                    <button
                      className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-sm ${
                        prov.estado === 'rechazado'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-200 hover:shadow-lg'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (prov.estado !== 'rechazado') {
                          handleNavigateToProducts(prov);
                        }
                      }}
                      disabled={prov.estado === 'rechazado'}
                    >
                      {prov.estado === 'rechazado' ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          No disponible
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Ver productos
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Proveedores;