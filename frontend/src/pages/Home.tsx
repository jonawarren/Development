import { useState } from 'react';
import { api } from '../api/client';
import type { SessionCreated } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

function CopyableLink({ label, token }: { label: string; token: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/survey/${token}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>{label}</div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <code style={{
          flex: 1,
          background: '#e2e8f0',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.82rem',
          overflowX: 'auto',
          wordBreak: 'break-all',
        }}>
          {url}
        </code>
        <button
          onClick={copy}
          style={{
            padding: '6px 16px',
            background: copied ? '#16a34a' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export function Home() {
  const [session, setSession] = useState<SessionCreated | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createSession();
      setSession(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Date Night Decider</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          Both partners answer a quick food preference survey, then get personalized restaurant recommendations that work for both of you.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {!session ? (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={create}
            disabled={loading}
            style={{
              padding: '0.9rem 2.5rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Start a New Session'}
          </button>
        </div>
      ) : loading ? (
        <LoadingSpinner label="Creating your session..." />
      ) : (
        <div>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#15803d',
          }}>
            Session created! Share each link with one partner. Once both surveys are done, you'll be able to get recommendations.
          </div>

          <CopyableLink label="Partner 1 Survey Link" token={session.partner_a_survey_token} />
          <CopyableLink label="Partner 2 Survey Link" token={session.partner_b_survey_token} />

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <a
              href={`/waiting/${session.session_id}`}
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: '#f1f5f9',
                color: '#475569',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
              }}
            >
              View Session Status →
            </a>
          </div>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>
            Session expires: {new Date(session.expires_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
