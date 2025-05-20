import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionCard from '../components/TransactionCard';

const Dashboard = () => {
  const { currentUser, updateUserWallet } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch wallet balance
        const walletResponse = await walletService.getBalance();
        updateUserWallet(walletResponse.data);
        
        // Fetch transactions
        const transactionsResponse = await walletService.getTransactions();
        setTransactions(transactionsResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [updateUserWallet]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge bg="success">Completed</Badge>;
      case 'PENDING':
        return <Badge bg="warning">Pending</Badge>;
      case 'FAILED':
        return <Badge bg="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard data..." />;
  }

  return (
    <Container>
      <h1 className="my-4">Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Row>
        <Col md={4}>
          <Card className="dashboard-card balance-card mb-4">
            <Card.Body>
              <Card.Title>Wallet Balance</Card.Title>
              <h2 className="display-4">₦{currentUser?.wallet?.balance || '0.00'}</h2>
              <Button 
                as={Link} 
                to="/fund-wallet" 
                variant="light" 
                className="mt-3"
              >
                Fund Wallet
              </Button>
            </Card.Body>
          </Card>
          
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Account Information</Card.Title>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Account Created:</strong> {formatDate(currentUser?.wallet?.created_at || new Date())}</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Recent Transactions</Card.Title>
              
              {transactions.length === 0 ? (
                <div className="text-center my-4">
                  <p>No transactions yet. Fund your wallet to get started!</p>
                  <Button 
                    as={Link} 
                    to="/fund-wallet" 
                    variant="primary" 
                    className="mt-2"
                  >
                    Fund Wallet
                  </Button>
                </div>
              ) : (
                <div>
                  {transactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
