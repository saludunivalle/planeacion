import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Box } from '@mui/material';
import Header from './components/Header';
import LoadingIndicator from './components/LoadingIndicator';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import GoogleLogin from './components/GoogleLogin';
import Cookies from 'js-cookie';
import './App.css';

const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsLogged(true);
    }
  }, []);

  const handleChange = (event, newValue) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentTab(newValue);
      setIsLoading(false);
    }, 500); 
  };

  return (
    <>
      {isLogged ? (
        <div>
          <Header userInfo={userInfo} />
          <Container className="mt-5">
            <Box>
              <Tabs
                value={currentTab}
                onChange={handleChange}
                aria-label="Gestión de Indicadores Tabs"
              >
                <Tab 
                  label="Ejes, Estrategias y Objetivos Decanato" 
                  sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                  />
                <Tab 
                  label="Indicadores por Dependencia" 
                  sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                  />
              </Tabs>
            </Box>
            <LoadingIndicator isLoading={isLoading} />
            {currentTab === 0 && <Page1 />}
            {currentTab === 1 && <Page2 />}
          </Container>
        </div>
      ) : (
        <GoogleLogin setIsLogin={setIsLogged} setUserInfo={setUserInfo} />
      )}
    </>
  );
};

export default App;
