import DeliverySimulation from '../components/map/DeliverySimulation';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function DeliveryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [isDeliveryComplete, setIsDeliveryComplete] = useState(false);

  const handleDeliveryComplete = () => {
    setIsDeliveryComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Simulación de Entrega
            </h1>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Productos</span>
            </button>
          </div>

          {isDeliveryComplete ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                ¡Pedido Entregado con Éxito!
              </h2>
              <p className="text-gray-600 mb-6">
                Gracias por tu compra. Tu pedido ha sido entregado correctamente.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Productos</span>
              </button>
            </div>
          ) : (
            <DeliverySimulation
              deliveryAddress={order?.direccionEnvio}
              contactInfo={order?.datosContacto}
              orderId={order?._id}
              onDeliveryComplete={handleDeliveryComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
