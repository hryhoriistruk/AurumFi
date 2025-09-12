import * as ed from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'; // Видалено randomBytes
import { encode } from 'bs58';

// Функція для генерації нової пари ключів
export function generateWallet(name) {
    const privateKey = ed.utils.randomPrivateKey(); // Генерує 32 байти
    const publicKey = ed.getPublicKey(privateKey);

    const addressHash = sha256(publicKey).slice(0, 20); // Хеш публічного ключа, перші 20 байт
    const address = `AFI${encode(addressHash)}`;

    const wallet = {
        name,
        address,
        publicKey: bytesToHex(publicKey),
        privateKey: bytesToHex(privateKey),
    };
    return wallet;
}

// Функція для імпорту гаманця за приватним ключем
export function importWallet(name, privateKeyHex) {
    const privateKey = hexToBytes(privateKeyHex);
    if (privateKey.length !== 32) {
        throw new Error("Invalid private key length. Must be 32 bytes (64 hex characters).");
    }
    const publicKey = ed.getPublicKey(privateKey);

    const addressHash = sha256(publicKey).slice(0, 20);
    const address = `AFI${encode(addressHash)}`;

    const wallet = {
        name,
        address,
        publicKey: bytesToHex(publicKey),
        privateKey: privateKeyHex,
    };

    return wallet;
}

// Функція для підписання повідомлення
export async function signTransactionMessage(privateKeyHex, message) {
    const privateKey = hexToBytes(privateKeyHex);
    const messageBytes = new TextEncoder().encode(message);
    const messageHash = sha256(messageBytes);

    const signature = await ed.sign(messageHash, privateKey);
    return bytesToHex(signature);
}

// Функція для перевірки підпису
export async function verifySignature(publicKeyHex, message, signatureHex) {
    const publicKey = hexToBytes(publicKeyHex);
    const signature = hexToBytes(signatureHex);
    const messageBytes = new TextEncoder().encode(message);
    const messageHash = sha256(messageBytes);

    return await ed.verify(signature, messageHash, publicKey);
}

// Функції для зберігання/отримання гаманців у localStorage
const WALLETS_STORAGE_KEY = 'aurumfi_wallets';

export function getStoredWallets() {
    const walletsJson = localStorage.getItem(WALLETS_STORAGE_KEY);
    return walletsJson ? JSON.parse(walletsJson) : [];
}

export function storeWallet(wallet) {
    const wallets = getStoredWallets();
    const existingIndex = wallets.findIndex(w => w.address === wallet.address);
    if (existingIndex > -1) {
        wallets[existingIndex] = wallet; // Оновити існуючий
    } else {
        wallets.push(wallet); // Додати новий
    }
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
}

export function getWalletByAddress(address) {
    const wallets = getStoredWallets();
    return wallets.find(w => w.address === address);
}

export function removeWalletByAddress(address) {
    const wallets = getStoredWallets();
    const filteredWallets = wallets.filter(w => w.address !== address);
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(filteredWallets));
}