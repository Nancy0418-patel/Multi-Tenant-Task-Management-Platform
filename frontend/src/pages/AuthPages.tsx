import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Add this import
import AuthForm from '../components/AuthForm';
import { apiRequest } from '../api';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate(); // <-- Add this line

  const handleAuth = async (data: any) => {
    setLoading(true);
    setError(undefined);
    try {
      let payload: any = {};
      if (mode === 'login') {
        payload = {
          email: data.email,
          password: data.password
        };
      } else {
        if (data.organizationName) {
          payload = {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            organizationName: data.organizationName
          };
        } else {
          payload = {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            inviteCode: data.inviteCode
          };
        }
      }
      const endpoint =
        mode === 'login'
          ? '/auth/login'
          : payload.organizationName
          ? '/auth/register'
          : '/auth/join-organization';
      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('organization', JSON.stringify(res.organization));
      navigate('/dashboard'); // <-- Use navigate instead of reload
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthForm type={mode} onSubmit={handleAuth} loading={loading} error={error} />
      <div style={{ marginTop: 16 }}>
        {mode === 'login' ? (
          <span>
            Don&apos;t have an account?{' '}
            <button onClick={() => setMode('register')}>Register</button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button onClick={() => setMode('login')}>Login</button>
          </span>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
