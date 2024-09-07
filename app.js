// Phantom cüzdanını bağlama
async function connectWallet() {
    try {
        const { solana } = window; // Phantom cüzdanına erişim
        if (solana) {
            // Phantom cüzdanı mevcutsa kullanıcıyı bağlama
            const response = await solana.connect(); 
            const walletAddress = response.publicKey.toString(); // Bağlanan cüzdan adresini al
            document.getElementById('wallet-address').innerText = Cüzdan adresiniz: ${walletAddress}; // Adresi ekrana yazdır
        } else {
            alert("Lütfen Phantom cüzdanınızı yükleyin."); // Cüzdan yüklü değilse uyarı ver
        }
    } catch (error) {
        console.error("Cüzdan bağlanamadı", error); // Hata durumunda
    }
}

// Cüzdanı bağlama butonuna tıklayınca çalışacak fonksiyon
document.getElementById('connect-wallet').addEventListener('click', connectWallet);

// Oy verme fonksiyonu (candidateId, Adayın ID'si)
async function vote(candidateId) {
    try {
        const { solana } = window; // Phantom cüzdanı bağlandı mı kontrol
        if (solana && solana.isConnected) {
            const walletAddress = solana.publicKey.toString(); // Kullanıcının cüzdan adresini al

            // Program adresi ve işlemi göndermek için gerekli bilgiler
            const programId = new solanaWeb3.PublicKey("ELECTION_CONTRACT_ADDRESS"); // Akıllı kontratın adresi
            const instruction = new solanaWeb3.TransactionInstruction({
                keys: [
                    {
                        pubkey: walletAddress, // Cüzdan adresi işlemde kullanılıyor
                        isSigner: true, // Cüzdan sahibi bu işlemi imzalayacak
                        isWritable: true // İşlem sırasında bu hesap yazılabilir olacak
                    }
                ],
                programId: programId, // Akıllı kontratın adresi
                data: Buffer.from(new Uint8Array([candidateId])) // Aday ID'si işlemin verisi
            });

            // İşlem oluşturma
            const transaction = new solanaWeb3.Transaction().add(instruction); // İşlemdeki komutu ekle

            // İşlemi Phantom cüzdanı ile gönderme
            const signature = await solana.signAndSendTransaction(transaction); // İşlemi cüzdanla imzala ve gönder
            console.log("İşlem imzalandı: ", signature); // Başarılı işlem imzası
            alert(Oy verme işlemi başarılı: Aday ${candidateId});
        } else {
            alert("Cüzdan bağlı değil."); // Cüzdan bağlı değilse uyarı
        }
    } catch (error) {
        console.error("Oy kullanılamadı", error); // Oy verme işlemi sırasında hata
        alert("Oy verme işlemi başarısız oldu.");
    }
}
