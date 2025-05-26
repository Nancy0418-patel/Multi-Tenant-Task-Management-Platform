import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };
  return (
    <nav className="navbar">
      <div className="navbar-brand">Task Manager</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tasks">Tasks</Link>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link to="/organization">Organization</Link>
        )}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar; 