// src/components/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="hero min-h-screen bg-error">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-white">Oups !</h1>
              <p className="text-white mt-4">
                Une erreur est survenue. Revenez plus tard ou rechargez la page.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = { children: PropTypes.node };

export default ErrorBoundary;