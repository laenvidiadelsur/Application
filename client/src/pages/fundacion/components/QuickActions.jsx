import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const QuickActions = ({ onAddProveedor, onAddProducto }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddProveedor}
        >
          Agregar Proveedor
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddProducto}
        >
          Agregar Producto
        </Button>
      </Stack>
    </Box>
  );
};

export default QuickActions; 