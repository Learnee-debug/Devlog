import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createProject = async (name, description) => {
    const { data } = await api.post('/projects', { name, description });
    setProjects((prev) => [data, ...prev]);
    return data;
  };

  const addMember = async (projectId, userId) => {
    const { data } = await api.post(`/projects/${projectId}/members`, { userId });
    setProjects((prev) => prev.map((p) => (p._id === projectId ? data : p)));
    return data;
  };

  return { projects, loading, error, createProject, addMember, refetch: fetch };
}
