import { useState, useEffect } from 'react';
import axios from 'axios';

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
    password: '',
    descripcion: '',
    location: [-17.7833, -63.1821] // Default to Bolivia coordinates
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchFundaciones();
  }, []);

  const fetchFundaciones = async () => {
    try {
      const response = await axios.get('/api/fundaciones');
      setFundaciones(response.data);
    } catch (error) {
      console.error('Error fetching fundaciones:', error);
      showSnackbar('Error al cargar las fundaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fundacion = null) => {
    if (fundacion) {
      setEditingFundacion(fundacion);
      setFormData({
        ...fundacion,
        password: '', // Don't show password when editing
        location: fundacion.location || [-17.7833, -63.1821]
      });
    } else {
      setEditingFundacion(null);
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
        password: '',
        descripcion: '',
        location: [-17.7833, -63.1821]
      });
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = true;
    if (!formData.nit) newErrors.nit = true;
    if (!formData.direccion) newErrors.direccion = true;
    if (!formData.telefono) newErrors.telefono = true;
    if (!formData.email) newErrors.email = true;
    if (!formData.representante.nombre) newErrors.representante = true;
    if (!formData.representante.ci) newErrors.representante = true;
    if (!formData.mision) newErrors.mision = true;
    if (!formData.areaAccion) newErrors.areaAccion = true;
    if (!editingFundacion && !formData.password) newErrors.password = true;
    if (!formData.location || !Array.isArray(formData.location) || formData.location.length !== 2) {
      newErrors.location = 'Debe seleccionar una ubicación en el mapa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingFundacion) {
        await axios.put(`/api/fundaciones/${editingFundacion._id}`, formData);
        showSnackbar('Fundación actualizada exitosamente');
      } else {
        await axios.post('/api/fundaciones', formData);
        showSnackbar('Fundación creada exitosamente');
      }
      fetchFundaciones();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving fundacion:', error);
      showSnackbar(
        error.response?.data?.message || 
        (editingFundacion ? 'Error al actualizar la fundación' : 'Error al crear la fundación'),
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta fundación?')) return;

    try {
      await axios.delete(`/api/fundaciones/${id}`);
      showSnackbar('Fundación eliminada exitosamente');
      fetchFundaciones();
    } catch (error) {
      console.error('Error deleting fundacion:', error);
      showSnackbar('Error al eliminar la fundación', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 3000);
  };

  return {
    fundaciones,
    openDialog,
    editingFundacion,
    formData,
    errors,
    loading,
    snackbar,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleSubmit,
    handleDelete
  };
}; 