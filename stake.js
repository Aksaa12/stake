const fs = require('fs');
const { JsonRpcProvider, Ed25519Keypair, RawSigner, getFullnodeUrl } = require('@mysten/sui.js');  // Gunakan import yang benar

// Membaca private key dari file data.txt
const privateKey = fs.readFileSync('data.txt', 'utf-8').trim();

// Mengonversi private key ke dalam bentuk Keypair
const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));

class COINENUM {
  static SUI = "0x2::sui::SUI";
  static WAL = "0x9f992cc2430a1f442ca7a5ca7638169f5d5c00e0ebc3977a65e9ac6e497fe5ef::wal::WAL";
}

const STAKENODEOPERATOR = "0xcf4b9402e7f156bc75082bc07581b0829f081ccfc8c444c71df4536ea33d094a";

class Staking {
  constructor(keypair) {
    this.acc = keypair.getPublicKey().toSuiAddress();  // Dapatkan alamat dari keypair
    this.signer = new RawSigner(keypair, new JsonRpcProvider(getFullnodeUrl('testnet')));  // Gunakan JsonRpcProvider untuk koneksi testnet
    this.walrusAddress = COINENUM.WAL;
  }

  // Fungsi untuk menampilkan saldo WAL
  async getBalance() {
    try {
      const coins = await this.signer.provider.getCoins({ owner: this.acc });
      const walCoins = coins.filter(c => c.coinType === COINENUM.WAL);
      const walBalance = walCoins.reduce((acc, coin) => acc + coin.balance, 0);
      return walBalance;
    } catch (error) {
      console.error('Gagal mendapatkan saldo:', error);
      return 0;
    }
  }

  // Fungsi untuk staking ke node walrustaking
  async stake(amount) {
    try {
      console.log('Proses staking dimulai...');
      const tx = await this.signer.moveCall({
        packageObjectId: STAKENODEOPERATOR,
        module: 'staking',
        function: 'stake',
        typeArguments: [COINENUM.WAL],
        arguments: [amount],
        gasBudget: 10000
      });

      console.log('Transaksi staking sedang dikirim...');
      const result = await this.signer.executeTransaction(tx);
      console.log('Status transaksi:', result.status);
    } catch (error) {
      console.error('Gagal staking:', error);
    }
  }
}

async function main() {
  const staking = new Staking(keypair);

  // Menampilkan alamat dompet
  console.log('Alamat:', staking.acc);

  // Menampilkan saldo WAL sebelum staking
  const balance = await staking.getBalance();
  console.log('Saldo WAL sebelum staking:', balance);

  // Mengecek apakah saldo cukup untuk staking 1 WAL
  if (balance >= 1) {
    await staking.stake(1);  // Staking 1 WAL
  } else {
    console.log('Saldo tidak cukup untuk staking 1 WAL.');
  }
}

main();
