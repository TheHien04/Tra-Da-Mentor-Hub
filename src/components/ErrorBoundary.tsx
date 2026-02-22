import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5'
        }}>
          <div style={{
            background: '#ffebee',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#c62828', marginBottom: '1rem' }}>⚠️ Có lỗi xảy ra</h1>
            <p style={{ color: '#d32f2f', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Please refresh the page (F5)'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.7rem 1.5rem',
                background: '#c62828',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
