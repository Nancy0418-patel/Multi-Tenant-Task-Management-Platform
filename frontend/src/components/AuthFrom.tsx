import React, { useState } from 'react';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    inviteCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      {type === 'register' && (
        <>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="organizationName"
            placeholder="Organization Name (or leave blank to join)"
            value={form.organizationName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="inviteCode"
            placeholder="Invite Code (if joining)"
            value={form.inviteCode}
            onChange={handleChange}
          />
        </>
      )}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : type === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
};

export default AuthForm; 
