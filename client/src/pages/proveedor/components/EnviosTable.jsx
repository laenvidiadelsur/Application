import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const estadoColors = {
  'pendiente': 'bg-yellow-100 text-yellow-800',
  'en_camino': 'bg-blue-100 text-blue-800',
  'entregado': 'bg-green-100 text-green-800',
  'cancelado': 'bg-red-100 text-red-800'
};

const EnviosTable = ({
  envios,
  loading,
  error,
  onUpdateEstado
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!envios || envios.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary">
          No hay envíos registrados
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} className="rounded-xl">
      <Table>
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell>ID Envío</TableCell>
            <TableCell>Fundación</TableCell>
            <TableCell>Productos</TableCell>
            <TableCell>Fecha Envío</TableCell>
            <TableCell>Fecha Entrega</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {envios.map((envio) => (
            <TableRow key={envio._id} hover>
              <TableCell>{envio._id.slice(-6)}</TableCell>
              <TableCell>{envio.fundacion?.nombre || 'N/A'}</TableCell>
              <TableCell>
                {envio.productos?.map((producto) => (
                  <Chip
                    key={producto._id}
                    label={`${producto.nombre} (${producto.cantidad} ${producto.unidad})`}
                    size="small"
                    className="mr-1 mb-1 bg-gray-100"
                  />
                ))}
              </TableCell>
              <TableCell>
                {new Date(envio.fechaEnvio).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {envio.fechaEntrega ? new Date(envio.fechaEntrega).toLocaleDateString() : 'Pendiente'}
              </TableCell>
              <TableCell>
                <Chip
                  label={envio.estado}
                  size="small"
                  className={estadoColors[envio.estado] || 'bg-gray-100 text-gray-800'}
                />
              </TableCell>
              <TableCell align="right">
                {envio.estado === 'pendiente' && (
                  <>
                    <Tooltip title="Marcar en camino">
                      <IconButton
                        onClick={() => onUpdateEstado(envio._id, 'en_camino')}
                        size="small"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <ShippingIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancelar envío">
                      <IconButton
                        onClick={() => onUpdateEstado(envio._id, 'cancelado')}
                        size="small"
                        className="text-red-600 hover:bg-red-50 ml-1"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {envio.estado === 'en_camino' && (
                  <Tooltip title="Marcar como entregado">
                    <IconButton
                      onClick={() => onUpdateEstado(envio._id, 'entregado')}
                      size="small"
                      className="text-green-600 hover:bg-green-50"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EnviosTable; 