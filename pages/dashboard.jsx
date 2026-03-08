import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STAGES = [
  { id: 'insurance_leads', label: 'Claim Filed',      icon: '📋', desc: 'Your claim has been filed with the insurance carrier.' },
  { id: 'signed',          label: 'Documents Signed', icon: '✍️', desc: 'Your Insurance Authorization & Funding Agreement is on file.' },
  { id: 'inspected',       label: 'Inspection Done',  icon: '🔍', desc: 'The insurance carrier has inspected your property. Awaiting their response.' },
  { id: 'contested',       label: 'Under Review',     icon: '⚖️', desc: 'A&B is actively negotiating with your carrier to ensure fair coverage.' },
  { id: 'work_order',      label: 'Work Contracted',  icon: '📝', desc: 'Your work contract is signed. Restoration is being prepared.' },
  { id: 'install',         label: 'In Progress',      icon: '🏗️', desc: 'Your restoration is actively underway. Our team is on-site.' },
  { id: 'final',           label: 'Complete',         icon: '✅', desc: 'Your restoration is complete. Your warranty is active.' },
];

export default function PortalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('status');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      if (session.user.user_metadata?.first_login) { router.push('/change-password'); return; }
      setUser(session.user);
      loadData(session.user);
    });
  }, []);

  async function loadData(usr) {
    // Get client record by portal_username in JWT metadata
    const username = usr.user_metadata?.portal_username;
    const clientId = usr.user_metadata?.client_id;

    const { data: projs } = await supabase
      .from('projects')
      .select('*, documents(*), photos(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (projs && projs.length > 0) {
      setProjects(projs);
      setDocuments(projs[0].documents || []);
      setPhotos(projs[0].photos || []);
    }
    setLoading(false);
  }

  const project = projects[activeProjectIdx];
  const stageIdx = project ? STAGES.findIndex(s => s.id === project.stage) : 0;
  const currentStage = STAGES[stageIdx];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.4em', color: '#c4955a', textTransform: 'uppercase' }}>Loading your portal...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#f4f1ec' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(196,149,90,0.2)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141414' }}>
        <div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c4955a' }}>A &amp; B General Contracting</div>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: '#faf9f7', fontWeight: 300, marginTop: 1 }}>Client Portal</div>
        </div>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#7a8390', padding: '6px 14px', cursor: 'pointer', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Sign Out
        </button>
      </header>

      {/* Project Tabs (if multiple) */}
      {projects.length > 1 && (
        <div style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', display: 'flex', gap: 0 }}>
          {projects.map((p, i) => (
            <button key={p.id} onClick={() => { setActiveProjectIdx(i); setDocuments(p.documents || []); setPhotos(p.photos || []); }}
              style={{ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', color: i === activeProjectIdx ? '#c4955a' : '#4a4f57', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: i === activeProjectIdx ? '1px solid #c4955a' : '1px solid transparent', marginBottom: -1 }}>
              {p.property_address?.split(',')[0] || `Claim ${i+1}`}
            </button>
          ))}
        </div>
      )}

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {!project ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#4a4f57', fontFamily: 'Georgia,serif', fontSize: 16 }}>
            No active projects found. Contact your A&B representative.
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div style={{ background: '#141414', border: '1px solid rgba(196,149,90,0.2)', padding: '32px 32px 28px', marginBottom: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                <div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4a4f57', marginBottom: 8 }}>Property</div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#faf9f7', fontWeight: 300, lineHeight: 1.2 }}>{project.property_address}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{currentStage?.icon}</div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c4955a' }}>{currentStage?.label}</div>
                </div>
              </div>

              {/* Stage Timeline */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#4a4f57', marginBottom: 12 }}>Restoration Progress</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {STAGES.map((stage, idx) => {
                    const isDone = idx < stageIdx;
                    const isCurrent = idx === stageIdx;
                    return (
                      <div key={stage.id} style={{ flex: 1, position: 'relative' }}>
                        <div style={{
                          height: 4,
                          background: isCurrent ? '#c4955a' : isDone ? '#4e9a6f' : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.3s'
                        }} />
                        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: isCurrent ? '#c4955a' : isDone ? '#4e9a6f' : '#2a2a2a', marginTop: 6, textAlign: 'center' }}>
                          {stage.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage Description */}
              <div style={{ padding: '16px 20px', background: 'rgba(196,149,90,0.04)', borderLeft: '2px solid #c4955a' }}>
                <div style={{ fontSize: 14, color: '#f4f1ec', lineHeight: 1.7 }}>{currentStage?.desc}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ background: '#141414', border: '1px solid rgba(196,149,90,0.15)', borderTop: 'none' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['status', 'documents', 'photos'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                    fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: activeTab === tab ? '#c4955a' : '#4a4f57',
                    borderBottom: activeTab === tab ? '1px solid #c4955a' : '1px solid transparent',
                    marginBottom: -1
                  }}>
                    {tab === 'documents' ? `Documents (${documents.length})` : tab === 'photos' ? `Photos (${photos.length})` : 'Status'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '28px 32px' }}>

                {/* STATUS TAB */}
                {activeTab === 'status' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 24 }}>
                      {[
                        ['Claim Number', project.claim_number || '—'],
                        ['Insurance Company', project.insurance_company || '—'],
                        ['Policy Number', project.policy_number || '—'],
                        ['Date of Loss', project.date_of_loss ? new Date(project.date_of_loss).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ padding: '16px 20px', background: '#1a1a1a' }}>
                          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4f57', marginBottom: 8 }}>{label}</div>
                          <div style={{ fontSize: 13, color: '#f4f1ec' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '20px', background: '#1a1a1a', borderTop: '1px solid rgba(196,149,90,0.1)' }}>
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#4a4f57', marginBottom: 16 }}>Your A&amp;B Team</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#faf9f7', marginBottom: 4 }}>Angel Morell</div>
                          <a href="tel:+14239074454" style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: '#c4955a', textDecoration: 'none' }}>(423) 907-4454</a>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: '#faf9f7', marginBottom: 4 }}>Bryson Greco</div>
                          <a href="tel:+18652244931" style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: '#c4955a', textDecoration: 'none' }}>(865) 224-4931</a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                  <div>
                    {documents.length === 0 && <div style={{ color: '#4a4f57', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No documents available yet.</div>}
                    {documents.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#faf9f7', marginBottom: 5 }}>{doc.name}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: '#c4955a', border: '1px solid rgba(196,149,90,0.3)', padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{doc.doc_type?.replace(/_/g, ' ')}</span>
                            {doc.is_signed && <span style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: '#4e9a6f', border: '1px solid rgba(78,154,111,0.3)', padding: '2px 7px' }}>Signed ✓</span>}
                          </div>
                        </div>
                        {doc.minio_key && (
                          <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ab-documents/${doc.minio_key}`} target="_blank" rel="noreferrer"
                            style={{ color: '#c4955a', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 16 }}>
                            Download →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* PHOTOS TAB */}
                {activeTab === 'photos' && (
                  <div>
                    {photos.length === 0 && <div style={{ color: '#4a4f57', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Photos will appear here as your restoration progresses.</div>}
                    <div style={{ columns: 2, gap: 4 }}>
                      {photos.map(photo => (
                        <div key={photo.id} onClick={() => setLightboxPhoto(photo)} style={{ cursor: 'pointer', marginBottom: 4, breakInside: 'avoid', position: 'relative' }}>
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ab-photos/${photo.minio_key}`}
                            alt={photo.caption || 'Project photo'}
                            loading="lazy"
                            style={{ width: '100%', display: 'block' }}
                          />
                          {(photo.photo_type || photo.caption) && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '16px 10px 8px', fontFamily: "'Courier New',monospace", fontSize: 8, color: '#c4955a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                              {photo.caption || photo.photo_type}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </main>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer', padding: 24 }}>
          <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ab-photos/${lightboxPhoto.minio_key}`} alt={lightboxPhoto.caption} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(196,149,90,0.15)', padding: '24px', textAlign: 'center', marginTop: 40 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', color: '#4a4f57', lineHeight: 2 }}>
          A &amp; B General Contracting · Knoxville, TN &amp; Corbin, KY<br />
          (865) 224-4931 · abgeneralcontracting.net
        </div>
      </footer>
    </div>
  );
}
