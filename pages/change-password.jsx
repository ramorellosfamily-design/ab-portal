import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChangePassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor = ['', '#9a4e4e', '#c4955a', '#c4955a', '#4e9a6f', '#4e9a6f'][strength];

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { first_login: false }
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#c4955a', marginBottom: 12 }}>A &amp; B General Contracting</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 300, color: '#faf9f7' }}>Set Your Password</div>
        <p style={{ color: '#7a8390', fontSize: 12, marginTop: 10, maxWidth: 320, lineHeight: 1.7 }}>
          For your security, please set a personal password before accessing your portal.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ background: '#141414', border: '1px solid rgba(196,149,90,0.2)', padding: '40px 36px' }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a8390', marginBottom: 8 }}>New Password</div>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderBottom: `1px solid ${newPassword ? strengthColor : 'rgba(196,149,90,0.3)'}`, color: '#f4f1ec', padding: '11px 14px', fontFamily: 'Georgia,serif', fontSize: 14, outline: 'none' }}
            />
            {newPassword && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: 28, height: 2, background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: strengthColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a8390', marginBottom: 8 }}>Confirm Password</div>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderBottom: confirm && confirm === newPassword ? '1px solid #4e9a6f' : '1px solid rgba(196,149,90,0.3)', color: '#f4f1ec', padding: '11px 14px', fontFamily: 'Georgia,serif', fontSize: 14, outline: 'none' }}
            />
            {confirm && confirm === newPassword && <div style={{ marginTop: 6, fontFamily: "'Courier New',monospace", fontSize: 8, color: '#4e9a6f' }}>✓ Passwords match</div>}
          </div>

          {error && <div style={{ padding: '10px 14px', background: 'rgba(154,78,78,0.1)', border: '1px solid rgba(154,78,78,0.3)', color: '#c47a7a', fontSize: 12, marginBottom: 20 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#2a2a2a' : '#c4955a', color: loading ? '#4a4f57' : '#141414', border: 'none', padding: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            {loading ? 'Saving...' : 'Set Password & Continue →'}
          </button>
        </div>
      </form>
    </div>
  );
}
