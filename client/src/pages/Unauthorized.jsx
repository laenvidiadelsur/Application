import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = () => {
    if (user) {
      navigate(user.rol === 'admin' ? '/admin/dashboard' : '/fundacion/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom color="error">
              Acceso No Autorizado
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Lo sentimos, no tienes permisos para acceder a esta página.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Si crees que esto es un error, por favor contacta al administrador.
            </Typography>
            <Button
              variant="contained"
              onClick={handleNavigate}
              fullWidth
            >
              {user ? 'Volver al Dashboard' : 'Ir al Login'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Unauthorized; 