import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { walletService } from '../services/api';

const PaymentCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the transaction reference from URL parameters
        const queryParams = new URLSearchParams(location.search);
        const reference = queryParams.get('paymentReference');
        
        if (!reference) {
          setStatus('failed');
          setError('Payment reference not found in the URL');
          return;
        }
        
        // Verify the transaction with our backend
        const response = await walletService.verifyTransaction(reference);
        const transaction = response.data;
        
        if (transaction.status === 'COMPLETED') {
          setStatus('success');
          setMessage(`Your wallet has been successfully funded with ₦${transaction.amount}`);
        } else if (transaction.status === 'PENDING') {
          setStatus('pending');
          setMessage('Your payment is being processed. Your wallet will be credited once confirmed.');
        } else {
          setStatus('failed');
          setError('Payment was not successful. Please try again.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('failed');
        setError('Failed to verify payment. Please check your dashboard for the latest status.');
      }
    };
    
    verifyPayment();
  }, [location.search]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Verifying your payment...</p>
          </div>
        );
      
      case 'success':
        return (
          <>
            <div className="text-center my-4">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="text-success">Payment Successful!</h3>
              <p className="mt-3">{message}</p>
            </div>
            <Button 
              variant="primary" 
              className="w-100"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </>
        );
      
      case 'pending':
        return (
          <>
            <div className="text-center my-4">
              <div className="mb-4">
                <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="text-warning">Payment Pending</h3>
              <p className="mt-3">{message}</p>
            </div>
            <Button 
              variant="primary" 
              className="w-100"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </>
        );
      
      case 'failed':
        return (
          <>
            <div className="text-center my-4">
              <div className="mb-4">
                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="text-danger">Payment Failed</h3>
              <Alert variant="danger">{error}</Alert>
            </div>
            <div className="d-grid gap-2">
              <Button 
                variant="primary"
                onClick={() => navigate('/fund-wallet')}
              >
                Try Again
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container>
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <Card className="auth-form">
            <Card.Body>
              <h2 className="text-center mb-4">Payment Status</h2>
              {renderContent()}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default PaymentCallback;
