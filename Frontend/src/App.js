import React, { useState, useEffect } from 'react';
import Wallet from './components/Wallet';
import SendTransaction from './components/SendTransaction';
import AurumFiToken from './components/AurumFiToken';
import { getBalance, getBlockCount } from './services/api';
import './App.css';

function App() {
    const [currentAddress, setCurrentAddress] = useState('');
    const [balance, setBalance] = useState(0);
    const [blockCount, setBlockCount] = useState(0);
    const [currentTab, setCurrentTab] = useState('token');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                const count = await getBlockCount();
                setBlockCount(count);
            } catch (error) {
                console.error("Error fetching block count:", error);
                showMessage("Failed to connect to blockchain network", "error");
            }
        };

        const interval = setInterval(fetchNetworkData, 5000);
        fetchNetworkData();

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchBalance = async () => {
            if (currentAddress) {
                setLoading(true);
                try {
                    const balance = await getBalance(currentAddress);
                    setBalance(balance);
                } catch (error) {
                    console.error("Error fetching balance:", error);
                    showMessage("Failed to fetch balance.", "error");
                }
                setLoading(false);
            }
        };

        if (currentTab === 'wallet' && currentAddress) {
            fetchBalance();
        }
    }, [currentAddress, currentTab]);

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <i className="fas fa-coins logo-icon"></i> AurumFi
                    </div>
                    <nav className="main-nav">
                        <button onClick={() => setCurrentTab('token')} className={currentTab === 'token' ? 'active' : ''}>
                            Token
                        </button>
                        <button onClick={() => setCurrentTab('wallet')} className={currentTab === 'wallet' ? 'active' : ''}>
                            Wallet
                        </button>
                        <button onClick={() => setCurrentTab('send')} className={currentTab === 'send' ? 'active' : ''}>
                            Send
                        </button>
                    </nav>
                    <div className="network-status">
                        <span className="network-label">Blocks:</span> {blockCount}
                    </div>
                </div>
            </header>

            <main className="main-content">
                {message && (
                    <div className={`notification ${messageType}`}>
                        {message}
                    </div>
                )}

                <div className="card-container">
                    {currentTab === 'token' && (
                        <div className="token-card">
                            <AurumFiToken />
                        </div>
                    )}

                    {currentTab === 'wallet' && (
                        <div className="wallet-card">
                            <Wallet
                                setCurrentAddress={setCurrentAddress}
                                currentAddress={currentAddress}
                            />
                            {currentAddress && (
                                <div className="balance-info">
                                    <p>Balance: {loading ? 'Loading...' : `${balance / 100000000} AUF`}</p>
                                    <p>Wallet Address: {currentAddress}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentTab === 'send' && (
                        <div className="send-card">
                            {currentAddress ? (
                                <SendTransaction
                                    senderAddress={currentAddress}
                                    onTransactionSent={() => showMessage("Transaction sent successfully!", "success")}
                                />
                            ) : (
                                <div className="empty-state">
                                    <p>Please connect a wallet first to send transactions.</p>
                                    <button
                                        className="check-balance-btn"
                                        onClick={() => setCurrentTab('wallet')}
                                    >
                                        Go to Wallet
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <p>&copy; 2024 AurumFi. Securing the future of digital gold.</p>
            </footer>
        </div>
    );
}

export default App;


