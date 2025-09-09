import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'https://your-render-app.onrender.com/api';

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
            const res = await fetch(`${API_BASE}/blockchain`);
            const data = await res.json();
            setChain(data.chain || []);
            setPendingTxs(data.pendingTransactions || []);
        } catch (error) {
            console.error('Error fetching blockchain:', error);
            setMessage('Error connecting to server');
        }
        setIsLoading(false);
    };

    const fetchBalance = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
            const data = await res.json();
            setBalance(data.balance || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
        setIsLoading(false);
    };

    const sendTransaction = async () => {
        if (!address || !toAddress || !amount) {
            setMessage('Please fill all transaction fields');
            return;
        }
        setIsLoading(true);
        try {
            const tx = { fromAddress: address, toAddress, amount: parseFloat(amount) };
            const res = await fetch(`${API_BASE}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tx),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('✅ Transaction added successfully!');
                fetchBlockchain();
            } else {
                setMessage(`❌ ${data.error || 'Transaction failed'}`);
            }
        } catch (error) {
            console.error('Error sending transaction:', error);
            setMessage('❌ Error sending transaction');
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
            const res = await fetch(`${API_BASE}/mine?minerAddress=${encodeURIComponent(minerAddress)}`, {
                method: 'POST'
            });
            const data = await res.json();
            setMessage(`⛏️ ${data.message || 'Block mined successfully!'}`);
            fetchBlockchain();
            fetchBalance();
        } catch (error) {
            console.error('Error mining block:', error);
            setMessage('❌ Error mining block');
        }
        setIsLoading(false);
    };

    const formatHash = (hash) => {
        return hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
    };

    const formatBalance = (balance) => {
        return balance.toFixed(6);
    };

    return (
        <div className="app">
            {/* Header */}
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

            {/* Main Content */}
            <main className="main-content">
                {/* Navigation Tabs */}
                <nav className="tabs">
                    <button
                        className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blockchain')}
                    >
                        ⛓️ Blockchain
                    </button>
                    <button
                        className={`tab ${activeTab === 'wallet' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wallet')}
                    >
                        💰 Wallet
                    </button>
                    <button
                        className={`tab ${activeTab === 'send' ? 'active' : ''}`}
                        onClick={() => setActiveTab('send')}
                    >
                        📤 Send
                    </button>
                    <button
                        className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        ⛏️ Mine
                    </button>
                </nav>

                {/* Message Display */}
                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <span>Processing...</span>
                    </div>
                )}

                {/* Blockchain Tab */}
                {activeTab === 'blockchain' && (
                    <div className="tab-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Blocks</h3>
                                <span className="stat-number">{chain.length}</span>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Transactions</h3>
                                <span className="stat-number">{pendingTxs.length}</span>
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
                                {chain.slice().reverse().map((block, i) => (
                                    <div key={i} className="block-card">
                                        <div className="block-header">
                                            <span className="block-number">Block #{chain.length - i - 1}</span>
                                            <span className="block-hash">{formatHash(block.hash)}</span>
                                        </div>
                                        <div className="block-details">
                                            <p>Transactions: {block.transactions?.length || 0}</p>
                                            <p>Previous: {formatHash(block.previousHash)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="transactions-section">
                            <h2>Pending Transactions</h2>
                            {pendingTxs.length > 0 ? (
                                <div className="transactions-list">
                                    {pendingTxs.map((tx, i) => (
                                        <div key={i} className="transaction-card">
                                            <div className="transaction-header">
                                                <span className="tx-type">
                                                    {tx.fromAddress ? 'Transfer' : 'Reward'}
                                                </span>
                                                <span className="tx-amount">{formatBalance(tx.amount)} AUF</span>
                                            </div>
                                            <div className="transaction-details">
                                                <p>From: {tx.fromAddress || 'System'}</p>
                                                <p>To: {tx.toAddress}</p>
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

                {/* Wallet Tab */}
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
                                <button onClick={fetchBalance} className="check-balance-btn">
                                    Check Balance
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Send Tab */}
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
                                />
                            </div>
                            <button onClick={sendTransaction} className="send-btn">
                                Send Transaction
                            </button>
                        </div>
                    </div>
                )}

                {/* Mine Tab */}
                {activeTab === 'mine' && (
                    <div className="tab-content">
                        <div className="mine-card">
                            <h2>Mine New Block</h2>
                            <div className="mining-info">
                                <p>Mine pending transactions and earn mining rewards</p>
                                <div className="mining-stats">
                                    <span>Pending: {pendingTxs.length} transactions</span>
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
                            <button onClick={mineBlock} className="mine-btn">
                                ⛏️ Start Mining
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>© 2024 AurumFi Blockchain Explorer | Built with React & Spring Boot</p>
            </footer>
        </div>
    );
}

export default App;
