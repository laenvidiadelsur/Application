import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const Reportes = () => {
  const [reportType, setReportType] = useState('general');
  const [dateRange, setDateRange] = useState('month');

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleDownload = () => {
    // Implementar descarga de reporte
    console.log('Descargando reporte...');
  };

  const handlePrint = () => {
    // Implementar impresión de reporte
    console.log('Imprimiendo reporte...');
  };

  const handleShare = () => {
    // Implementar compartir reporte
    console.log('Compartiendo reporte...');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Reportes Ambientales</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Descargar
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            Compartir
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Filtros */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Reporte</InputLabel>
                    <Select
                      value={reportType}
                      label="Tipo de Reporte"
                      onChange={handleReportTypeChange}
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="fundaciones">Fundaciones</MenuItem>
                      <MenuItem value="proyectos">Proyectos</MenuItem>
                      <MenuItem value="impacto">Impacto Ambiental</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rango de Fechas</InputLabel>
                    <Select
                      value={dateRange}
                      label="Rango de Fechas"
                      onChange={handleDateRangeChange}
                    >
                      <MenuItem value="week">Última Semana</MenuItem>
                      <MenuItem value="month">Último Mes</MenuItem>
                      <MenuItem value="quarter">Último Trimestre</MenuItem>
                      <MenuItem value="year">Último Año</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas Principales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Proyectos Activos
              </Typography>
              <Typography variant="h4" component="div">
                24
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12% desde el mes pasado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Impacto Ambiental
              </Typography>
              <Typography variant="h4" component="div">
                85%
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +5% desde el mes pasado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recursos Reciclados
              </Typography>
              <Typography variant="h4" component="div">
                1,234
              </Typography>
              <Typography variant="body2" color="textSecondary">
                toneladas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Emisiones Reducidas
              </Typography>
              <Typography variant="h4" component="div">
                45%
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingDownIcon sx={{ color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  -8% desde el mes pasado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de Proyectos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proyectos en Curso
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre del Proyecto</TableCell>
                      <TableCell>Fundación</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Progreso</TableCell>
                      <TableCell>Impacto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Reforestación Urbana</TableCell>
                      <TableCell>EcoVida</TableCell>
                      <TableCell>En Progreso</TableCell>
                      <TableCell>75%</TableCell>
                      <TableCell>Alto</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Reciclaje Comunitario</TableCell>
                      <TableCell>Verde Futuro</TableCell>
                      <TableCell>En Progreso</TableCell>
                      <TableCell>45%</TableCell>
                      <TableCell>Medio</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Educación Ambiental</TableCell>
                      <TableCell>Naturaleza Viva</TableCell>
                      <TableCell>Completado</TableCell>
                      <TableCell>100%</TableCell>
                      <TableCell>Alto</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reportes; 