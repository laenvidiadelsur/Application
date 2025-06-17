// components/order/OrderTracking.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, Clock, Truck, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import DeliverySimulation from '../map/DeliverySimulation';

const OrderTracking = ({ 
  orderId, 
  orderDetails: initialOrderDetails, 
  onClose, 
  error: initialError, 
  isLoading: initialLoading, 
  onRetry 
}) => {
  const [orderDetails, setOrderDetails] = useState(initialOrderDetails);
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      'pendiente': 0,
      'procesando': 1,
      'enviado': 2,
      'entregado': 3
    };
    return steps[status] || 0;
  };

  const fetchOrderDetails = useCallback(async (showLoading = true) => {
    if (!orderId) return;
    
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No has iniciado sesión');
      }

      console.log('Fetching order details for:', orderId);
      
      const response = await fetch(`/api/ordenes/${orderId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || `Error HTTP ${response.status}`;
        } else {
          const errorText = await response.text();
          errorMessage = `Error HTTP ${response.status}: ${errorText || 'Respuesta no válida del servidor'}`;
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Respuesta no JSON recibida:', responseText);
        throw new Error('El servidor devolvió contenido no válido');
      }

      const data = await response.json();
      console.log('Order details received:', data);
      
      setOrderDetails(data.data || data);
      setLastUpdated(new Date());
      setError(null);
      
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message);
      
      if (err.message.includes('401') || err.message.includes('iniciado sesión')) {
        localStorage.removeItem('token');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [orderId]);

  // Actualización automática cada 30 segundos
  useEffect(() => {
    if (!autoRefresh || !orderId) return;

    const interval = setInterval(() => {
      fetchOrderDetails(false); // No mostrar loading en actualizaciones automáticas
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchOrderDetails, autoRefresh, orderId]);

  // Cargar datos iniciales si no los tenemos
  useEffect(() => {
    if (!orderDetails && orderId && !isLoading) {
      fetchOrderDetails();
    }
  }, [orderDetails, orderId, isLoading, fetchOrderDetails]);

  // Actualizar estado cuando se reciben nuevos datos desde props
  useEffect(() => {
    if (initialOrderDetails && initialOrderDetails !== orderDetails) {
      setOrderDetails(initialOrderDetails);
      setLastUpdated(new Date());
    }
  }, [initialOrderDetails]);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  useEffect(() => {
    setIsLoading(initialLoading);
  }, [initialLoading]);

  const handleRefresh = () => {
    fetchOrderDetails(true);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      fetchOrderDetails(true);
    }
  };

  const StatusIcon = ({ status, isActive, isCompleted }) => {
    const iconClass = `w-6 h-6 ${isCompleted ? 'text-green-600' : isActive ? 'text-orange-600' : 'text-gray-400'}`;
    
    switch (status) {
      case 'pendiente':
        return <Clock className={iconClass} />;
      case 'procesando':
        return <Package className={iconClass} />;
      case 'enviado':
        return <Truck className={iconClass} />;
      case 'entregado':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const trackingSteps = [
    {
      status: 'pendiente',
      title: 'Pedido Recibido',
      description: 'Tu pedido ha sido recibido y está pendiente de procesamiento'
    },
    {
      status: 'procesando',
      title: 'Procesando',
      description: 'Tu pedido está siendo preparado por el proveedor'
    },
    {
      status: 'enviado',
      title: 'Enviado',
      description: 'Tu pedido está en camino a tu dirección'
    },
    {
      status: 'entregado',
      title: 'Entregado',
      description: 'Pedido entregado'
    }
  ];

  const currentStep = orderDetails ? getStatusStep(orderDetails.estadoEnvio) : 0;
  const currentStatus = orderDetails?.estadoEnvio || 'pendiente';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Seguimiento de Pedido</h2>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Actualizar estado"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-1"
                />
                Auto-actualizar
              </label>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Error de conexión</h3>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Cargando...' : 'Intentar nuevamente'}
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !orderDetails && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Cargando información del pedido...</span>
            </div>
          )}

          {/* Order Info */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Número de Pedido:</h3>
                <p className="text-lg font-semibold text-gray-900">{orderId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado actual:</h3>
                <p className="text-lg font-semibold text-orange-600 capitalize">{currentStatus}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {orderDetails?.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Última actualización:</h3>
                  <p className="text-sm text-gray-700">{formatDate(orderDetails.updatedAt)}</p>
                </div>
              )}
              {lastUpdated && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Consultado:</h3>
                  <p className="text-sm text-gray-700">{formatDate(lastUpdated)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Pedido</h3>
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={step.status}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-orange-50 border border-orange-200' 
                        : isCompleted 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-600' 
                        : isActive 
                        ? 'bg-orange-600' 
                        : 'bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <StatusIcon 
                          status={step.status} 
                          isActive={isActive} 
                          isCompleted={isCompleted} 
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isActive 
                          ? 'text-orange-800' 
                          : isCompleted 
                          ? 'text-green-800'
                          : 'text-gray-600'
                      }`}>
                        {step.title}
                        {isActive && <span className="ml-2 text-sm">(Actual)</span>}
                      </h4>
                      <p className={`text-sm ${
                        isActive 
                          ? 'text-orange-700' 
                          : isCompleted 
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      {/* Mostrar el tracking solo cuando el estado es 'enviado' y es el paso activo */}
                      {step.status === 'enviado' && isActive && (
                        <div className="mt-4">
                          <DeliverySimulation />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details */}
          {orderDetails?.direccionEnvio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles de Entrega</h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Dirección:</span>
                    <p className="text-gray-900">{orderDetails.direccionEnvio.direccion}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ciudad:</span>
                    <p className="text-gray-900">{orderDetails.direccionEnvio.ciudad}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado:</span>
                    <p className="text-gray-900">{orderDetails.direccionEnvio.estado}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Código Postal:</span>
                    <p className="text-gray-900">{orderDetails.direccionEnvio.codigoPostal}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contacto:</span>
                      <p className="text-gray-900">{orderDetails.direccionEnvio.nombreCompleto}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                      <p className="text-gray-900">{orderDetails.direccionEnvio.telefono}</p>
                    </div>
                  </div>
                  {orderDetails.usuario?.email && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-gray-900">{orderDetails.usuario.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">Debug Info:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Estado: {currentStatus}</p>
                <p>Paso actual: {currentStep}</p>
                <p>Orden ID: {orderId}</p>
                {orderDetails?.updatedAt && (
                  <p>Última actualización: {formatDate(orderDetails.updatedAt)}</p>
                )}
                {lastUpdated && (
                  <p>Consultado: {formatDate(lastUpdated)}</p>
                )}
                {error && <p className="text-red-600">Error: {error}</p>}
                <p>Auto-refresh: {autoRefresh ? 'Activado' : 'Desactivado'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Estado'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
            >
              Cerrar Seguimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;