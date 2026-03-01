import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f1013',
      color: '#ffffff',
      fontFamily: 'var(--font-geist-sans)',
    }}>
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', color: '#0066ff' }}>
          DataLink Platform
        </h1>
        <p style={{ fontSize: '18px', color: '#9499aa', marginBottom: '32px' }}>
          Admin Dashboard for Data Management
        </p>
        <Link
          href="/admin"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: '#0066ff',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
