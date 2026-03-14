import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStatus } from '../hooks/useSessionStatus';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export function WaitingRoom() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { status, error } = useSessionStatus(sessionId);

  useEffect(() => {
    if (status?.status === 'complete') {
      navigate(`/results/${sessionId}`);
    }
  }, [status, sessionId, navigate]);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>Waiting for Partner</h1>
      <p style={{ color: '#64748b', margin: '0.75rem 0 2rem' }}>
        Hang tight! As soon as your partner submits their preferences, you'll be redirected to see your matches.
      </p>

      {error && <ErrorBanner message={error} />}

      {status && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            {[1, 2].map(n => {
              const done = (status.partners_completed ?? 0) >= n;
              return (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: done ? '#dcfce7' : '#f1f5f9',
                    border: done ? '2px solid #16a34a' : '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    margin: '0 auto 0.4rem',
                  }}>
                    {done ? '✅' : '⏸️'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: done ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                    Partner {n}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ margin: '1rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {status.partners_completed} of 2 surveys completed
          </p>
        </div>
      )}

      {!status && !error && <LoadingSpinner label="Checking status..." />}

      <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
        This page refreshes automatically every few seconds.
      </p>
    </div>
  );
}
