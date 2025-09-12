import React, { useState } from 'react';
import { sendTransaction } from '../services/api';
import { getWalletByAddress, signTransactionMessage } from '../utils/crypto';

function SendTransaction({ senderAddress, onTransactionSent }) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();

        if (!recipient || !amount) {
            setStatus('Please fill in all fields');
            return;
        }

        if (!recipient.startsWith('AFI')) {
            setStatus('Recipient address must start with AFI');
            return;
        }

        setStatus('');
        setIsLoading(true);

        try {
            const wallet = getWalletByAddress(senderAddress);
            if (!wallet) {
                throw new Error("Sender wallet not found in local storage.");
            }

            const parsedAmount = parseFloat(amount) * (10**8);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                throw new Error("Invalid amount. Must be a positive number.");
            }

            // Format message for signing
            const messageToSign = JSON.stringify({
                sender: senderAddress,
                recipient: recipient,
                amount: parsedAmount,
            });

            // Sign the message
            const signature = await signTransactionMessage(wallet.privateKey, messageToSign);

            // Construct transaction data with signature
            const txData = {
                sender: senderAddress,
                recipient: recipient,
                amount: parsedAmount,
                signature: signature,
                timestamp: Date.now(),
            };

            const result = await sendTransaction(txData);
            if (result && result.hash) {
                setStatus(`✅ Transaction sent! Hash: ${result.hash.substring(0, 20)}...`);
                onTransactionSent();
            } else {
                setStatus('Failed to send transaction: Unknown error.');
            }
        } catch (error) {
            setStatus(`❌ Failed to send transaction: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="send-transaction-container">
            <h3>Send Transaction</h3>
            <form onSubmit={handleSend} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="recipient">Recipient Address</label>
                    <input
                        id="recipient"
                        type="text"
                        className="form-input"
                        placeholder="AFI..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Amount (AUF)</label>
                    <input
                        id="amount"
                        type="number"
                        step="0.00000001"
                        min="0"
                        className="form-input"
                        placeholder="0.00000000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className="send-btn"
                    disabled={isLoading || !recipient || !amount}
                >
                    {isLoading ? 'Sending...' : 'Send Transaction'}
                </button>
            </form>

            {status && (
                <div className={`transaction-status ${status.includes('✅') ? 'success' : 'error'}`}>
                    {status}
                </div>
            )}

            <div className="transaction-info">
                <h3>Transaction Information</h3>
                <ul>
                    <li>Network: AurumFi Chain</li>
                    <li>Token: AUF (AurumFi)</li>
                    <li>Confirmation time: ~5-10 seconds</li>
                    <li>Transaction fee: 0 AUF</li>
                </ul>
            </div>
        </div>
    );
}

export default SendTransaction;