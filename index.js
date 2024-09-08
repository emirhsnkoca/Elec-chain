import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
import { useWallet, useConnection, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

// Program ID ve seçim durumu adresi
const PROGRAM_ID = new PublicKey('G3t5r7YdHwAf9DBjF1oqqNt4s76S31mxkHtsSodSKuxe');
const ELECTION_STATE_ADDRESS = new PublicKey('G3t5r7YdHwAf9DBjF1oqqNt4s76S31mxkHtsSodSKuxe');

// "Oy kullanabilirler" listesi
const ALLOWED_WALLET_ADDRESSES = [
    'ESSoRXDDY9SaticmHAkXdBPceywE1TMwq9z9wiAexghp'
    // Diğer cüzdan adresleri buraya eklenir
];

// Solana ağına bağlanma
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// Oy sayısını almak için seçim durumu hesabını okur
async function getVoteCounts() {
    try {
        const accountInfo = await connection.getAccountInfo(ELECTION_STATE_ADDRESS);
        if (accountInfo) {
            const data = accountInfo.data;
            const candidate1Votes = data.readUIntLE(0, 8);
            const candidate2Votes = data.readUIntLE(8, 8);
            const candidate3Votes = data.readUIntLE(16, 8);
            return { candidate1Votes, candidate2Votes, candidate3Votes };
        } else {
            return { candidate1Votes: 0, candidate2Votes: 0, candidate3Votes: 0 };
        }
    } catch (error) {
        console.error("Oy sayıları alınamadı:", error);
        return { candidate1Votes: 0, candidate2Votes: 0, candidate3Votes: 0 };
    }
}

// Oy verme işlemini blockchain'e kaydeder
async function recordVoteOnBlockchain(candidateIndex, publicKey, signTransaction) {
    if (!publicKey) {
        console.log("Cüzdan bağlı değil!");
        return;
    }

    // Cüzdan adresinin "Oy kullanabilirler" listesinde olup olmadığını kontrol et
    const walletAddress = publicKey.toBase58();
    if (!ALLOWED_WALLET_ADDRESSES.includes(walletAddress)) {
        alert("Üzgünüz, sınıf öğrencisi değilsiniz. Oy kullanamazsınız!");
        return;
    }

    const transaction = new Transaction();
    transaction.add(
        new TransactionInstruction({
            keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
            programId: PROGRAM_ID,
            data: Buffer.from([candidateIndex]),
        })
    );

    try {
        const { signature } = await signTransaction(transaction);
        await connection.sendTransaction(transaction, [publicKey]);
        console.log("Transaction gönderildi:", signature);
        alert("Oyunuz başarıyla kaydedildi!"); // Başarılı işlem için uyarı
    } catch (error) {
        console.error("Transaction hatası:", error);
    }
}

// Cüzdan bağlama işlemini yönetir
// Kullanıcı cüzdanı bağlantısı
async function connectWallet() {
    if (window.solana) {
        try {
            const resp = await window.solana.connect();
            const walletAddress = resp.publicKey.toString();
            console.log("Bağlı cüzdan:", walletAddress);

            // Kullanıcı oy kullanabilir mi kontrolü
            if (eligibleVoters.includes(walletAddress)) {
                // Kullanıcı oy kullanabilir, adayları gösterelim
                showCandidates(walletAddress);
            } else {
                // Oy kullanamaz
                alert("Üzgünüz, sınıf öğrencisi değilsiniz Oy kullanamazsınız!");
            }
        } catch (err) {
            console.error("Cüzdan bağlantısı hatası:", err);
        }
    } else {
        alert("Solana cüzdanı bulunamadı. Lütfen Phantom cüzdanını yükleyin.");
    }
}

// Oy verme butonu bileşeni
function VoteButton({ candidateIndex, candidateName }) {
    const { connected, publicKey, signTransaction } = useWallet();

    return (
        <button
            onClick={() => {
                if (connected) {
                    recordVoteOnBlockchain(candidateIndex, publicKey, signTransaction);
                } else {
                    console.log("Cüzdan bağlı değil!");
                }
            }}
        >
            Oy Ver {candidateName}
        </button>
    );
}

// Ana bileşen
export default function App() {
    const [voteCounts, setVoteCounts] = useState({ candidate1Votes: 0, candidate2Votes: 0, candidate3Votes: 0 });
    const wallets = [new PhantomWalletAdapter()];

    useEffect(() => {
        async function fetchVoteCounts() {
            const counts = await getVoteCounts();
            setVoteCounts(counts);
        }
        fetchVoteCounts();
    }, []);

    return (
        <WalletModalProvider wallets={wallets}>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h1>Elec-Chain</h1>
                <h2>Sınıf Temsilcisi Seçimi</h2>
                <button onClick={connectWallet}>Cüzdan Bağla</button>
                <div id="candidates">
                    <VoteButton candidateIndex={0} candidateName="Aday 1" />
                    <VoteButton candidateIndex={1} candidateName="Aday 2" />
                    <VoteButton candidateIndex={2} candidateName="Aday 3" />
                </div>
                <h2>Oy Sonuçları:</h2>
                <div id="results">
                    <p>Aday 1: {voteCounts.candidate1Votes} oy</p>
                    <p>Aday 2: {voteCounts.candidate2Votes} oy</p>
                    <p>Aday 3: {voteCounts.candidate3Votes} oy</p>
                </div>
            </div>
        </WalletModalProvider>
    );
}
