const OPTIONS = [0.5, 1, 2, 5, 10] as const;

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function DistanceSelector({ value, onChange }: Props) {
  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
        Max Travel Distance
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {OPTIONS.map(d => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: value === d ? '2px solid #0891b2' : '2px solid #d1d5db',
              background: value === d ? '#ecfeff' : '#f9fafb',
              color: value === d ? '#0e7490' : '#374151',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: value === d ? 700 : 400,
            }}
          >
            {d} mi
          </button>
        ))}
      </div>
    </div>
  );
}
