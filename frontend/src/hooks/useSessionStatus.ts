import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import type { SessionStatus } from '../types';

export function useSessionStatus(sessionId: string | undefined, intervalMs = 3000) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const data = await api.getSessionStatus(sessionId);
        setStatus(data);
        if (data.status === 'complete' && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to check status');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, intervalMs]);

  return { status, error };
}
