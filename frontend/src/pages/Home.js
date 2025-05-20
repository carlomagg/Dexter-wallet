import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container>
      <Row className="my-5">
        <Col md={6} className="mx-auto text-center">
          <h1 className="mb-4">Welcome to Mini Wallet System</h1>
          <p className="lead mb-4">
            A secure digital wallet solution with Monnify payment integration.
            Fund your wallet, track your balance, and view transaction history.
          </p>
          {isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" size="lg">
              Go to Dashboard
            </Button>
          ) : (
            <div>
              <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                Register
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg">
                Login
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-wallet2 fs-1"></i>
              </div>
              <Card.Title>Secure Wallet</Card.Title>
              <Card.Text>
                Safely store your funds in our secure digital wallet system.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-credit-card fs-1"></i>
              </div>
              <Card.Title>Easy Funding</Card.Title>
              <Card.Text>
                Fund your wallet easily using Monnify's secure payment gateway.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-graph-up fs-1"></i>
              </div>
              <Card.Title>Transaction History</Card.Title>
              <Card.Text>
                Keep track of all your transactions with detailed history.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
