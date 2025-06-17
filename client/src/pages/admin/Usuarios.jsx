import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  Tooltip,
  useTheme,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Store as StoreIcon,
  Foundation as FoundationIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

const Usuarios = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario',
    activo: true,
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(response.data);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error fetching usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        ...usuario,
        password: '',
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'usuario',
        activo: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUsuario(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (editingUsuario) {
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        await axios.put(`${API_URL}/usuarios/${editingUsuario._id}`, dataToSend);
        setSuccess('Usuario actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/usuarios`, formData);
        setSuccess('Usuario creado correctamente');
      }
      handleCloseDialog();
      fetchUsuarios();
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Error al guardar el usuario';
      setError(errorMessage);
      console.error('Error saving usuario:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        setError(null);
        setSuccess(null);
        await axios.delete(`${API_URL}/usuarios/${id}`);
        setSuccess('Usuario eliminado correctamente');
        fetchUsuarios();
      } catch (err) {
        const errorMessage = err.response?.data?.msg || 'Error al eliminar el usuario';
        setError(errorMessage);
        console.error('Error deleting usuario:', err);
      }
    }
  };

  const getRolIcon = (rol) => {
    switch (rol) {
      case 'admin':
        return <AdminIcon />;
      case 'proveedor':
        return <StoreIcon />;
      case 'fundacion':
        return <FoundationIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin':
        return theme.palette.primary.main;
      case 'proveedor':
        return theme.palette.secondary.main;
      case 'fundacion':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[600];
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        color="default" 
        elevation={0}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'white'
        }}
      >
        <Toolbar sx={{ maxWidth: '1400px', width: '100%', mx: 'auto', px: { xs: 2, sm: 4 } }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              onClick={() => navigate('/admin/dashboard')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: 'action.hover',
                  color: 'text.primary'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1}>
              <GroupIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Gestión de Usuarios
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 3,
              }
            }}
          >
            Nuevo Usuario
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow 
                    key={usuario._id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: theme.palette.action.hover 
                      }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="action" />
                        <Typography>{usuario.nombre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRolIcon(usuario.rol)}
                        label={usuario.rol}
                        sx={{
                          backgroundColor: `${getRolColor(usuario.rol)}15`,
                          color: getRolColor(usuario.rol),
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: 'inherit'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.activo ? 'Activo' : 'Inactivo'}
                        color={usuario.activo ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(usuario)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(usuario._id)}
                            size="small"
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
        </Card>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            pb: 2
          }}>
            {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUsuario}
                    helperText={editingUsuario ? "Dejar en blanco para mantener la contraseña actual" : ""}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      label="Rol"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="usuario">Usuario</MenuItem>
                      <MenuItem value="admin">Administrador</MenuItem>
                      <MenuItem value="proveedor">Proveedor</MenuItem>
                      <MenuItem value="fundacion">Fundación</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={handleCloseDialog}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
                }}
              >
                {editingUsuario ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Usuarios; 