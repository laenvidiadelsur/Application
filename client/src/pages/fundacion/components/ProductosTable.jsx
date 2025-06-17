import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ImageList,
  ImageListItem,
  Tooltip,
  Badge
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';

const ProductosTable = ({
  productos,
  loading,
  error,
  onEdit,
  onDelete,
  proveedores = []
}) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  const handleOpenImageDialog = (producto) => {
    setSelectedProducto(producto);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedProducto(null);
  };

  const renderProductImage = (producto) => {
    // Si no hay imágenes
    if (!producto.imagenes || producto.imagenes.length === 0) {
      return (
        <Box
          sx={{ 
            width: 60, 
            height: 60, 
            bgcolor: 'grey.300',
            cursor: 'default',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e0e0e0'
          }}
        >
          <NoPhotographyIcon sx={{ color: 'grey.500', fontSize: 28 }} />
        </Box>
      );
    }

    // Si hay una imagen
    if (producto.imagenes.length === 1) {
      return (
        <Tooltip title="Ver imagen">
          <Box
            sx={{ 
              width: 60, 
              height: 60,
              cursor: 'pointer',
              border: '2px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
              '&:hover': {
                border: '2px solid #1976d2',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease'
              }
            }}
            onClick={() => handleOpenImageDialog(producto)}
          >
            <img
              src={producto.imagenes[0].url}
              alt={producto.nombre}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Tooltip>
      );
    }

    // Si hay múltiples imágenes
    return (
      <Tooltip title={`Ver ${producto.imagenes.length} imágenes`}>
        <Badge 
          badgeContent={producto.imagenes.length} 
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpenImageDialog(producto)}
        >
          <Box
            sx={{ 
              width: 60, 
              height: 60,
              border: '2px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
              '&:hover': {
                border: '2px solid #1976d2',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <img
              src={producto.imagenes[0].url}
              alt={producto.nombre}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Badge>
      </Tooltip>
    );
  };

  const renderImageDialog = () => {
    if (!selectedProducto || !selectedProducto.imagenes || selectedProducto.imagenes.length === 0) {
      return null;
    }

    return (
      <Dialog 
        open={imageDialogOpen} 
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoLibraryIcon />
          Imágenes de {selectedProducto.nombre}
          <Chip 
            label={`${selectedProducto.imagenes.length} imagen${selectedProducto.imagenes.length > 1 ? 'es' : ''}`}
            size="small"
            color="primary"
          />
        </DialogTitle>
        <DialogContent>
          {selectedProducto.imagenes.length === 1 ? (
            // Una sola imagen - mostrar grande
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              sx={{ minHeight: 300 }}
            >
              <img
                src={selectedProducto.imagenes[0].url}
                alt={selectedProducto.nombre}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          ) : (
            // Múltiples imágenes - mostrar en grid
            <ImageList 
              sx={{ width: '100%', maxHeight: 500 }} 
              cols={selectedProducto.imagenes.length > 4 ? 3 : 2}
              rowHeight={200}
              gap={8}
            >
              {selectedProducto.imagenes.map((imagen, index) => (
                <ImageListItem key={index}>
                  <img
                    src={imagen.url}
                    alt={`${selectedProducto.nombre} - Imagen ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Abrir imagen en nueva pestaña para vista completa
                      window.open(imagen.url, '_blank');
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
          
          {/* Información adicional del producto */}
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="textSecondary">
              <strong>Descripción:</strong> {selectedProducto.descripcion}
            </Typography>
            <Box mt={1} display="flex" gap={2} flexWrap="wrap">
              <Typography variant="body2" color="textSecondary">
                <strong>Precio:</strong> ${selectedProducto.precio}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Stock:</strong> {selectedProducto.stock} {selectedProducto.unidad}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Categoría:</strong> {selectedProducto.categoria}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>
            Cerrar
          </Button>
          <Button 
            variant="outlined"
            onClick={() => {
              handleCloseImageDialog();
              onEdit(selectedProducto._id);
            }}
            startIcon={<EditIcon />}
          >
            Editar Producto
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto._id} hover>
                <TableCell>
                  {renderProductImage(producto)}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {producto.nombre}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {producto.descripcion}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={producto.categoria}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {producto.precio} Bs  
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2"
                    color={producto.stock < 10 ? 'error' : 'textPrimary'}
                    fontWeight={producto.stock < 10 ? 'medium' : 'normal'}
                  >
                    {producto.stock}
                  </Typography>
                </TableCell>
                <TableCell>{producto.unidad}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {(() => {
                      if (!producto.proveedor) return 'Sin asignar';
                      if (typeof producto.proveedor === 'object' && producto.proveedor.nombre) {
                        return producto.proveedor.nombre;
                      }
                      const found = proveedores.find(p => p._id === producto.proveedor);
                      return found ? found.nombre : 'Sin asignar';
                    })()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={producto.estado}
                    size="small"
                    color={producto.estado === 'activo' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    {/* Botón para ver imágenes (solo si tiene imágenes) */}
                    {producto.imagenes && producto.imagenes.length > 0 && (
                      <Tooltip title="Ver imágenes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenImageDialog(producto)}
                          sx={{ color: 'primary.main' }}
                        >
                          <ImageIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(producto._id)}
                        sx={{ color: 'warning.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(producto._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para mostrar imágenes */}
      {renderImageDialog()}
    </>
  );
};

export default ProductosTable;