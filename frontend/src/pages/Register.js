import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { email, firstName, lastName, password, confirmPassword } = formData;
    
    // Validate form
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, firstName, lastName);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account. ' + (err.response?.data?.message || ''));
      console.error(err);
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
              <h2 className="text-center mb-4">Register</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </Form.Group>
                
                <Row>
                  <Col>
                    <Form.Group id="firstName" className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group id="lastName" className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group id="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </Form.Group>
                
                <Form.Group id="confirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                  />
                </Form.Group>
                
                <Button 
                  disabled={loading} 
                  className="w-100 mt-3" 
                  type="submit"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <p>
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
