import fs from 'fs';
import { Ed25519Keypair, RawSigner, JsonRpcProvider, getFullnodeUrl } from '@mysten/sui.js';
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

// Fungsi untuk membaca kunci privat dari file
function loadPrivateKeys() {
    const data = fs.readFileSync('data.txt', 'utf-8');
    return data.split('\n').filter(line => line.trim() !== ''); // Menghapus baris kosong
}

const privateKeys = loadPrivateKeys();
const privateKeyData = privateKeys[0]; // Mengambil kunci privat pertama
const keypair = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(privateKeyData));

class COINENUM {
    static SUI = "0x2::sui::SUI";
    static WAL = "0x9f992cc2430a1f442ca7a5ca7638169f5d5c00e0ebc3977a65e9ac6e497fe5ef::wal::WAL";
}

const STAKENODEOPERATOR = "0xcf4b9402e7f156bc75082bc07581b0829f081ccfc8c444c71df4536ea33d094a";

class Staking {
    constructor(keypair) {
        this.acc = keypair.getPublicKey().toSuiAddress();
        this.signer = new RawSigner(keypair, new JsonRpcProvider(getFullnodeUrl('testnet')));
        this.walrusAddress = COINENUM.WAL;
    }

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

    async stake(amount) {
        try {
            console.log('Proses staking dimulai...');
            const tx = await this.signer.moveCall({
                packageObjectId: STAKENODEOPERATOR,
                module: 'staking',
                function: 'stake',
                typeArguments: [COINENUM.WAL],
                arguments: [amount],
                gasBudget: 10000 // Sesuaikan jika perlu
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
    console.log('Alamat:', staking.acc);
    const balance = await staking.getBalance();
    console.log('Saldo WAL sebelum staking:', balance);

    if (balance >= 1) {
        await staking.stake(1);
    } else {
        console.log('Saldo tidak cukup untuk staking 1 WAL.');
    }
}

main().catch(console.error);
