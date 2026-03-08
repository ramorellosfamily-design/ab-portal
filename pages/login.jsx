import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid credentials. Please check your email and password.');
      setLoading(false);
      return;
    }

    // Check if first login — redirect to change password
    if (data.user?.user_metadata?.first_login) {
      router.push('/change-password');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Wordmark */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#c4955a', marginBottom: 12 }}>
          A &amp; B General Contracting
        </div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 300, color: '#faf9f7', letterSpacing: '0.01em' }}>
          Client Portal
        </div>
        <div style={{ width: 32, height: 1, background: '#c4955a', margin: '14px auto 0' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ background: '#141414', border: '1px solid rgba(196,149,90,0.2)', padding: '40px 36px' }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a8390', marginBottom: 8 }}>Email Address</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(196,149,90,0.3)',
                color: '#f4f1ec', padding: '11px 14px',
                fontFamily: 'Georgia,serif', fontSize: 14,
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#c4955a'}
              onBlur={e => e.target.style.borderColor = 'rgba(196,149,90,0.3)'}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a8390', marginBottom: 8 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(196,149,90,0.3)',
                color: '#f4f1ec', padding: '11px 14px',
                fontFamily: 'Georgia,serif', fontSize: 14,
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#c4955a'}
              onBlur={e => e.target.style.borderColor = 'rgba(196,149,90,0.3)'}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(154,78,78,0.1)', border: '1px solid rgba(154,78,78,0.3)', color: '#c47a7a', fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#2a2a2a' : '#c4955a',
              color: loading ? '#4a4f57' : '#141414', border: 'none',
              padding: '13px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Courier New',monospace", fontSize: 10,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing In...' : 'Access Portal →'}
          </button>

        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontFamily: "'Courier New',monospace", fontSize: 9, color: '#4a4f57', lineHeight: 1.8 }}>
          Having trouble? Contact your A&amp;B representative.<br />
          Angel Morell (423) 907-4454 · Bryson Greco (865) 224-4931
        </div>
      </form>
    </div>
  );
}
