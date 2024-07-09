import React from 'react';

const LoadingIndicator = ({ isLoading }) => {
  return isLoading ? <div id="loading-indicator">Cargando...</div> : null;
};

export default LoadingIndicator;
