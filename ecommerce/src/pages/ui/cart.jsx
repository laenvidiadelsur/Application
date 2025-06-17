import { useState } from 'react';
import { X, CreditCard, ShoppingCart, Plus, Minus } from 'lucide-react';
import PaymentForm from './PaymentForm';

const Cart = ({ cart, onRemoveFromCart, onUpdateQuantity, isOpen, onClose }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    onClose();
    // Aquí podrías agregar la lógica para marcar los productos como vendidos
  };

  const handleQuantityChange = (productId, change) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        onUpdateQuantity(productId, newQuantity);
      }
    }
  };

  // Botón flotante del carrito
  const CartButton = () => (
    <button
      onClick={() => onClose()}
      className="fixed bottom-4 right-4 bg-[#0f172a] text-white p-4 rounded-full shadow-lg hover:bg-[#1e293b] transition z-40 flex items-center gap-2"
    >
      <ShoppingCart className="w-6 h-6" />
      {cart.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      )}
    </button>
  );

  if (!isOpen) return <CartButton />;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0f172a]">Carrito de Compras</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {showPaymentForm ? (
          <PaymentForm
            onClose={() => setShowPaymentForm(false)}
            onSuccess={handlePaymentSuccess}
            total={calculateTotal().toFixed(2)}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow duration-300">
                      <div className="flex-1">
                        <h3 className="font-medium text-[#0f172a]">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          ${item.price} por {item.unit}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-1 bg-gray-100 rounded min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-sm text-gray-600 ml-2">
                            = ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(index)}
                        className="text-red-500 hover:text-red-600 transition ml-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Artículos:</span>
                  <span className="text-sm text-gray-600">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-[#0f172a]">Total:</span>
                  <span className="font-bold text-[#0f172a]">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full bg-[#0f172a] text-white py-3 rounded-lg hover:bg-[#1e293b] transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceder al Pago
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;