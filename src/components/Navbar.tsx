import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logoImg} alt="Tea Mentor Logo" />
        <h1>Tea Mentor</h1>
      </Link>
      
      <Link 
        to="/" 
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        Dashboard
      </Link>
      
      <Link 
        to="/mentors" 
        className={`nav-item ${location.pathname.startsWith('/mentors') ? 'active' : ''}`}
      >
        Manage Mentors
      </Link>
      
      <Link 
        to="/mentees" 
        className={`nav-item ${location.pathname.startsWith('/mentees') ? 'active' : ''}`}
      >
        Manage Mentees
      </Link>
      
      <Link 
        to="/groups" 
        className={`nav-item ${location.pathname.startsWith('/groups') ? 'active' : ''}`}
      >
        Manage Groups
      </Link>
      
      <Link 
        to="/schedule" 
        className={`nav-item ${location.pathname.startsWith('/schedule') ? 'active' : ''}`}
      >
        📅 Schedule
      </Link>
      
      <Link 
        to="/analytics" 
        className={`nav-item ${location.pathname.startsWith('/analytics') ? 'active' : ''}`}
      >
        📊 Analytics
      </Link>
      
      <Link 
        to="/testimonials" 
        className={`nav-item ${location.pathname.startsWith('/testimonials') ? 'active' : ''}`}
      >
        💬 Reviews
      </Link>
    </nav>
  );
};

export default Navbar; 