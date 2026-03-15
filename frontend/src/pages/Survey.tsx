import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { SurveySubmit } from '../types';
import { SurveyForm } from '../components/SurveyForm/SurveyForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export function Survey() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.getSurvey(token)
      .then(info => {
        setSessionId(info.session_id);
        setAlreadySubmitted(info.already_submitted);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (data: SurveySubmit) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.submitSurvey(token, data);
      if (result.status === 'complete') {
        navigate(`/results/${result.session_id}`);
      } else {
        navigate(`/waiting/${result.session_id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your survey..." />;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>Your Food Preferences</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          Tell us what you're in the mood for. Your partner will fill out their own survey separately.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {alreadySubmitted ? (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '10px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#92400e',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <p style={{ margin: 0 }}>You've already submitted your preferences for this session.</p>
          {sessionId && (
            <a href={`/waiting/${sessionId}`} style={{ color: '#2563eb', display: 'block', marginTop: '1rem' }}>
              Check if your partner is done →
            </a>
          )}
        </div>
      ) : (
        <SurveyForm onSubmit={handleSubmit} submitting={submitting} />
      )}
    </div>
  );
}
