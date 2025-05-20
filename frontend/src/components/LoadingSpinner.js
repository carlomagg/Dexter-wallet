import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <Spinner animation="border" role="status" variant="primary" />
      <p className="mt-3">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
