import React from 'react';
import { Card, Badge } from 'react-bootstrap';

const TransactionCard = ({ transaction }) => {
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

  return (
    <Card className={`mb-3 transaction-item ${transaction.status.toLowerCase()}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">
              {transaction.transaction_type === 'DEPOSIT' ? 'Wallet Funding' : 'Withdrawal'}
            </h5>
            <p className="text-muted mb-0">
              {formatDate(transaction.created_at)}
            </p>
          </div>
          <div className="text-end">
            <h5 className="mb-1">₦{transaction.amount}</h5>
            {getStatusBadge(transaction.status)}
          </div>
        </div>
        <hr />
        <div className="d-flex justify-content-between">
          <small className="text-muted">Reference: {transaction.reference}</small>
          {transaction.payment_method && (
            <small className="text-muted">Method: {transaction.payment_method}</small>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TransactionCard;
