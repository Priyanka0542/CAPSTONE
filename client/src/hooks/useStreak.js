import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useStreak() {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    history: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStreaks = useCallback(async () => {
    try {
      const { data } = await api.get('/activity/streaks');
      setStreakData(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  return { ...streakData, loading, fetchStreaks };
}

export function useActivity() {
  const [todayData, setTodayData] = useState({ activities: [], todayTask: null });
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    try {
      const { data } = await api.get('/activity/today');
      setTodayData(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const checkin = async (careerPathId, taskDescription) => {
    const { data } = await api.post('/activity/checkin', { careerPathId, taskDescription });
    await fetchToday();
    return data;
  };

  return { ...todayData, loading, fetchToday, checkin };
}

export function useBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    try {
      const { data } = await api.get('/activity/badges');
      setBadges(data.badges);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return { badges, loading, fetchBadges };
}
