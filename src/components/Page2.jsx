import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Container,
  CircularProgress,
  Button,
  Box,
  Paper,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import '../styles/page1.css';

const Page2 = () => {
  const [data, setData] = useState({ escOfi: [], obj2: [], indicadores: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editState, setEditState] = useState({});
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
        const obj2Response = await axios.post('https://planeacion-server.vercel.app/getData', { sheetName: 'OBJ_2' });
        const indicadoresResponse = await axios.post('https://planeacion-server.vercel.app/getData', { sheetName: 'INDICADORES' });

        setData({
          escOfi: escOfiResponse.data.data,
          obj2: obj2Response.data.data,
          indicadores: indicadoresResponse.data.data,
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

  const handleEdit = (type, id, save = false) => {
    if (save) {
      const newName = document.getElementById(`${type}-${id}`).value;

      const payload = {
        updateData: [id, newName],
        id,
        sheetName: type === 'obj2' ? 'OBJ_2' : type.toUpperCase(),
      };

      console.log('Datos a enviar:', payload);

      axios
        .post('https://planeacion-server.vercel.app/updateData', payload)
        .then((response) => {
          console.log('Respuesta del servidor:', response);
          const newData = { ...data };
          if (type === 'obj2') {
            newData.obj2 = newData.obj2.map(item =>
              item.id === id ? { ...item, objetivo_esc_ofi: newName } : item
            );
          } else {
            newData[type + 's'] = newData[type + 's'].map(item =>
              item.id === id ? { ...item, nombre: newName } : item
            );
          }
          setData(newData);
          setEditState({ ...editState, [`${type}-${id}`]: false });
        })
        .catch((error) => {
          console.error('Error updating data:', error);
        });
    } else {
      setEditState({ ...editState, [`${type}-${id}`]: true });
    }
  };

  const handleIndicatorClick = (indicator) => {
    setSelectedIndicator(indicator.id);
    setIndicatorContent(indicator);
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
    }
    return true; 
  });

  return (
    <Container className="mt-5">
      <Typography variant="h4" gutterBottom>
        Indicadores por Escuela/Oficina
      </Typography>
      {['Escuela', 'Oficina'].map((tipo, i) => (
        <div key={i}>
          <Typography variant="h5" sx={{ marginTop: '30px', marginBottom: '10px' }}>{tipo}s</Typography>
          {filteredEscOfi.filter((item) => item.tipo === tipo).map((escOfi, j) => (
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
                <div>
                  {data.obj2.filter((obj) => obj.id_esc_ofi === escOfi.id).map((obj2, k) => (
                    <Accordion key={k}>
                      <AccordionDetails sx={{ backgroundColor: '#fff' }}>
                        <Box sx={{ display: 'flex', width: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            {data.indicadores.filter((ind) => ind.id_obj2 === obj2.id).map((indicador, l) => (
                              <Button
                                key={l}
                                variant="contained"
                                onClick={() => handleIndicatorClick(indicador)}
                                sx={{
                                  display: 'block',
                                  marginBottom: '10px',
                                  backgroundColor: selectedIndicator === indicador.id ? '#a9a9a9' : '#d3d3d3',
                                  color: '#000',
                                  '&:hover': {
                                    backgroundColor: '#a9a9a9',
                                  },
                                }}
                              >
                                {indicador.indicador}
                              </Button>
                            ))}
                          </Box>
                          <Box sx={{ flex: 2, marginLeft: '20px' }}>
                            {indicatorContent && (
                              <Paper sx={{ padding: '20px' }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <Typography variant="h6">{indicatorContent.indicador}</Typography>
                                    <Typography>{indicatorContent.descripcion}</Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>Meta 2024: {indicatorContent.meta}</Typography>
                                    <Typography>
                                      Avance 2024: <TextField size="small" disabled={userPermissions.permiso !== 'Sistemas' && userPermissions.permiso !== 'Escuela_prof'} />
                                    </Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>¿Cómo se va a registrar las asistencias?</Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>Responsable: {indicatorContent.responsable}</Typography>
                                  </Grid>
                                </Grid>
                              </Paper>
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ))}
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
            label="Responsable (Correo)"
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
