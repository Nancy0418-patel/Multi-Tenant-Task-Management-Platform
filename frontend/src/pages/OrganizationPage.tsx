import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' }
];

const OrganizationPage: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/organizations/members');
      setMembers(res.members);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteCode = async () => {
    try {
      const res = await apiRequest('/organizations/invite-code', { method: 'POST' });
      setInviteCode(res.inviteCode);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invite code');
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchInviteCode();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await apiRequest(`/organizations/members/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      setSuccess('Role updated!');
      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm('Remove this user from the organization?')) return;
    try {
      await apiRequest(`/organizations/members/${userId}`, { method: 'DELETE' });
      setSuccess('User removed!');
      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to remove user');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest('/organizations/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail })
      });
      setSuccess('Invitation sent!');
      setInviteEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto' }}>
      <h2>Organization Members</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Invite Code:</strong> <span style={{ background: '#f1f2f6', padding: '2px 8px', borderRadius: 4 }}>{inviteCode}</span>
        <button style={{ marginLeft: 8 }} onClick={fetchInviteCode}>Regenerate</button>
      </div>
      {(user.role === 'admin' || user.role === 'manager') && (
        <form onSubmit={handleInvite} style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="email"
            placeholder="Invite user by email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            style={{ minWidth: 220 }}
          />
          <button type="submit" disabled={inviteLoading}>
            {inviteLoading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      )}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading members...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id}>
                <td>{m.firstName} {m.lastName} {m._id === user._id && <span style={{ color: '#888' }}>(You)</span>}</td>
                <td>{m.email}</td>
                <td>
                  {user.role === 'admin' && user._id !== m._id ? (
                    <select value={m.role} onChange={e => handleRoleChange(m._id, e.target.value)}>
                      {roleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    m.role.charAt(0).toUpperCase() + m.role.slice(1)
                  )}
                </td>
                <td>
                  {user.role === 'admin' && user._id !== m._id && (
                    <button onClick={() => handleRemove(m._id)} style={{ color: 'red' }}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 24, color: '#555', fontSize: 15 }}>
        <strong>To invite a user:</strong> Share the invite code above or use the email invite form. New users can join your organization using the code during registration, or via the email invite link.
      </div>
    </div>
  );
};

export default OrganizationPage; 