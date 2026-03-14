export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: '#fff0f0',
      border: '1px solid #ffbbbb',
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      color: '#c0392b',
      marginBottom: '1rem',
    }}>
      {message}
    </div>
  );
}
