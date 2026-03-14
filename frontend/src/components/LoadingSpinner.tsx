export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="spinner" />
      <p style={{ marginTop: '0.75rem', color: '#666' }}>{label}</p>
    </div>
  );
}
