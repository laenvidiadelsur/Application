import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCarrito } from '../../context/CarritoContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

const CheckoutForm = ({ onSuccess, total, desglose, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { crearPago, confirmarPago } = useCarrito();

  const [datosEnvio, setDatosEnvio] = useState({
    nombre: '',
    email: '',
    telefono: '',
    calle: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    latitud: '-17.7863',
    longitud: '-63.1812'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('info'); // info, payment, success

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosEnvio((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 'info') {
      const requiredFields = ['nombre', 'email', 'telefono', 'calle', 'ciudad', 'estado', 'codigoPostal'];
      const missingFields = requiredFields.filter((campo) => !datosEnvio[campo]);

      if (missingFields.length > 0) {
        setError('Por favor completa todos los campos');
        return;
      }

      setError(null);
      setStep('payment');
      return;
    }

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const pagoResult = await crearPago({
        direccionEnvio: {
          calle: datosEnvio.calle,
          ciudad: datosEnvio.ciudad,
          estado: datosEnvio.estado,
          codigoPostal: datosEnvio.codigoPostal,
          latitud: datosEnvio.latitud,
          longitud: datosEnvio.longitud
        },
        datosContacto: {
          nombre: datosEnvio.nombre,
          email: datosEnvio.email,
          telefono: datosEnvio.telefono,
        },
      });

      if (!pagoResult.success) {
        setError(pagoResult.message);
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(pagoResult.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: datosEnvio.nombre,
            email: datosEnvio.email,
            phone: datosEnvio.telefono,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        const confirmResult = await confirmarPago(pagoResult.ordenId, result.paymentIntent.id);

        if (confirmResult.success) {
          toast.success('¡Pago realizado con éxito!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          setStep('success');
          onSuccess(confirmResult.orden);
        } else {
          setError(confirmResult.message);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          ¡Pago Exitoso!
        </h2>
        <p className="text-gray-600 mb-4">Tu compra ha sido procesada correctamente.</p>
        <button
          onClick={() => onClose()}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-2 rounded-xl transition-all duration-300"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {step === 'info' ? 'Información de Envío' : 'Información de Pago'}
        </h2>
        <button 
          onClick={onClose} 
          type="button" 
          className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
        >
          ✕
        </button>
      </div>

      {step === 'info' && (
        <>
          {['nombre', 'email', 'telefono', 'calle', 'ciudad', 'estado', 'codigoPostal'].map((campo, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{campo}</label>
              <input
                type={campo === 'email' ? 'email' : 'text'}
                name={campo}
                value={datosEnvio[campo]}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm"
                required
              />
            </div>
          ))}
        </>
      )}

      {step === 'payment' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datos de la Tarjeta
            </label>
            <div className="px-3 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent bg-white shadow-sm">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>${desglose.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío:</span>
              <span>{desglose.envio === 0 ? 'Gratis' : `$${desglose.envio.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mt-auto pt-4">
        <button
          type="submit"
          disabled={loading || (step === 'payment' && !stripe)}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
          {step === 'info' ? 'Continuar al Pago' : `Pagar $${total.toFixed(2)}`}
        </button>

        {step === 'payment' && (
          <button
            type="button"
            onClick={() => setStep('info')}
            className="mt-2 w-full text-gray-700 border border-gray-200 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-300"
            disabled={loading}
          >
            Regresar
          </button>
        )}
      </div>
    </form>
  );
};

export default function StripeCheckout({ isOpen, onClose, onSuccess }) {
  const { total } = useCarrito();

  if (!isOpen) return null;

  const desglose = {
    subtotal: total,
    impuestos: total * 0.16,
    envio: total > 500 ? 0 : 50,
    total: total + total * 0.16 + (total > 500 ? 0 : 50),
  };

  return (
    <div className="w-full p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
      
      <Elements stripe={stripePromise}>
        <CheckoutForm
          onSuccess={onSuccess}
          total={desglose.total}
          desglose={desglose}
          onClose={onClose}
        />
      </Elements>
    </div>
  );
}
