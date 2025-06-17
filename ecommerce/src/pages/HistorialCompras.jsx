import React, { useEffect, useState } from "react";
import { Receipt, ShoppingCart, Calendar, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import OrderTracking from "../components/order/OrderTracking";

const HistorialCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No has iniciado sesión');
      }

      const response = await fetch('/api/ordenes/usuario', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }

      const data = await response.json();
      
      // FIX: Extract the data array from the response object
      // The backend returns { success: true, data: [...], count: ... }
      if (data.success && Array.isArray(data.data)) {
        setCompras(data.data);
      } else if (Array.isArray(data)) {
        // Fallback in case the backend returns an array directly
        setCompras(data);
      } else {
        // If neither case, set empty array to prevent errors
        console.warn('Unexpected response format:', data);
        setCompras([]);
      }
    } catch (err) {
      setError(err.message);
      setCompras([]); // Ensure compras is always an array
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'procesando':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'enviado':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'entregado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
          <Button
            onClick={fetchOrders}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Receipt className="w-8 h-8 text-[#0f172a]" />
        <h2 className="text-2xl font-bold text-[#0f172a]">Historial de Compras</h2>
      </div>

      {compras.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No tienes compras registradas aún.
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map((compra) => (
            <div
              key={compra._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Orden #{compra.numeroOrden}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(compra.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(compra.estadoEnvio)}
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {compra.estadoEnvio}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(compra.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado de Pago</p>
                    <p className="text-sm font-medium capitalize text-gray-700">
                      {compra.estadoPago}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedOrder(compra)}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                  >
                    Ver Seguimiento
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderTracking
          orderId={selectedOrder._id}
          orderDetails={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default HistorialCompras;