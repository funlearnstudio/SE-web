import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="narrow" style={{ padding: '80px 0 110px' }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: 42, letterSpacing: '-.04em', marginBottom: 10 }}>Page not found</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The SE documentation page you requested does not exist.</p>
      <Link className="button-primary" href="/">Back to SE home</Link>
    </div>
  );
}
