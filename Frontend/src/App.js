import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8081/api/blockchain';

function App() {
    const [chain, setChain] = useState([]);
    const [pendingTxs, setPendingTxs] = useState([]);
    const [balance, setBalance] = useState(0);
    const [address, setAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [minerAddress, setMinerAddress] = useState('');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('blockchain');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchBlockchain();
    }, []);

    const fetchBlockchain = async () => {
        setIsLoading(true);
        try {
            const [chainRes, infoRes, pendingRes] = await Promise.all([
                fetch(`${API_BASE}/chain`),
                fetch(`${API_BASE}/info`),
                fetch(`${API_BASE}/pending`).catch(() => ({ ok: false }))
            ]);

            if (chainRes.ok) {
                const chainData = await chainRes.json();
                setChain(chainData.chain || []);
            }

            if (pendingRes.ok) {
                const pendingData = await pendingRes.json();
                setPendingTxs(pendingData || []);
            } else {
                setPendingTxs([]);
            }
        } catch (error) {
            // console.error('Error fetching blockchain:', error);
            // setMessage('Error connecting to server');
        }
        setIsLoading(false);
    };

    const fetchBalance = async () => {
        if (!address) {
            setMessage('Please enter wallet address');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance || 0);
                setMessage(`✅ Balance: ${formatBalance(data.balance || 0)} AUF`);
            } else {
                // const errorData = await res.json().catch(() => ({}));
                // setMessage(`❌ ${errorData.error || 'Failed to fetch balance'}`);
            }
        } catch (error) {
            // console.error('Error fetching balance:', error);
            // setMessage('❌ Network error fetching balance');
        }
        setIsLoading(false);
    };

    const getTestFunds = async () => {
        if (!address) {
            setMessage('Please enter your address first');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/faucet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                fetchBalance();
            } else {
                // setMessage(`❌ ${data.error}`);
            }
        } catch (error) {
            // setMessage('❌ Error getting test funds');
        }
        setIsLoading(false);
    };

    const sendTransaction = async () => {
        if (!address || !toAddress || !amount) {
            setMessage('Please fill all fields');
            return;
        }

        if (parseFloat(amount) <= 0) {
            setMessage('Amount must be greater than 0');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fromAddress: address,
                    toAddress: toAddress,
                    amount: parseFloat(amount)
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setMessage('✅ Transaction added successfully!');
                setToAddress('');
                setAmount('');
                fetchBlockchain();
                fetchBalance();
            } else {
                // setMessage(`❌ ${data.error || 'Transaction failed'}`);
                // console.error('Transaction error details:', data);
            }
        } catch (error) {
            // console.error('Network error:', error);
            // setMessage('❌ Network error: Could not connect to server');
        }
        setIsLoading(false);
    };

    const mineBlock = async () => {
        if (!minerAddress) {
            setMessage('Please enter miner address');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/mine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    minerAddress: minerAddress
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(`⛏️ ${data.message || 'Block mined successfully!'}`);
                fetchBlockchain();
                fetchBalance();
            } else {
                // setMessage(`❌ ${data.error || 'Mining failed'}`);
            }
        } catch (error) {
            // console.error('Error mining block:', error);
            // setMessage('❌ Error mining block');
        }
        setIsLoading(false);
    };

    const formatHash = (hash) => {
        return hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
    };

    const formatBalance = (balance) => {
        return parseFloat(balance || 0).toFixed(6);
    };

    const getPendingCount = () => {
        return pendingTxs.length;
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">
                        <span className="logo-icon">⛓️</span>
                        AurumFi Blockchain
                    </h1>
                    <div className="network-status">
                        <div className="status-indicator"></div>
                        <span>Online</span>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <nav className="tabs">
                    <button className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain')}>
                        ⛓️ Blockchain
                    </button>
                    <button className={`tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
                        💰 Wallet
                    </button>
                    <button className={`tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
                        📤 Send
                    </button>
                    <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
                        ⛏️ Mine
                    </button>
                </nav>

                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
                        {message}
                    </div>
                )}

                {isLoading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <span>Processing...</span>
                    </div>
                )}

                {activeTab === 'blockchain' && (
                    <div className="tab-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Blocks</h3>
                                <span className="stat-number">{chain.length}</span>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Transactions</h3>
                                <span className="stat-number">{getPendingCount()}</span>
                            </div>
                            <div className="stat-card">
                                <h3>Total Transactions</h3>
                                <span className="stat-number">
                                    {chain.reduce((total, block) => total + (block.transactions?.length || 0), 0)}
                                </span>
                            </div>
                        </div>

                        <div className="blockchain-section">
                            <h2>Latest Blocks</h2>
                            <div className="blocks-grid">
                                {chain.slice().reverse().map((block, index) => (
                                    <div key={index} className="block-card">
                                        <div className="block-header">
                                            <span className="block-number">Block #{chain.length - index - 1}</span>
                                            <span className="block-hash">{formatHash(block.hash)}</span>
                                        </div>
                                        <div className="block-details">
                                            <p>Transactions: {block.transactions?.length || 0}</p>
                                            <p>Previous: {formatHash(block.previousHash)}</p>
                                            <p>Nonce: {block.nonce || 0}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="transactions-section">
                            <h2>Pending Transactions ({getPendingCount()})</h2>
                            {getPendingCount() > 0 ? (
                                <div className="transactions-list">
                                    {pendingTxs.map((tx, index) => (
                                        <div key={index} className="transaction-card">
                                            <div className="transaction-header">
                                                <span className="tx-type">
                                                    {tx.fromAddress ? 'Transfer' : 'Reward'}
                                                </span>
                                                <span className="tx-amount">{formatBalance(tx.amount)} AUF</span>
                                            </div>
                                            <div className="transaction-details">
                                                <p>From: {tx.fromAddress || 'System'}</p>
                                                <p>To: {tx.toAddress}</p>
                                                {tx.timestamp && <p>Time: {new Date(tx.timestamp).toLocaleTimeString()}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-state">No pending transactions</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="tab-content">
                        <div className="wallet-card">
                            <h2>Wallet Balance</h2>
                            <div className="balance-display">
                                <span className="balance-amount">{formatBalance(balance)}</span>
                                <span className="balance-currency">AUF</span>
                            </div>
                            <div className="address-input-group">
                                <input
                                    type="text"
                                    placeholder="Enter your wallet address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="address-input"
                                />
                                <button onClick={fetchBalance} className="check-balance-btn" disabled={!address}>
                                    Check Balance
                                </button>
                            </div>
                            {balance === 0 && (
                                <div className="wallet-actions">
                                    <button onClick={getTestFunds} className="faucet-btn">
                                        🚰 Get Test Funds (1000 AUF)
                                    </button>
                                </div>
                            )}
                            {balance > 0 && (
                                <div className="wallet-actions">
                                    <button onClick={() => setActiveTab('send')} className="send-from-wallet-btn">
                                        Send AUF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'send' && (
                    <div className="tab-content">
                        <div className="send-card">
                            <h2>Send AurumFi Tokens</h2>
                            <div className="form-group">
                                <label>From Address</label>
                                <input
                                    type="text"
                                    placeholder="Your wallet address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>To Address</label>
                                <input
                                    type="text"
                                    placeholder="Recipient wallet address"
                                    value={toAddress}
                                    onChange={(e) => setToAddress(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount (AUF)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="form-input"
                                    step="0.000001"
                                    min="0.000001"
                                />
                            </div>
                            <div className="balance-info">
                                Current balance: {formatBalance(balance)} AUF
                            </div>
                            <button
                                onClick={sendTransaction}
                                className="send-btn"
                                disabled={!address || !toAddress || !amount || parseFloat(amount) <= 0}
                            >
                                Send Transaction
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'mine' && (
                    <div className="tab-content">
                        <div className="mine-card">
                            <h2>Mine New Block</h2>
                            <div className="mining-info">
                                <p>Mine pending transactions and earn mining rewards</p>
                                <div className="mining-stats">
                                    <span>Pending: {getPendingCount()} transactions</span>
                                    <span>Mining reward: 10 AUF</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Miner Address</label>
                                <input
                                    type="text"
                                    placeholder="Your miner address"
                                    value={minerAddress}
                                    onChange={(e) => setMinerAddress(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <button
                                onClick={mineBlock}
                                className="mine-btn"
                                disabled={!minerAddress || getPendingCount() === 0}
                            >
                                ⛏️ Start Mining
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="footer">
                <p>© 2024 AurumFi Blockchain Explorer</p>
            </footer>
        </div>
    );
}

export default App;