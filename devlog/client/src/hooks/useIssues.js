import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

export function useIssues(projectId) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchIssues = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/issues?projectId=${projectId}`);
      setIssues(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Join/leave socket room
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit('join:project', projectId);
    return () => socket.emit('leave:project', projectId);
  }, [socket, projectId]);

  // Real-time listeners
  useEffect(() => {
    if (!socket) return;

    const onCreated = (issue) => {
      setIssues((prev) => {
        if (prev.find((i) => i._id === issue._id)) return prev;
        return [...prev, issue];
      });
    };

    const onUpdated = (issue) => {
      setIssues((prev) => prev.map((i) => (i._id === issue._id ? issue : i)));
    };

    const onDeleted = ({ _id }) => {
      setIssues((prev) => prev.filter((i) => i._id !== _id));
    };

    const onComment = (issue) => {
      setIssues((prev) => prev.map((i) => (i._id === issue._id ? issue : i)));
    };

    socket.on('issue:created', onCreated);
    socket.on('issue:updated', onUpdated);
    socket.on('issue:deleted', onDeleted);
    socket.on('comment:added', onComment);

    return () => {
      socket.off('issue:created', onCreated);
      socket.off('issue:updated', onUpdated);
      socket.off('issue:deleted', onDeleted);
      socket.off('comment:added', onComment);
    };
  }, [socket]);

  const createIssue = async (payload) => {
    const { data } = await api.post('/issues', { ...payload, projectId });
    return data;
  };

  const updateIssue = async (id, payload) => {
    const { data } = await api.put(`/issues/${id}`, payload);
    return data;
  };

  const deleteIssue = async (id) => {
    await api.delete(`/issues/${id}`);
  };

  const addComment = async (id, text) => {
    const { data } = await api.post(`/issues/${id}/comments`, { text });
    return data;
  };

  // Optimistic drag update: reorder issues locally, then persist
  const reorderIssues = async (updatedIssues, movedId, newStatus, newOrder) => {
    setIssues(updatedIssues);
    await api.put(`/issues/${movedId}`, { status: newStatus, order: newOrder });
  };

  return { issues, loading, createIssue, updateIssue, deleteIssue, addComment, reorderIssues, refetch: fetchIssues };
}
