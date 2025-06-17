import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const ProductosTable = ({
  productos,
  loading,
  error,
  onEdit,
  onDelete
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

  if (!productos || productos.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary">
          No hay productos registrados
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} className="rounded-xl">
      <Table>
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Unidad</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto._id} hover>
              <TableCell>{producto.nombre}</TableCell>
              <TableCell>{producto.descripcion}</TableCell>
              <TableCell>
                <Chip
                  label={producto.categoria}
                  size="small"
                  className={`${
                    producto.categoria === 'alimentos' ? 'bg-green-100 text-green-800' :
                    producto.categoria === 'materiales' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                />
              </TableCell>
              <TableCell>${producto.precio}</TableCell>
              <TableCell>{producto.stock}</TableCell>
              <TableCell>{producto.unidad}</TableCell>
              <TableCell>
                <Chip
                  label={producto.estado}
                  size="small"
                  className={`${
                    producto.estado === 'activo' ? 'bg-green-100 text-green-800' :
                    producto.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => onEdit(producto._id)}
                  size="small"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(producto._id)}
                  size="small"
                  className="text-red-600 hover:bg-red-50 ml-1"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductosTable; 