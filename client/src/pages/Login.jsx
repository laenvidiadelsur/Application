import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Email, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rol: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
    rol: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFieldErrors({
      ...fieldErrors,
      [e.target.name]: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      email: !formData.email,
      password: !formData.password,
      rol: !formData.rol,
    };
    
    setFieldErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      const user = await login(formData.email, formData.password, formData.rol);
      const from = location.state?.from?.pathname || 
        (user.rol === 'admin' ? '/admin/dashboard' : 
         user.rol === 'proveedor' ? '/proveedor/dashboard' : 
         '/fundacion/dashboard');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="ml-2 text-xl font-semibold">Alas Orientales</span>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-gray-600">
              Accede a tu cuenta con tus credenciales
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                  Tipo de usuario
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 rounded-md ${
                    fieldErrors.rol ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="admin">Administrador del sistema</option>
                  <option value="fundacion">Fundación benéfica</option>
                  <option value="proveedor">Proveedor</option>
                </select>
                {fieldErrors.rol && (
                  <p className="mt-2 text-sm text-red-600">Seleccione un tipo de usuario</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                      fieldErrors.email ? 'border-red-300' : ''
                    }`}
                    placeholder="ejemplo@correo.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-2 text-sm text-red-600">Ingrese su correo electrónico</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                      fieldErrors.password ? 'border-red-300' : ''
                    }`}
                    placeholder="••••••••"
                  />
                  {fieldErrors.password && (
                    <p className="mt-2 text-sm text-red-600">Ingrese su contraseña</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-gray-900 hover:text-gray-700">
                  ¿No tienes una cuenta?
                </a>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Regístrate
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 