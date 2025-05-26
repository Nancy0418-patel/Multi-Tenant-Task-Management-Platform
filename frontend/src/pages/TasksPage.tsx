import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  priority: string;
  category: string;
}

const statusOptions = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' }
];

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'feature'
  });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Partial<Task>>({});

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/tasks');
      setTasks(res.tasks);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask)
      });
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', category: 'feature' });
      setSuccess('Task created!');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t._id !== id));
      setSuccess('Task deleted!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task._id);
    setEditTask({ ...task });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditTask({ ...editTask, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id: string) => {
    try {
      await apiRequest(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(editTask)
      });
      setEditingId(null);
      setEditTask({});
      setSuccess('Task updated!');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiRequest(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setSuccess('Status updated!');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto' }}>
      <h2>Tasks</h2>
      <form onSubmit={handleCreateTask} style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input name="title" placeholder="Title" value={newTask.title} onChange={handleInputChange} required />
        <input name="description" placeholder="Description" value={newTask.description} onChange={handleInputChange} />
        <input name="dueDate" type="date" value={newTask.dueDate} onChange={handleInputChange} required />
        <select name="priority" value={newTask.priority} onChange={handleInputChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select name="category" value={newTask.category} onChange={handleInputChange}>
          <option value="feature">Feature</option>
          <option value="bug">Bug</option>
          <option value="improvement">Improvement</option>
        </select>
        <button type="submit" disabled={creating} style={{ minWidth: 100 }}>
          {creating ? 'Creating...' : 'Add Task'}
        </button>
      </form>
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : tasks.length === 0 ? (
        <div>No tasks found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                {editingId === task._id ? (
                  <>
                    <td><input name="title" value={editTask.title || ''} onChange={handleEditChange} /></td>
                    <td><input name="description" value={editTask.description || ''} onChange={handleEditChange} /></td>
                    <td>
                      <select name="status" value={editTask.status || ''} onChange={handleEditChange}>
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td><input name="dueDate" type="date" value={editTask.dueDate ? editTask.dueDate.slice(0,10) : ''} onChange={handleEditChange} /></td>
                    <td>
                      <select name="priority" value={editTask.priority || ''} onChange={handleEditChange}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td>
                      <select name="category" value={editTask.category || ''} onChange={handleEditChange}>
                        <option value="feature">Feature</option>
                        <option value="bug">Bug</option>
                        <option value="improvement">Improvement</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleEditSave(task._id)} style={{ color: 'green' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ color: 'gray' }}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                        disabled={task.status === 'expired'}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</td>
                    <td>{task.priority}</td>
                    <td>{task.category}</td>
                    <td>
                      <button onClick={() => startEdit(task)} style={{ color: 'blue' }}>Edit</button>
                      <button onClick={() => handleDeleteTask(task._id)} style={{ color: 'red' }}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TasksPage; 