// src/services/api.js

const RPC_URL = "http://localhost:8545";

// універсальний JSON-RPC виклик
async function rpcCall(method, params = []) {
    const response = await fetch(RPC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method,
            params,
        }),
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message || "RPC Error");
    }
    return data.result;
}

// отримати кількість блоків у мережі
export async function getBlockCount() {
    const hex = await rpcCall("eth_blockNumber");
    return parseInt(hex, 16); // hex → number
}

// отримати баланс гаманця (у wei)
export async function getBalance(address) {
    const hex = await rpcCall("eth_getBalance", [address, "latest"]);
    return parseInt(hex, 16); // hex → number (wei)
}

// надіслати підписану транзакцію (rawTx у hex)
export async function sendTransaction(rawTx) {
    return await rpcCall("eth_sendRawTransaction", [rawTx]);
}
