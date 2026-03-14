const OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
];

interface Props {
  selected: string[];
  onChange: (values: string[]) => void;
}

export function DietaryRestrictions({ selected, onChange }: Props) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  };

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
        Dietary Restrictions <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {OPTIONS.map(o => (
          <label key={o.value} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '6px 14px',
            borderRadius: '20px',
            border: selected.includes(o.value) ? '2px solid #16a34a' : '2px solid #d1d5db',
            background: selected.includes(o.value) ? '#f0fdf4' : '#f9fafb',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}>
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              style={{ display: 'none' }}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}
