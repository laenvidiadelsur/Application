import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/admin/profile');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/admin/settings');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 280px)` },
        ml: { sm: `280px` },
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Panel de Control
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notificaciones">
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ color: 'text.secondary' }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Configuración">
            <IconButton
              color="inherit"
              onClick={handleSettings}
              sx={{ color: 'text.secondary' }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                alt={user?.name || 'Usuario'}
                src="/static/images/avatar/1.jpg"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 200,
              mt: 1.5,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <MenuItem onClick={handleProfile}>
            <PersonIcon sx={{ mr: 1 }} /> Mi Perfil
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 1 }} /> Configuración
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} /> Cerrar Sesión
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 300,
              mt: 1.5,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Notificaciones</Typography>
          </Box>
          <MenuItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2">Nueva fundación registrada</Typography>
              <Typography variant="caption" color="text.secondary">
                Hace 5 minutos
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2">Proyecto completado</Typography>
              <Typography variant="caption" color="text.secondary">
                Hace 1 hora
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2">Nuevo proveedor registrado</Typography>
              <Typography variant="caption" color="text.secondary">
                Hace 2 horas
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
              Ver todas las notificaciones
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 