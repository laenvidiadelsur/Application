import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

export const useFundaciones = () => {
  const [fundaciones, setFundaciones] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFundacion, setEditingFundacion] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    representante: {
      nombre: '',
      ci: ''
    },
    mision: '',
    areaAccion: '',
    cuentaBancaria: '',
    logo: '',
    descripcion: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundaciones();
  }, []);

  const fetchFundaciones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fundaciones`);
      setFundaciones(response.data);
    } catch (error) {
      showSnackbar('Error al cargar las fundaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fundacion = null) => {
    if (fundacion) {
      setFormData(fundacion);
      setEditingFundacion(fundacion);
    } else {
      setFormData({
        nombre: '',
        nit: '',
        direccion: '',
        telefono: '',
        email: '',
        representante: {
          nombre: '',
          ci: ''
        },
        mision: '',
        areaAccion: '',
        cuentaBancaria: '',
        logo: '',
        descripcion: '',
        password: '',
      });
      setEditingFundacion(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFundacion(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingFundacion) {
        await axios.put(`${API_URL}/fundaciones/${editingFundacion._id}`, formData);
        showSnackbar('Fundación actualizada correctamente');
      } else {
        const response = await axios.post(`${API_URL}/fundaciones`, formData);
        showSnackbar(
          `Fundación creada correctamente. Credenciales de acceso: Email: ${response.data.usuario.email}, Contraseña: ${formData.password}`,
          'success',
          10000
        );
      }
      handleCloseDialog();
      fetchFundaciones();
    } catch (error) {
      if (error.response?.data?.camposFaltantes) {
        setErrors(error.response.data.camposFaltantes);
        showSnackbar('Por favor complete todos los campos requeridos', 'error');
      } else if (error.response?.data?.errores) {
        setErrors(error.response.data.errores);
        showSnackbar('Error de validación', 'error');
      } else {
        showSnackbar(error.response?.data?.message || 'Error al guardar la fundación', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta fundación?')) {
      try {
        await axios.delete(`${API_URL}/fundaciones/${id}`);
        showSnackbar('Fundación eliminada correctamente');
        fetchFundaciones();
      } catch (error) {
        showSnackbar('Error al eliminar la fundación', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  return {
    fundaciones,
    openDialog,
    editingFundacion,
    formData,
    errors,
    snackbar,
    loading,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleSubmit,
    handleDelete,
    showSnackbar,
  };
}; 