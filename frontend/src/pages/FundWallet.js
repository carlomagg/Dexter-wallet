import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../services/api';

const FundWallet = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return setError('Please enter a valid amount greater than 0');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await walletService.fundWallet(amount);
      
      // Redirect to Monnify checkout page
      window.location.href = response.data.checkout_url;
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError('Failed to initiate payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row>
        <Col md={6} className="mx-auto">
          <Card className="auth-form mt-5">
            <Card.Body>
              <h2 className="text-center mb-4">Fund Your Wallet</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group id="amount" className="mb-4">
                  <Form.Label>Amount (₦)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₦</InputGroup.Text>
                    <Form.Control 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      required 
                    />
                  </InputGroup>
                </Form.Group>
                
                <Button 
                  disabled={loading} 
                  className="w-100 mt-3" 
                  type="submit"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  className="w-100 mt-3"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </Form>
              
              <div className="mt-4">
                <h5>Payment Information:</h5>
                <ul>
                  <li>You will be redirected to Monnify's secure payment page.</li>
                  <li>You can pay using your debit card or bank transfer.</li>
                  <li>After successful payment, your wallet will be credited automatically.</li>
                  <li>You will be redirected back to your dashboard after payment.</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FundWallet;
