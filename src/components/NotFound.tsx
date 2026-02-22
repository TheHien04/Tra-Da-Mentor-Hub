import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        background: '#fff',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px'
      }}>
        <FaExclamationTriangle size={64} style={{ color: '#f39c12', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', color: '#666', margin: '0 0 1.5rem 0' }}>
          Page not found
        </h2>
        <p style={{ color: '#999', marginBottom: '2rem', lineHeight: '1.6' }}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
