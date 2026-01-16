import { CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
  header: {
    backgroundColor: '#1B4332',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    letterSpacing: '0.15em',
  },
  subtitle: {
    margin: 0,
    fontSize: '11px',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.05em',
    fontWeight: 300,
  },
};

export function Header() {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>麻雀点数計算ドリル</h1>
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
      <p style={styles.subtitle}>符計算から点数計算まで</p>
    </header>
  );
}
