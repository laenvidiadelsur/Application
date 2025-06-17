import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/admin/Dashboard';
import FundacionDashboard from './pages/fundacion/Dashboard';
import ProveedorDashboard from './pages/proveedor/Dashboard';
import Proveedores from './pages/admin/Proveedores';
import Fundaciones from './pages/admin/Fundaciones';
import Reportes from './pages/admin/Reportes';
import Usuarios from './pages/admin/Usuarios';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rutas protegidas - Admin */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="fundaciones" element={<Fundaciones />} />
                    <Route path="reportes" element={<Reportes />} />
                    <Route path="usuarios" element={<Usuarios />} />
                  </Routes>
                </PrivateRoute>
              }
            />

            {/* Rutas protegidas - Fundación */}
            <Route
              path="/fundacion/*"
              element={
                <PrivateRoute allowedRoles={['fundacion']}>
                  <Routes>
                    <Route path="dashboard" element={<FundacionDashboard />} />
                    <Route path="*" element={<Navigate to="/fundacion/dashboard" replace />} />
                  </Routes>
                </PrivateRoute>
              }
            />

            {/* Rutas protegidas - Proveedor */}
            <Route
              path="/proveedor/*"
              element={
                <PrivateRoute allowedRoles={['proveedor']}>
                  <Routes>
                    <Route path="dashboard" element={<ProveedorDashboard />} />
                    <Route path="*" element={<Navigate to="/proveedor/dashboard" replace />} />
                  </Routes>
                </PrivateRoute>
              }
            />

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;