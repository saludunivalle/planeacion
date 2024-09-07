import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Container,
  CircularProgress,
  Box,
  Paper,
  Divider,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import '../styles/page1.css';

const Page2 = () => {
  const [data, setData] = useState({ escOfi: [], objDec: [], indicadores: [], metas: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [indicatorContent, setIndicatorContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newIndicator, setNewIndicator] = useState({
    nombre: '',
    oficinaEscuela: '',
    meta2024: '',
    meta2025: '',
    meta2026: '',
    responsable: ''
  });

  const userPermissions = JSON.parse(sessionStorage.getItem('logged'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const escOfiResponse = await axios.post('https://planeacion-server.vercel.app/getData', { sheetName: 'ESC_OFI' });
        const objDecResponse = await axios.post('https://planeacion-server.vercel.app/getData', { sheetName: 'OBJ_DEC' });
        const indicadoresResponse = await axios.post('https://planeacion-server.vercel.app/getData', { sheetName: 'INDICADORES' });
        const metasResponse = await axios.post('https://planeacion-server.vercel.app/getData', { sheetName: 'METAS' });

        setData({
          escOfi: escOfiResponse.data.data,
          objDec: objDecResponse.data.data,
          indicadores: indicadoresResponse.data.data,
          metas: metasResponse.data.data,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIndicatorClick = (indicator) => {
    setSelectedIndicator(indicator.id);
    setIndicatorContent(indicator);
  };

  const getMetaForCurrentYear = (indicatorId) => {
    const currentYear = new Date().getFullYear().toString();
    const metaRow = data.metas.find(meta => meta.id_indicador === indicatorId);
    return metaRow ? metaRow[currentYear] : 'No disponible';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIndicator({ ...newIndicator, [name]: value });
  };

  const handleCreateIndicator = () => {
    const payload = {
      ...newIndicator,
      oficinaEscuela: userPermissions.id_escuela,
      sheetName: 'INDICADORES',
    };

    axios.post('https://planeacion-server.vercel.app/createIndicator', payload)
      .then((response) => {
        console.log('Indicador creado:', response);
        setOpenDialog(false);
      })
      .catch((error) => {
        console.error('Error creating indicator:', error);
      });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  const filteredEscOfi = data.escOfi.filter((item) => {
    if (userPermissions.permiso === 'Escuela_jefe' || userPermissions.permiso === 'Escuela_prof') {
      return item.id === userPermissions.id_escuela;
    } else if (userPermissions.permiso === 'Oficina_jefe') {
      return item.id === userPermissions.id_oficina;
    }
    return true;
  });

  const hasSchoolPermissions = filteredEscOfi.some(item => item.tipo === 'Escuela');
  const hasOfficePermissions = filteredEscOfi.some(item => item.tipo === 'Oficina');

  return (
    <Container className="mt-5">
      <Typography variant="h4" gutterBottom>
        Indicadores por Dependencia
      </Typography>
      {hasOfficePermissions && (
        <div>
          <Typography variant="h5" sx={{ marginTop: '30px', marginBottom: '10px' }}>Oficinas</Typography>
          {filteredEscOfi.filter((item) => item.tipo === 'Oficina').map((escOfi, j) => (
            <Accordion key={j}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#e3e4e5' }}>
                <Typography>{escOfi.nombre}</Typography>
                {userPermissions.permiso === 'Sistemas' && (
                  <IconButton color="primary" size="small" onClick={() => setOpenDialog(true)}>
                    <AddIcon />
                  </IconButton>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: '#fff' }}>
                {data.objDec
                  .filter((objDec) => data.indicadores.some((indicador) => indicador.id_obj_dec === objDec.id && indicador.id_esc_ofi === escOfi.id)) // Filtra objetivos decanato vacíos
                  .map((objDec) => (
                    <Accordion key={objDec.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#e3e4e5' }}>
                        <Typography>{objDec.nombre}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={5}>
                            {data.indicadores
                              .filter((indicador) => indicador.id_obj_dec === objDec.id && indicador.id_esc_ofi === escOfi.id)
                              .map((indicador) => (
                                <Button
                                  key={indicador.id}
                                  variant="contained"
                                  onClick={() => handleIndicatorClick(indicador)}
                                  sx={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    backgroundColor: selectedIndicator === indicador.id ? '#919292' : '#b4b6b9', 
                                    color: 'black',
                                    '&:hover': {
                                      backgroundColor: selectedIndicator === indicador.id ? '#e3e4e5' : '#e3e4e5', 
                                    },
                                  }}
                                >
                                  {indicador.indicador}
                                </Button>
                              ))}
                          </Grid>
                          <Grid item xs={7}>
                            {indicatorContent && selectedIndicator === indicatorContent.id && (
                              <Paper sx={{ padding: '20px' }}>
                                <Typography variant="h6"><strong>{indicatorContent.indicador}</strong></Typography>
                                <Typography>{indicatorContent.descripcion}</Typography>
                                <Typography>Meta {new Date().getFullYear()}: {getMetaForCurrentYear(indicatorContent.id)}</Typography>
                                <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                <Typography>Responsable: {indicatorContent.responsable}</Typography>
                                <Typography>Enlace al registro del avance del indicador: {indicatorContent.url_indicador}</Typography>
                              </Paper>
                            )}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
      {hasSchoolPermissions && (
        <div>
          <Typography variant="h5" sx={{ marginTop: '30px', marginBottom: '10px' }}>Escuelas</Typography>
          {filteredEscOfi.filter((item) => item.tipo === 'Escuela').map((escOfi, j) => (
            <Accordion key={j}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#e3e4e5' }}>
                <Typography>{escOfi.nombre}</Typography>
                {userPermissions.permiso === 'Sistemas' && (
                  <IconButton color="primary" size="small" onClick={() => setOpenDialog(true)}>
                    <AddIcon />
                  </IconButton>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: '#fff' }}>
                {data.objDec
                  .filter((objDec) => data.indicadores.some((indicador) => indicador.id_obj_dec === objDec.id && indicador.id_esc_ofi === escOfi.id)) // Filtra objetivos decanato vacíos
                  .map((objDec) => (
                    <Accordion key={objDec.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{objDec.nombre}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* Contenedor dividido en dos: indicadores y tabla de detalles */}
                        <Grid container spacing={2}>
                          <Grid item xs={5}>
                            {data.indicadores
                              .filter((indicador) => indicador.id_obj_dec === objDec.id && indicador.id_esc_ofi === escOfi.id)
                              .map((indicador) => (
                                <Button
                                  key={indicador.id}
                                  variant="contained"
                                  onClick={() => handleIndicatorClick(indicador)}
                                  sx={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                  }}
                                >
                                  {indicador.indicador}
                                </Button>
                              ))}
                          </Grid>
                          <Grid item xs={7}>
                            {indicatorContent && selectedIndicator === indicatorContent.id && (
                              <Paper sx={{ padding: '20px' }}>
                                <Typography variant="h6">{indicatorContent.indicador}</Typography>
                                <Typography>{indicatorContent.descripcion}</Typography>
                                <Typography>Meta {new Date().getFullYear()}: {getMetaForCurrentYear(indicatorContent.id)}</Typography>
                                <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                <Typography>Responsable: {indicatorContent.responsable}</Typography>
                              </Paper>
                            )}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Crear Indicador</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre del Indicador"
            type="text"
            fullWidth
            name="nombre"
            value={newIndicator.nombre}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Meta 2024"
            type="number"
            fullWidth
            name="meta2024"
            value={newIndicator.meta2024}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Meta 2025"
            type="number"
            fullWidth
            name="meta2025"
            value={newIndicator.meta2025}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Meta 2026"
            type="number"
            fullWidth
            name="meta2026"
            value={newIndicator.meta2026}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Responsable"
            type="email"
            fullWidth
            name="responsable"
            value={newIndicator.responsable}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCreateIndicator} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Page2;
