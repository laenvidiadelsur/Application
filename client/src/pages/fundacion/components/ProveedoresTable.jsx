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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ImageList,
  ImageListItem,
  Badge,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ProveedoresTable = ({
  proveedores,
  loading,
  error,
  onEdit,
  onDelete
}) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);

  const handleOpenImageDialog = (proveedor) => {
    setSelectedProveedor(proveedor);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedProveedor(null);
  };

  const renderProveedorImage = (proveedor) => {
    // Si no hay imágenes
    if (!proveedor.imagenes || proveedor.imagenes.length === 0) {
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
    if (proveedor.imagenes.length === 1) {
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
            onClick={() => handleOpenImageDialog(proveedor)}
          >
            <img
              src={proveedor.imagenes[0].url}
              alt={proveedor.nombre}
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
      <Tooltip title={`Ver ${proveedor.imagenes.length} imágenes`}>
        <Badge 
          badgeContent={proveedor.imagenes.length} 
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpenImageDialog(proveedor)}
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
              src={proveedor.imagenes[0].url}
              alt={proveedor.nombre}
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
    if (!selectedProveedor || !selectedProveedor.imagenes || selectedProveedor.imagenes.length === 0) {
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
          Imágenes de {selectedProveedor.nombre}
          <Chip 
            label={`${selectedProveedor.imagenes.length} imagen${selectedProveedor.imagenes.length > 1 ? 'es' : ''}`}
            size="small"
            color="primary"
          />
        </DialogTitle>
        <DialogContent>
          {selectedProveedor.imagenes.length === 1 ? (
            // Una sola imagen - mostrar grande
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              sx={{ minHeight: 300 }}
            >
              <img
                src={selectedProveedor.imagenes[0].url}
                alt={selectedProveedor.nombre}
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
              cols={selectedProveedor.imagenes.length > 4 ? 3 : 2}
              rowHeight={200}
              gap={8}
            >
              {selectedProveedor.imagenes.map((imagen, index) => (
                <ImageListItem key={index}>
                  <img
                    src={imagen.url}
                    alt={`${selectedProveedor.nombre} - Imagen ${index + 1}`}
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
          
          {/* Información adicional del proveedor */}
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="textSecondary">
              <strong>NIT:</strong> {selectedProveedor.nit}
            </Typography>
            <Box mt={1} display="flex" gap={2} flexWrap="wrap">
              <Typography variant="body2" color="textSecondary">
                <strong>Email:</strong> {selectedProveedor.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Teléfono:</strong> {selectedProveedor.telefono}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Tipo de Servicio:</strong> {selectedProveedor.tipoServicio}
              </Typography>
            </Box>
            {selectedProveedor.location && (
              <Box mt={1} display="flex" alignItems="center" gap={1}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  Ubicación: {selectedProveedor.location[0].toFixed(6)}, {selectedProveedor.location[1].toFixed(6)}
                </Typography>
              </Box>
            )}
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
              onEdit(selectedProveedor._id);
            }}
            startIcon={<EditIcon />}
          >
            Editar Proveedor
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

  if (!proveedores || proveedores.length === 0) {
    return (
      <Box p={3}>
        <Typography color="textSecondary" align="center">
          No hay proveedores registrados
        </Typography>
      </Box>
    );
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'rechazado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>NIT</TableCell>
              <TableCell>Tipo de Servicio</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Representante</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedores.map((proveedor) => (
              <TableRow key={proveedor._id}>
                <TableCell>
                  {renderProveedorImage(proveedor)}
                </TableCell>
                <TableCell>{proveedor.nombre}</TableCell>
                <TableCell>{proveedor.nit}</TableCell>
                <TableCell>
                  <Chip 
                    label={proveedor.tipoServicio} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{proveedor.email}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {proveedor.telefono}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{proveedor.representante?.nombre}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    CI: {proveedor.representante?.ci}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={proveedor.estado || 'pendiente'} 
                    size="small"
                    color={getEstadoColor(proveedor.estado)}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    {/* Botón para ver imágenes (solo si tiene imágenes) */}
                    {proveedor.imagenes && proveedor.imagenes.length > 0 && (
                      <Tooltip title="Ver imágenes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenImageDialog(proveedor)}
                          sx={{ color: 'primary.main' }}
                        >
                          <ImageIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(proveedor._id)}
                        sx={{ color: 'warning.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(proveedor._id)}
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

export default ProveedoresTable; 