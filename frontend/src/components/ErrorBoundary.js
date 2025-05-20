import React, { Component } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Attempt to recover by reloading the page
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p>
              We're sorry, but an error occurred while rendering this component.
            </p>
            {this.state.error && (
              <p className="text-muted">
                <small>{this.state.error.toString()}</small>
              </p>
            )}
            <hr />
            <div className="d-flex justify-content-end">
              <Button 
                onClick={this.handleReset} 
                variant="outline-danger"
              >
                Return to Home
              </Button>
            </div>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
