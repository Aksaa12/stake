const fs = require('fs');
const SuiClient = require('@mysten/sui.js');  // Pastikan sudah install package ini

// Membaca private key dari file data.txt
const privateKey = fs.readFileSync('data.txt', 'utf-8').trim();

class COINENUM {
  static SUI = "0x2::sui::SUI";
  static WAL = "0x9f992cc2430a1f442ca7a5ca7638169f5d5c00e0ebc3977a65e9ac6e497fe5ef::wal::WAL";
}

const STAKENODEOPERATOR = "0xcf4b9402e7f156bc75082bc07581b0829f081ccfc8c444c71df4536ea33d094a";

class Staking {
  constructor(privateKey) {
    this.acc = privateKey;
    this.txCount = 0;
    this.client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' }); // Sui Testnet RPC
    this.walrusAddress = COINENUM.WAL;
  }

  // Fungsi untuk menampilkan saldo WAL
  async getBalance() {
    try {
      const balances = await this.client.getBalance(this.acc);
      const walBalance = balances.find(b => b.coinType === COINENUM.WAL);
      return walBalance ? walBalance.balance : 0;
    } catch (error) {
      console.error('Gagal mendapatkan saldo:', error);
      return 0;
    }
  }

  // Fungsi untuk staking ke node walrustaking
  async stake(amount) {
    try {
      console.log('Proses staking dimulai...');
      const tx = await this.client.moveCall({
        signer: this.acc,
        packageObjectId: STAKENODEOPERATOR,
        module: 'staking',
        function: 'stake',
        typeArguments: [COINENUM.WAL],
        arguments: [amount],
        gasBudget: 10000
      });

      console.log('Transaksi staking sedang dikirim...');
      const result = await this.client.executeTransaction(tx);
      console.log('Status transaksi:', result.status);
    } catch (error) {
      console.error('Gagal staking:', error);
    }
  }
}

async function main() {
  const staking = new Staking(privateKey);

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
