const CUISINES = [
  'American', 'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian',
  'Thai', 'Mediterranean', 'Korean', 'French', 'Greek', 'Vietnamese',
  'Middle Eastern', 'Spanish', 'Caribbean', 'Brazilian',
  'Seafood', 'Sushi', 'Pizza', 'Burgers', 'Steakhouse',
];

interface Props {
  label: string;
  selected: string[];
  onChange: (values: string[]) => void;
}

export function CuisineSelector({ label, selected, onChange }: Props) {
  const toggle = (cuisine: string) => {
    onChange(
      selected.includes(cuisine)
        ? selected.filter(c => c !== cuisine)
        : [...selected, cuisine]
    );
  };

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {CUISINES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selected.includes(c) ? '2px solid #2563eb' : '2px solid #d1d5db',
              background: selected.includes(c) ? '#eff6ff' : '#f9fafb',
              color: selected.includes(c) ? '#1d4ed8' : '#374151',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: selected.includes(c) ? 600 : 400,
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
