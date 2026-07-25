import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function usePaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/paths');
      setPaths(data.paths);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load paths');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const createPath = async (goal, profile) => {
    const { data } = await api.post('/paths', { goal, profile });
    setPaths((prev) => [data.careerPath, ...prev]);
    return data;
  };

  const updatePath = async (id, updates) => {
    const { data } = await api.patch(`/paths/${id}`, updates);
    setPaths((prev) => prev.map((p) => (p._id === id ? data.path : p)));
    return data;
  };

  const deletePath = async (id) => {
    await api.delete(`/paths/${id}`);
    setPaths((prev) => prev.filter((p) => p._id !== id));
  };

  const comparePaths = async (ids) => {
    const { data } = await api.get(`/paths/compare?ids=${ids.join(',')}`);
    return data.paths;
  };

  const completeMilestone = async (pathId, milestoneId) => {
    const { data } = await api.patch(`/paths/${pathId}/milestone/${milestoneId}`);
    setPaths((prev) => prev.map((p) => (p._id === pathId ? data.path : p)));
    return data;
  };

  return {
    paths,
    loading,
    error,
    fetchPaths,
    createPath,
    updatePath,
    deletePath,
    comparePaths,
    completeMilestone,
  };
}
