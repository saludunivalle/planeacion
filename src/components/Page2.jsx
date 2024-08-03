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
  const [data, setData] = useState({ escOfi: [], obj2: [], indicadores: [], objDec: [], metas: [] });
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
  const [emailError, setEmailError] = useState('');
  const [editAvanceState, setEditAvanceState] = useState(false);
  const [currentAvance, setCurrentAvance] = useState('');

  const userPermissions = JSON.parse(sessionStorage.getItem('logged'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const escOfiResponse = await axios.post('http://localhost:3001/getData', { sheetName: 'ESC_OFI' });
        const obj2Response = await axios.post('http://localhost:3001/getData', { sheetName: 'OBJ_2' });
        const indicadoresResponse = await axios.post('http://localhost:3001/getData', { sheetName: 'INDICADORES' });
        const objDecResponse = await axios.post('http://localhost:3001/getData', { sheetName: 'OBJ_DEC' });
        const metasResponse = await axios.post('http://localhost:3001/getData', { sheetName: 'METAS' });

        setData({
          escOfi: escOfiResponse.data.data,
          obj2: obj2Response.data.data,
          indicadores: indicadoresResponse.data.data,
          objDec: objDecResponse.data.data,
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
        .post('http://localhost:3001/updateData', payload)
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

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@correounivalle\.edu\.co$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'responsable') {
      if (!validateEmail(value)) {
        setEmailError('El correo debe ser un correo de @correounivalle.edu.co');
      } else {
        setEmailError('');
      }
    }
    setNewIndicator({ ...newIndicator, [name]: value });
  };

  const handleCreateIndicator = () => {
    if (!validateEmail(newIndicator.responsable)) {
      setEmailError('El correo debe ser un correo de @correounivalle.edu.co');
      return;
    }
    const payload = {
      ...newIndicator,
      oficinaEscuela: userPermissions.id_escuela,
      sheetName: 'INDICADORES',
    };

    axios.post('http://localhost:3001/createIndicator', payload)
      .then((response) => {
        console.log('Indicador creado:', response);
        setOpenDialog(false);
      })
      .catch((error) => {
        console.error('Error creating indicator:', error);
      });
  };

  const getMetaForCurrentYear = (indicatorId) => {
    const currentYear = new Date().getFullYear().toString();
    const metaRow = data.metas.find(meta => meta.id_indicador === indicatorId);
    if (metaRow && metaRow[currentYear]) {
      return metaRow[currentYear];
    }
    return 'No disponible';
  };

  const getAvanceForCurrentYear = (indicatorId) => {
    const currentYear = new Date().getFullYear();
    const ejecColumn = `ejec_${currentYear}`;
    const metaRow = data.metas.find(meta => meta.id_indicador === indicatorId);
    if (metaRow && metaRow[ejecColumn]) {
      return metaRow[ejecColumn];
    }
    return '';
  };

  const handleAvanceEdit = () => {
    setEditAvanceState(true);
    setCurrentAvance(getAvanceForCurrentYear(selectedIndicator));
  };

  const handleAvanceSave = () => {
    const currentYear = new Date().getFullYear();
    const ejecColumn = `ejec_${currentYear}`;

    const payload = {
      id: selectedIndicator,
      sheetName: 'METAS',
      updateData: [ejecColumn, currentAvance]
    };

    axios.post('http://localhost:3001/updateMetas', payload) // Cambiamos a la nueva ruta
      .then((response) => {
        console.log('Avance actualizado:', response);
        const newData = { ...data };
        const metaIndex = newData.metas.findIndex(meta => meta.id_indicador === selectedIndicator);
        if (metaIndex !== -1) {
          newData.metas[metaIndex][ejecColumn] = currentAvance;
        }
        setData(newData);
        setEditAvanceState(false);
      })
      .catch((error) => {
        console.error('Error updating avance:', error.response ? error.response.data : error.message);
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
        Indicadores por Escuela/Oficina
      </Typography>
      {hasSchoolPermissions && (
        <div>
          <Typography variant="h5" sx={{ marginTop: '30px', marginBottom: '10px' }}>Escuelas</Typography>
          {filteredEscOfi.filter((item) => item.tipo === 'Escuela').map((escOfi, j) => (
            <Accordion key={j} defaultExpanded={true}>
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
                                    <Grid item xs={12}>
                                      <Typography>
                                        <strong>Objetivo Decanato: </strong>
                                        {data.objDec.find(objDec => objDec.id === indicatorContent.id_obj_dec)?.nombre || 'No disponible'}
                                      </Typography>
                                    </Grid>
                                  </Grid>                                  
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>
                                      Meta {new Date().getFullYear()}: {getMetaForCurrentYear(indicatorContent.id)}
                                    </Typography>
                                    <Grid item xs={12}>
                                      <Typography>
                                        Avance {new Date().getFullYear()}:
                                      </Typography>
                                      {editAvanceState ? (
                                        <>
                                          <TextField
                                            size="small"
                                            value={currentAvance}
                                            onChange={(e) => setCurrentAvance(e.target.value)}
                                          />
                                          <IconButton onClick={handleAvanceSave}>
                                            <SaveIcon />
                                          </IconButton>
                                        </>
                                      ) : (
                                        <>
                                          <Typography component="span">
                                            {getAvanceForCurrentYear(indicatorContent.id)}
                                          </Typography>
                                          <IconButton onClick={handleAvanceEdit} disabled={userPermissions.permiso !== 'Sistemas' && userPermissions.permiso !== 'Escuela_prof'}>
                                            <EditIcon />
                                          </IconButton>
                                        </>
                                      )}
                                    </Grid>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>¿Cómo se va a registrar las asistencias?</Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>Responsable: {indicatorContent.responsable}</Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
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
      )}
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
                                    <Typography>
                                      Meta {new Date().getFullYear()}: {getMetaForCurrentYear(indicatorContent.id)}
                                    </Typography>
                                    <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                    <Grid item xs={12}>
                                      <Typography>
                                        <strong>Objetivo Decanato: </strong>
                                        {data.objDec.find(objDec => objDec.id === indicatorContent.id_obj_dec)?.nombre || 'No disponible'}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>Meta 2024: {indicatorContent.meta}</Typography>
                                    <Grid item xs={12}>
                                      <Typography>
                                        Avance {new Date().getFullYear()}:
                                      </Typography>
                                      {editAvanceState ? (
                                        <>
                                          <TextField
                                            size="small"
                                            value={currentAvance}
                                            onChange={(e) => setCurrentAvance(e.target.value)}
                                          />
                                          <IconButton onClick={handleAvanceSave}>
                                            <SaveIcon />
                                          </IconButton>
                                        </>
                                      ) : (
                                        <>
                                          <Typography component="span">
                                            {getAvanceForCurrentYear(indicatorContent.id)}
                                          </Typography>
                                          <IconButton onClick={handleAvanceEdit} disabled={userPermissions.permiso !== 'Sistemas' && userPermissions.permiso !== 'Escuela_prof'}>
                                            <EditIcon />
                                          </IconButton>
                                        </>
                                      )}
                                    </Grid>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>¿Cómo se va a registrar las asistencias?</Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
                                  <Grid item xs={12}>
                                    <Typography>Responsable: {indicatorContent.responsable}</Typography>
                                  </Grid>
                                  <Divider sx={{ width: '100%', marginY: '10px', borderWidth: '2px', borderColor: 'black' }} />
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
            label="Responsable (Correo Univalle)"
            type="email"
            fullWidth
            name="responsable"
            value={newIndicator.responsable}
            onChange={handleInputChange}
            error={!!emailError}
            helperText={emailError}
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
