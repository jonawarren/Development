const OPTIONS = [
  { value: 'casual', label: 'Casual', icon: '👕' },
  { value: 'fine dining', label: 'Fine Dining', icon: '🍷' },
  { value: 'fast casual', label: 'Fast Casual', icon: '🥙' },
  { value: 'bar/pub', label: 'Bar / Pub', icon: '🍺' },
  { value: 'outdoor seating', label: 'Outdoor', icon: '🌿' },
  { value: 'family-friendly', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'romantic', label: 'Romantic', icon: '❤️' },
];

interface Props {
  selected: string[];
  onChange: (values: string[]) => void;
}

export function AtmosphereSelector({ selected, onChange }: Props) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  };

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
        Atmosphere <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {OPTIONS.map(o => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: on ? '2px solid #db2777' : '2px solid #d1d5db',
                background: on ? '#fdf2f8' : '#f9fafb',
                color: on ? '#be185d' : '#374151',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{o.icon}</span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
