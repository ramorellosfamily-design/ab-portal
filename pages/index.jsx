import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.user.user_metadata?.first_login) {
          router.push('/change-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.3em', color: '#c4955a' }}>A &amp; B GENERAL CONTRACTING</div>
    </div>
  );
}
