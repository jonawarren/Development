import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useGeolocation } from '../hooks/useGeolocation';
import type { RecommendationResponse } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

function PriceDots({ min, max }: { min: number; max: number }) {
  const labels = ['$', '$$', '$$$', '$$$$'];
  return (
    <span>{labels.slice(min - 1, max).join(' – ')}</span>
  );
}

export function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { coords, error: geoError, loading: geoLoading, request: requestGeo } = useGeolocation();
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!coords || !sessionId) return;
    setSearching(true);
    setError(null);
    try {
      const data = await api.getRecommendations(sessionId, coords.latitude, coords.longitude);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗺️</div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>Your Restaurant Matches</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          Both surveys are in! Let's find great places that work for both of you.
        </p>
      </div>

      {(error || geoError) && <ErrorBanner message={error || geoError || ''} />}

      {!coords && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#475569', marginBottom: '1rem' }}>
            We need your location to find nearby restaurants.
          </p>
          <button
            onClick={requestGeo}
            disabled={geoLoading}
            style={{
              padding: '0.85rem 2.5rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: geoLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {geoLoading ? 'Getting Location...' : 'Share My Location'}
          </button>
        </div>
      )}

      {coords && !results && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#16a34a', marginBottom: '1rem' }}>
            📍 Location detected. Ready to find restaurants!
          </p>
          <button
            onClick={search}
            disabled={searching}
            style={{
              padding: '0.85rem 2.5rem',
              background: searching ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: searching ? 'not-allowed' : 'pointer',
            }}
          >
            {searching ? 'Searching...' : 'Find Restaurants'}
          </button>
        </div>
      )}

      {searching && <LoadingSpinner label="Finding the best matches nearby..." />}

      {results && (
        <>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#475569',
          }}>
            <strong>Your combined preferences:</strong>{' '}
            {results.matched_preferences.cuisines.length > 0
              ? results.matched_preferences.cuisines.join(', ')
              : 'Any cuisine'
            }
            {results.matched_preferences.dietary_restrictions.length > 0
              ? ` · ${results.matched_preferences.dietary_restrictions.join(', ')}`
              : ''
            }
            {' · '}
            <PriceDots min={results.matched_preferences.price_range.min} max={results.matched_preferences.price_range.max} />
            {' · '}
            Within {results.matched_preferences.max_distance_miles} mi
          </div>

          {results.restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😕</div>
              <p>No highly-rated open restaurants found matching your combined preferences. Try widening your distance or adjusting price range.</p>
              <button
                onClick={search}
                style={{ marginTop: '1rem', padding: '0.7rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Found <strong>{results.restaurants.length}</strong> great matches — currently open, rated 4.0+
              </p>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {results.restaurants.map((r, i) => (
                  <RestaurantCard key={r.place_id ?? i} restaurant={r} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  onClick={search}
                  style={{ padding: '0.7rem 2rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Refresh Results
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
