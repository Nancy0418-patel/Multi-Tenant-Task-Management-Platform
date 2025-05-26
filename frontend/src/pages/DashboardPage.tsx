import React from 'react';
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const organization = JSON.parse(localStorage.getItem('organization') || 'null');
  return (
    <>
      <Navbar />
      <div style={{ padding: 32 }}>
        <h2>Welcome, {user?.firstName}!</h2>
        <p>Organization: {organization?.name}</p>
        <div style={{ marginTop: 32 }}>
          <strong>Dashboard coming soon...</strong>
        </div>
      </div>
    </>
  );
};

export default DashboardPage; 