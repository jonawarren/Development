const LEVELS = [
  { value: 1, label: '$', desc: 'Under $15' },
  { value: 2, label: '$$', desc: '$15–30' },
  { value: 3, label: '$$$', desc: '$30–60' },
  { value: 4, label: '$$$$', desc: '$60+' },
];

interface Props {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export function PriceRangeSelector({ min, max, onChange }: Props) {
  const toggle = (v: number) => {
    if (v < min) onChange(v, max);
    else if (v > max) onChange(min, v);
    else if (v === min && v < max) onChange(v + 1, max);
    else if (v === max && v > min) onChange(min, v - 1);
    else {
      // only one selected — expand
      if (v > 1) onChange(v - 1, v);
      else onChange(v, v + 1);
    }
  };

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
        Price Range <span style={{ fontWeight: 400, color: '#888' }}>({LEVELS[min - 1]?.label} – {LEVELS[max - 1]?.label})</span>
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {LEVELS.map(l => {
          const inRange = l.value >= min && l.value <= max;
          return (
            <button
              key={l.value}
              type="button"
              onClick={() => toggle(l.value)}
              title={l.desc}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: inRange ? '2px solid #7c3aed' : '2px solid #d1d5db',
                background: inRange ? '#f5f3ff' : '#f9fafb',
                color: inRange ? '#6d28d9' : '#374151',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: inRange ? 700 : 400,
              }}
            >
              {l.label}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#888' }}>
        Click to toggle — selected range: {LEVELS[min - 1]?.desc} to {LEVELS[max - 1]?.desc}
      </p>
    </div>
  );
}
