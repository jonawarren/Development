import type { Restaurant } from '../types';

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: '#555', fontSize: '0.85rem', marginLeft: '0.4rem' }}>
        {rating.toFixed(1)} ({new Intl.NumberFormat().format(rating)} reviews)
      </span>
    </span>
  );
}

export function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {r.photo_url && (
        <img
          src={r.photo_url}
          alt={r.name}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div style={{ padding: '1rem 1.25rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{r.name}</h3>
          <span style={{
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #86efac',
            borderRadius: '6px',
            padding: '2px 10px',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          }}>
            {r.open_now ? 'Open Now' : 'Closed'}
          </span>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <Stars rating={r.rating} />
        </div>

        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#555' }}>
          <span>{r.price_level}</span>
          <span>·</span>
          <span>{r.distance_miles} mi away</span>
          {r.hours_today && <><span>·</span><span>{r.hours_today}</span></>}
        </div>

        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#777' }}>{r.address}</p>

        {r.health_score !== null && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '2px 8px' }}>
              Health Score: {r.health_score}
            </span>
          </div>
        )}

        <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem' }}>
          {r.google_maps_url && (
            <a href={r.google_maps_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem' }}>
              View on Maps
            </a>
          )}
          {r.phone && (
            <a href={`tel:${r.phone}`} style={{ color: '#2563eb', fontSize: '0.9rem' }}>
              {r.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
