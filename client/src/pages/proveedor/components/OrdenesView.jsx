import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OrdenesView = ({ open, onClose }) => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrden, setSelectedOrden] = useState(null);

  const fetchOrdenes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ordenes/proveedor`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar las órdenes');
      const data = await response.json();
      setOrdenes(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchOrdenes();
    }
  }, [open]);

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      procesando: 'info',
      completado: 'success',
      fallido: 'error',
      reembolsado: 'default',
      enviado: 'success'
    };
    return colores[estado] || 'default';
  };

  const handleMenuClick = (event, orden) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrden(orden);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrden(null);
  };

  const handleCambiarEstadoEnvio = async (nuevoEstado) => {
    if (!selectedOrden) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ordenes/${selectedOrden._id}/estado-envio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nuevoEstado })
      });
      if (!response.ok) throw new Error('Error al actualizar el estado');
      await fetchOrdenes();
      handleMenuClose();
    } catch (err) {
      alert('No se pudo actualizar el estado de envío');
      handleMenuClose();
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6">Órdenes de Compra</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número de Orden</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado Pago</TableCell>
                <TableCell>Estado Envío</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenes.map((orden) => (
                <TableRow key={orden._id}>
                  <TableCell>{orden.numeroOrden}</TableCell>
                  <TableCell>
                    {format(new Date(orden.createdAt), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {orden.datosContacto?.nombre || 'N/A'}
                  </TableCell>
                  <TableCell>${orden.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={orden.estadoPago}
                      color={getEstadoColor(orden.estadoPago)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={orden.estadoEnvio}
                      color={getEstadoColor(orden.estadoEnvio)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {orden.estadoEnvio !== 'enviado' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => handleMenuClick(e, orden)}
                      >
                        Cambiar estado
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedOrden && selectedOrden.estadoEnvio === 'pendiente' && (
            <MenuItem onClick={() => handleCambiarEstadoEnvio('procesando')}>Procesando</MenuItem>
          )}
          {selectedOrden && selectedOrden.estadoEnvio === 'procesando' && (
            <MenuItem onClick={() => handleCambiarEstadoEnvio('enviado')}>Enviado</MenuItem>
          )}
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default OrdenesView; 