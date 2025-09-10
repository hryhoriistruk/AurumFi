// // import React, { useState, useEffect } from 'react';
// // import './App.css';
// //
// // // Змініть з 8081 на 8080
// // const API_BASE = 'http://localhost:8081/api/blockchain';
// // const EXCHANGE_API_BASE = 'http://localhost:8081/api/exchange';
// // const ADMIN_API_BASE = 'http://localhost:8081/api/admin';
// //
// // function App() {
// //     const [chain, setChain] = useState([]);
// //     const [pendingTxs, setPendingTxs] = useState([]);
// //     const [balance, setBalance] = useState(0);
// //     const [address, setAddress] = useState('');
// //     const [toAddress, setToAddress] = useState('');
// //     const [amount, setAmount] = useState('');
// //     const [minerAddress, setMinerAddress] = useState('');
// //     const [message, setMessage] = useState('');
// //     const [activeTab, setActiveTab] = useState('blockchain');
// //     const [isLoading, setIsLoading] = useState(false);
// //
// //     // Exchange states
// //     const [orderBook, setOrderBook] = useState({ buyOrders: {}, sellOrders: {} });
// //     const [tradeHistory, setTradeHistory] = useState([]);
// //     const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
// //     const [orderAmount, setOrderAmount] = useState('');
// //     const [orderPrice, setOrderPrice] = useState('');
// //
// //     // Admin states
// //     const [adminUsername, setAdminUsername] = useState('');
// //     const [adminPassword, setAdminPassword] = useState('');
// //     const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
// //     const [adminBlockchainStats, setAdminBlockchainStats] = useState(null);
// //     const [mintRecipient, setMintRecipient] = useState('');
// //     const [mintAmount, setMintAmount] = useState('');
// //     const [burnAddress, setBurnAddress] = useState('');
// //     const [burnAmount, setBurnAmount] = useState('');
// //
// //     useEffect(() => {
// //         fetchBlockchain();
// //         if (activeTab === 'exchange') {
// //             fetchOrderBook();
// //             fetchTradeHistory();
// //         }
// //         if (activeTab === 'admin' && adminToken) {
// //             fetchAdminBlockchainStats();
// //         }
// //     }, [activeTab, adminToken]);
// //
// //     const fetchBlockchain = async () => {
// //         setIsLoading(true);
// //         try {
// //             const [chainRes, pendingRes] = await Promise.all([
// //                 fetch(`${API_BASE}/chain`),
// //                 fetch(`${API_BASE}/pending`).catch(() => ({ ok: false }))
// //             ]);
// //
// //             if (chainRes.ok) {
// //                 const chainData = await chainRes.json();
// //                 setChain(chainData.chain || []);
// //             }
// //
// //             if (pendingRes.ok) {
// //                 const pendingData = await pendingRes.json();
// //                 setPendingTxs(pendingData || []);
// //             } else {
// //                 setPendingTxs([]);
// //             }
// //         } catch (error) {
// //             // console.error('Error fetching blockchain:', error);
// //             // setMessage('Error connecting to server or fetching blockchain data.');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const fetchBalance = async () => {
// //         // if (!address) {
// //         //     setMessage('Please enter wallet address');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
// //             if (res.ok) {
// //                 const data = await res.json();
// //                 setBalance(data.balance || 0);
// //                 setMessage(`✅ Balance: ${formatBalance(data.balance || 0)} AUR`);
// //             } else {
// //                 const errorData = await res.json().catch(() => ({}));
// //                 // setMessage(`❌ ${errorData.error || 'Failed to fetch balance'}`);
// //             }
// //         } catch (error) {
// //             console.error('Error fetching balance:', error);
// //             setMessage('❌ Network error fetching balance');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const getTestFunds = async () => {
// //         // if (!address) {
// //         //     setMessage('Please enter your address first');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${API_BASE}/faucet`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({ address: address })
// //             });
// //
// //             const data = await response.json();
// //             if (response.ok) {
// //                 setMessage(`✅ ${data.message}`);
// //                 fetchBalance();
// //             } else {
// //                 // setMessage(`❌ ${data.error}`);
// //             }
// //         } catch (error) {
// //             // setMessage('❌ Error getting test funds');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const sendTransaction = async () => {
// //         // if (!address || !toAddress || !amount) {
// //         //     setMessage('Please fill all fields');
// //         //     return;
// //         // }
// //         // if (parseFloat(amount) <= 0) {
// //         //     setMessage('Amount must be greater than 0');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${API_BASE}/transaction`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({
// //                     fromAddress: address,
// //                     toAddress: toAddress,
// //                     amount: parseFloat(amount)
// //                 })
// //             });
// //
// //             const data = await response.json().catch(() => ({}));
// //             if (response.ok) {
// //                 setMessage('✅ Transaction added successfully!');
// //                 setToAddress('');
// //                 setAmount('');
// //                 fetchBlockchain();
// //                 fetchBalance();
// //             } else {
// //                 // setMessage(`❌ ${data.error || 'Transaction failed'}`);
// //                 // console.error('Transaction error details:', data);
// //             }
// //         } catch (error) {
// //             console.error('Network error:', error);
// //             // setMessage('❌ Network error: Could not connect to server');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const mineBlock = async () => {
// //         // if (!minerAddress) {
// //         //     setMessage('Please enter miner address');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${API_BASE}/mine`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({ minerAddress: minerAddress })
// //             });
// //
// //             const data = await response.json();
// //             if (response.ok) {
// //                 setMessage(`⛏️ ${data.message || 'Block mined successfully!'}`);
// //                 fetchBlockchain();
// //                 fetchBalance();
// //             } else {
// //                 // setMessage(`❌ ${data.error || 'Mining failed'}`);
// //             }
// //         } catch (error) {
// //             // console.error('Error mining block:', error);
// //             // setMessage('❌ Error mining block');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const fetchOrderBook = async () => {
// //         try {
// //             const res = await fetch(`${EXCHANGE_API_BASE}/orderbook`);
// //             if (res.ok) {
// //                 const data = await res.json();
// //                 setOrderBook(data);
// //             } else {
// //                 // console.error('Failed to fetch order book');
// //             }
// //         } catch (error) {
// //             // console.error('Network error fetching order book:', error);
// //         }
// //     };
// //
// //     const fetchTradeHistory = async () => {
// //         try {
// //             const res = await fetch(`${EXCHANGE_API_BASE}/tradehistory`);
// //             if (res.ok) {
// //                 const data = await res.json();
// //                 setTradeHistory(data);
// //             } else {
// //                 // console.error('Failed to fetch trade history');
// //             }
// //         } catch (error) {
// //             console.error('Network error fetching trade history:', error);
// //         }
// //     };
// //
// //     const placeOrder = async () => {
// //         // if (!address || !orderAmount || !orderPrice) {
// //         //     setMessage('Please fill all order fields');
// //         //     return;
// //         // }
// //         // if (parseFloat(orderAmount) <= 0 || parseFloat(orderPrice) <= 0) {
// //         //     setMessage('Amount and price must be positive');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const endpoint = orderType === 'buy' ? '/buy' : '/sell';
// //             const response = await fetch(`${EXCHANGE_API_BASE}${endpoint}`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({
// //                     address: address,
// //                     amount: parseFloat(orderAmount),
// //                     price: parseFloat(orderPrice)
// //                 })
// //             });
// //
// //             const data = await response.json();
// //             if (response.ok) {
// //                 setMessage(`✅ ${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
// //                 setOrderAmount('');
// //                 setOrderPrice('');
// //                 fetchOrderBook();
// //                 fetchTradeHistory();
// //                 fetchBalance();
// //             } else {
// //                 // setMessage(`❌ ${data.error || 'Order placement failed'}`);
// //             }
// //         } catch (error) {
// //             console.error('Network error placing order:', error);
// //             setMessage('❌ Network error: Could not connect to exchange');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const handleAdminLogin = async () => {
// //         // Disabled admin login checks and requests
// //         /*
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${ADMIN_API_BASE}/login`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({ username: adminUsername, password: adminPassword })
// //             });
// //             const data = await response.json();
// //             if (response.ok) {
// //                 setAdminToken(data.token);
// //                 localStorage.setItem('adminToken', data.token);
// //                 setMessage('✅ Admin login successful!');
// //                 fetchAdminBlockchainStats();
// //             } else {
// //                 setMessage(`❌ ${data.error || 'Admin login failed'}`);
// //             }
// //         } catch (error) {
// //             // console.error('Admin login error:', error);
// //             // setMessage('❌ Network error during admin login');
// //         }
// //         setIsLoading(false);
// //         */
// //     };
// //
// //     const handleAdminLogout = () => {
// //         setAdminToken('');
// //         localStorage.removeItem('adminToken');
// //         setAdminUsername('');
// //         setAdminPassword('');
// //         setAdminBlockchainStats(null);
// //         setMessage('👋 Admin logged out.');
// //     };
// //
// //     const fetchAdminBlockchainStats = async () => {
// //         if (!adminToken) return;
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${ADMIN_API_BASE}/blockchain-stats`, {
// //                 headers: { 'Authorization': adminToken }
// //             });
// //             if (response.ok) {
// //                 const data = await response.json();
// //                 setAdminBlockchainStats(data);
// //             } else {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 // setMessage(`❌ Failed to fetch admin stats: ${errorData.error || response.statusText}`);
// //                 // if (response.status === 401) handleAdminLogout();
// //             }
// //         } catch (error) {
// //             // console.error('Error fetching admin stats:', error);
// //             // setMessage('❌ Network error fetching admin stats');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const handleMintTokens = async () => {
// //         // if (!adminToken || !mintRecipient || !mintAmount) {
// //         //     setMessage('Please fill all mint fields');
// //         //     return;
// //         // }
// //         // if (parseFloat(mintAmount) <= 0) {
// //         //     setMessage('Mint amount must be positive');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${ADMIN_API_BASE}/mint-tokens`, {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'Authorization': adminToken
// //                 },
// //                 body: JSON.stringify({ recipientAddress: mintRecipient, amount: parseFloat(mintAmount) })
// //             });
// //             const data = await response.json();
// //             if (response.ok) {
// //                 setMessage(`✅ ${data.message}`);
// //                 setMintRecipient('');
// //                 setMintAmount('');
// //                 fetchAdminBlockchainStats();
// //             } else {
// //                 // setMessage(`❌ ${data.error || 'Minting failed'}`);
// //                 // if (response.status === 401) handleAdminLogout();
// //             }
// //         } catch (error) {
// //             // console.error('Error minting tokens:', error);
// //             // setMessage('❌ Network error minting tokens');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const handleBurnTokens = async () => {
// //         // if (!adminToken || !burnAddress || !burnAmount) {
// //         //     setMessage('Please fill all burn fields');
// //         //     return;
// //         // }
// //         // if (parseFloat(burnAmount) <= 0) {
// //         //     setMessage('Burn amount must be positive');
// //         //     return;
// //         // }
// //         setIsLoading(true);
// //         try {
// //             const response = await fetch(`${ADMIN_API_BASE}/burn-tokens`, {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'Authorization': adminToken
// //                 },
// //                 body: JSON.stringify({ address: burnAddress, amount: parseFloat(burnAmount) })
// //             });
// //             const data = await response.json();
// //             if (response.ok) {
// //                 setMessage(`✅ ${data.message}`);
// //                 setBurnAddress('');
// //                 setBurnAmount('');
// //                 fetchAdminBlockchainStats();
// //             } else {
// //                 // setMessage(`❌ ${data.error || 'Burning failed'}`);
// //                 // if (response.status === 401) handleAdminLogout();
// //             }
// //         } catch (error) {
// //             // console.error('Error burning tokens:', error);
// //             // setMessage('❌ Network error burning tokens');
// //         }
// //         setIsLoading(false);
// //     };
// //
// //     const formatHash = (hash) => {
// //         return hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
// //     };
// //
// //     const formatBalance = (balance) => {
// //         return parseFloat(balance || 0).toFixed(6);
// //     };
// //
// //     const getPendingCount = () => {
// //         return pendingTxs.length;
// //     };
// //
// //     return (
// //         <div className="app">
// //             <header className="header">
// //                 <div className="header-content">
// //                     <h1 className="logo">
// //                         <span className="logo-icon">⛓️</span>
// //                         AurumFi Blockchain
// //                     </h1>
// //                     <div className="network-status">
// //                         <div className="status-indicator"></div>
// //                         <span>Online</span>
// //                     </div>
// //                 </div>
// //             </header>
// //
// //             <main className="main-content">
// //                 <nav className="tabs">
// //                     <button className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain')}>
// //                         ⛓️ Blockchain
// //                     </button>
// //                     <button className={`tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
// //                         💰 Wallet
// //                     </button>
// //                     <button className={`tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
// //                         📤 Send
// //                     </button>
// //                     <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
// //                         ⛏️ Mine
// //                     </button>
// //                     <button className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>
// //                         📈 Exchange
// //                     </button>
// //                     <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
// //                         ⚙️ Admin
// //                     </button>
// //                 </nav>
// //
// //                 {message && (
// //                     <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
// //                         {message}
// //                     </div>
// //                 )}
// //
// //                 {isLoading && (
// //                     <div className="loading">
// //                         <div className="spinner"></div>
// //                         <span>Processing...</span>
// //                     </div>
// //                 )}
// //
// //                 {activeTab === 'blockchain' && (
// //                     <div className="tab-content">
// //                         <div className="stats-grid">
// //                             <div className="stat-card">
// //                                 <h3>Total Blocks</h3>
// //                                 <span className="stat-number">{chain.length}</span>
// //                             </div>
// //                             <div className="stat-card">
// //                                 <h3>Pending Transactions</h3>
// //                                 <span className="stat-number">{getPendingCount()}</span>
// //                             </div>
// //                             <div className="stat-card">
// //                                 <h3>Total Transactions</h3>
// //                                 <span className="stat-number">
// //                                     {chain.reduce((total, block) => total + (block.transactions?.length || 0), 0)}
// //                                 </span>
// //                             </div>
// //                         </div>
// //
// //                         <div className="blockchain-section">
// //                             <h2>Latest Blocks</h2>
// //                             <div className="blocks-grid">
// //                                 {chain.slice().reverse().map((block, index) => (
// //                                     <div key={index} className="block-card">
// //                                         <div className="block-header">
// //                                             <span className="block-number">Block #{chain.length - index - 1}</span>
// //                                             <span className="block-hash">{formatHash(block.hash)}</span>
// //                                         </div>
// //                                         <div className="block-details">
// //                                             <p>Transactions: {block.transactions?.length || 0}</p>
// //                                             <p>Previous: {formatHash(block.previousHash)}</p>
// //                                             <p>Nonce: {block.nonce || 0}</p>
// //                                         </div>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>
// //
// //                         <div className="transactions-section">
// //                             <h2>Pending Transactions ({getPendingCount()})</h2>
// //                             {getPendingCount() > 0 ? (
// //                                 <div className="transactions-list">
// //                                     {pendingTxs.map((tx, index) => (
// //                                         <div key={index} className="transaction-card">
// //                                             <div className="transaction-header">
// //                                                 <span className="tx-type">
// //                                                     {tx.fromAddress ? 'Transfer' : 'Reward'}
// //                                                 </span>
// //                                                 <span className="tx-amount">{formatBalance(tx.amount)} AUR</span>
// //                                             </div>
// //                                             <div className="transaction-details">
// //                                                 <p>From: {tx.fromAddress || 'System'}</p>
// //                                                 <p>To: {tx.toAddress}</p>
// //                                                 {tx.timestamp && <p>Time: {new Date(tx.timestamp).toLocaleTimeString()}</p>}
// //                                             </div>
// //                                         </div>
// //                                     ))}
// //                                 </div>
// //                             ) : (
// //                                 <p className="empty-state">No pending transactions</p>
// //                             )}
// //                         </div>
// //                     </div>
// //                 )}
// //
// //                 {activeTab === 'wallet' && (
// //                     <div className="tab-content">
// //                         <div className="wallet-card">
// //                             <h2>Wallet Balance</h2>
// //                             <div className="balance-display">
// //                                 <span className="balance-amount">{formatBalance(balance)}</span>
// //                                 <span className="balance-currency">AUR</span>
// //                             </div>
// //                             <div className="address-input-group">
// //                                 <input
// //                                     type="text"
// //                                     placeholder="Enter your wallet address"
// //                                     value={address}
// //                                     onChange={(e) => setAddress(e.target.value)}
// //                                     className="address-input"
// //                                 />
// //                                 <button onClick={fetchBalance} className="check-balance-btn">
// //                                     Check Balance
// //                                 </button>
// //                             </div>
// //                             {balance === 0 && (
// //                                 <div className="wallet-actions">
// //                                     <button onClick={getTestFunds} className="faucet-btn">
// //                                         🚰 Get Test Funds (1000 AUR)
// //                                     </button>
// //                                 </div>
// //                             )}
// //                             {balance > 0 && (
// //                                 <div className="wallet-actions">
// //                                     <button onClick={() => setActiveTab('send')} className="send-from-wallet-btn">
// //                                         Send AUR
// //                                     </button>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// //                 )}
// //
// //                 {activeTab === 'send' && (
// //                     <div className="tab-content">
// //                         <div className="send-card">
// //                             <h2>Send AurumFi Tokens</h2>
// //                             <div className="form-group">
// //                                 <label>From Address</label>
// //                                 <input
// //                                     type="text"
// //                                     placeholder="Your wallet address"
// //                                     value={address}
// //                                     onChange={(e) => setAddress(e.target.value)}
// //                                     className="form-input"
// //                                 />
// //                             </div>
// //                             <div className="form-group">
// //                                 <label>To Address</label>
// //                                 <input
// //                                     type="text"
// //                                     placeholder="Recipient wallet address"
// //                                     value={toAddress}
// //                                     onChange={(e) => setToAddress(e.target.value)}
// //                                     className="form-input"
// //                                 />
// //                             </div>
// //                             <div className="form-group">
// //                                 <label>Amount (AUR)</label>
// //                                 <input
// //                                     type="number"
// //                                     placeholder="0.00"
// //                                     value={amount}
// //                                     onChange={(e) => setAmount(e.target.value)}
// //                                     className="form-input"
// //                                     step="0.000001"
// //                                     min="0.000001"
// //                                 />
// //                             </div>
// //                             <div className="balance-info">
// //                                 Current balance: {formatBalance(balance)} AUR
// //                             </div>
// //                             <button
// //                                 onClick={sendTransaction}
// //                                 className="send-btn"
// //                             >
// //                                 Send Transaction
// //                             </button>
// //                         </div>
// //                     </div>
// //                 )}
// //
// //                 {activeTab === 'mine' && (
// //                     <div className="tab-content">
// //                         <div className="mine-card">
// //                             <h2>Mine New Block</h2>
// //                             <div className="mining-info">
// //                                 <p>Mine pending transactions and earn mining rewards</p>
// //                                 <div className="mining-stats">
// //                                     <span>Pending: {getPendingCount()} transactions</span>
// //                                     <span>Mining reward: 50 AUR</span>
// //                                 </div>
// //                             </div>
// //                             <div className="form-group">
// //                                 <label>Miner Address</label>
// //                                 <input
// //                                     type="text"
// //                                     placeholder="Your miner address"
// //                                     value={minerAddress}
// //                                     onChange={(e) => setMinerAddress(e.target.value)}
// //                                     className="form-input"
// //                                 />
// //                             </div>
// //                             <button
// //                                 onClick={mineBlock}
// //                                 className="mine-btn"
// //                             >
// //                                 ⛏️ Start Mining
// //                             </button>
// //                         </div>
// //                     </div>
// //                 )}
// //
// //                 {activeTab === 'exchange' && (
// //                     <div className="tab-content">
// //                         <h2>AurumFi Exchange</h2>
// //                         <div className="exchange-grid">
// //                             <div className="order-placement-card">
// //                                 <h3>Place New Order</h3>
// //                                 <div className="form-group">
// //                                     <label>Your Address</label>
// //                                     <input
// //                                         type="text"
// //                                         placeholder="Your wallet address"
// //                                         value={address}
// //                                         onChange={(e) => setAddress(e.target.value)}
// //                                         className="form-input"
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label>Order Type</label>
// //                                     <select
// //                                         value={orderType}
// //                                         onChange={(e) => setOrderType(e.target.value)}
// //                                         className="form-input"
// //                                     >
// //                                         <option value="buy">Buy AUR</option>
// //                                         <option value="sell">Sell AUR</option>
// //                                     </select>
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label>Amount (AUR)</label>
// //                                     <input
// //                                         type="number"
// //                                         placeholder="0.00"
// //                                         value={orderAmount}
// //                                         onChange={(e) => setOrderAmount(e.target.value)}
// //                                         className="form-input"
// //                                         step="0.000001"
// //                                         min="0.000001"
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label>Price (per AUR)</label>
// //                                     <input
// //                                         type="number"
// //                                         placeholder="0.00"
// //                                         value={orderPrice}
// //                                         onChange={(e) => setOrderPrice(e.target.value)}
// //                                         className="form-input"
// //                                         step="0.000001"
// //                                         min="0.000001"
// //                                     />
// //                                 </div>
// //                                 <button
// //                                     onClick={placeOrder}
// //                                     className="send-btn"
// //                                 >
// //                                     Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
// //                                 </button>
// //                             </div>
// //
// //                             <div className="order-book-card">
// //                                 <h3>Order Book</h3>
// //                                 <div className="order-book-section">
// //                                     <h4>Sell Orders (Ask)</h4>
// //                                     {Object.keys(orderBook.sellOrders).length > 0 ? (
// //                                         <ul className="order-list sell-orders">
// //                                             {Object.entries(orderBook.sellOrders)
// //                                                 .sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB))
// //                                                 .map(([price, orders]) => (
// //                                                     <li key={price}>
// //                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
// //                                                         <ul>
// //                                                             {orders.map((order, idx) => (
// //                                                                 <li key={idx}>
// //                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
// //                                                                 </li>
// //                                                             ))}
// //                                                         </ul>
// //                                                     </li>
// //                                                 ))}
// //                                         </ul>
// //                                     ) : (
// //                                         <p className="empty-state">No sell orders</p>
// //                                     )}
// //                                 </div>
// //                                 <div className="order-book-section">
// //                                     <h4>Buy Orders (Bid)</h4>
// //                                     {Object.keys(orderBook.buyOrders).length > 0 ? (
// //                                         <ul className="order-list buy-orders">
// //                                             {Object.entries(orderBook.buyOrders)
// //                                                 .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
// //                                                 .map(([price, orders]) => (
// //                                                     <li key={price}>
// //                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
// //                                                         <ul>
// //                                                             {orders.map((order, idx) => (
// //                                                                 <li key={idx}>
// //                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
// //                                                                 </li>
// //                                                             ))}
// //                                                         </ul>
// //                                                     </li>
// //                                                 ))}
// //                                         </ul>
// //                                     ) : (
// //                                         <p className="empty-state">No buy orders</p>
// //                                     )}
// //                                 </div>
// //                             </div>
// //
// //                             <div className="trade-history-card">
// //                                 <h3>Trade History</h3>
// //                                 {tradeHistory.length > 0 ? (
// //                                     <ul className="trade-list">
// //                                         {tradeHistory.slice().reverse().map((trade, index) => (
// //                                             <li key={index}>
// //                                                 <p><strong>Amount: {formatBalance(trade.amount)} AUR</strong></p>
// //                                                 <p>Price: {parseFloat(trade.price).toFixed(6)}</p>
// //                                                 <p>Buyer: {formatHash(trade.buyer)}</p>
// //                                                 <p>Seller: {formatHash(trade.seller)}</p>
// //                                                 <p>Time: {new Date(trade.timestamp).toLocaleTimeString()}</p>
// //                                             </li>
// //                                         ))}
// //                                     </ul>
// //                                 ) : (
// //                                     <p className="empty-state">No recent trades</p>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     </div>
// //                 )}
// //
// //                 {activeTab === 'admin' && (
// //                     <div className="tab-content">
// //                         <h2>Admin Panel</h2>
// //                         {!adminToken ? (
// //                             <div className="admin-login-card">
// //                                 <h3>Admin Login</h3>
// //                                 <div className="form-group">
// //                                     <label>Username</label>
// //                                     <input
// //                                         type="text"
// //                                         value={adminUsername}
// //                                         onChange={(e) => setAdminUsername(e.target.value)}
// //                                         className="form-input"
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label>Password</label>
// //                                     <input
// //                                         type="password"
// //                                         value={adminPassword}
// //                                         onChange={(e) => setAdminPassword(e.target.value)}
// //                                         className="form-input"
// //                                     />
// //                                 </div>
// //                                 <button onClick={handleAdminLogin} className="send-btn">
// //                                     Login
// //                                 </button>
// //                             </div>
// //                         ) : (
// //                             <div className="admin-dashboard">
// //                                 <button onClick={handleAdminLogout} className="mine-btn" style={{ float: 'right' }}>
// //                                     Logout
// //                                 </button>
// //                                 <h3>Blockchain Overview (Admin)</h3>
// //                                 {adminBlockchainStats ? (
// //                                     <div className="stats-grid">
// //                                         <div className="stat-card">
// //                                             <h3>Total Blocks</h3>
// //                                             <span className="stat-number">{adminBlockchainStats.blockCount}</span>
// //                                         </div>
// //                                         <div className="stat-card">
// //                                             <h3>Pending Transactions</h3>
// //                                             <span className="stat-number">{adminBlockchainStats.pendingTransactions}</span>
// //                                         </div>
// //                                         <div className="stat-card">
// //                                             <h3>Total Supply (AUR)</h3>
// //                                             <span className="stat-number">{formatBalance(adminBlockchainStats.totalSupply)}</span>
// //                                         </div>
// //                                         <div className="stat-card">
// //                                             <h3>Difficulty</h3>
// //                                             <span className="stat-number">{adminBlockchainStats.difficulty}</span>
// //                                         </div>
// //                                         <div className="stat-card">
// //                                             <h3>Chain Valid?</h3>
// //                                             <span className="stat-number">{adminBlockchainStats.isValid ? 'Yes' : 'No'}</span>
// //                                         </div>
// //                                     </div>
// //                                 ) : (
// //                                     <p>Loading admin stats...</p>
// //                                 )}
// //
// //                                 <div className="admin-actions-grid">
// //                                     <div className="admin-action-card">
// //                                         <h3>Mint Tokens</h3>
// //                                         <div className="form-group">
// //                                             <label>Recipient Address</label>
// //                                             <input
// //                                                 type="text"
// //                                                 value={mintRecipient}
// //                                                 onChange={(e) => setMintRecipient(e.target.value)}
// //                                                 className="form-input"
// //                                             />
// //                                         </div>
// //                                         <div className="form-group">
// //                                             <label>Amount</label>
// //                                             <input
// //                                                 type="number"
// //                                                 value={mintAmount}
// //                                                 onChange={(e) => setMintAmount(e.target.value)}
// //                                                 className="form-input"
// //                                                 step="0.000001"
// //                                                 min="0.000001"
// //                                             />
// //                                         </div>
// //                                         <button onClick={handleMintTokens} className="send-btn">
// //                                             Mint
// //                                         </button>
// //                                     </div>
// //
// //                                     <div className="admin-action-card">
// //                                         <h3>Burn Tokens</h3>
// //                                         <div className="form-group">
// //                                             <label>Address to Burn From</label>
// //                                             <input
// //                                                 type="text"
// //                                                 value={burnAddress}
// //                                                 onChange={(e) => setBurnAddress(e.target.value)}
// //                                                 className="form-input"
// //                                             />
// //                                         </div>
// //                                         <div className="form-group">
// //                                             <label>Amount</label>
// //                                             <input
// //                                                 type="number"
// //                                                 value={burnAmount}
// //                                                 onChange={(e) => setBurnAmount(e.target.value)}
// //                                                 className="form-input"
// //                                                 step="0.000001"
// //                                                 min="0.000001"
// //                                             />
// //                                         </div>
// //                                         <button onClick={handleBurnTokens} className="mine-btn">
// //                                             Burn
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         )}
// //                     </div>
// //                 )}
// //             </main>
// //
// //             <footer className="footer">
// //                 <p>© 2024 AurumFi Blockchain Explorer</p>
// //             </footer>
// //         </div>
// //     );
// // }
// //
// // export default App;
//
// import React, { useState, useEffect } from 'react';
// import './App.css';
//
// // Змініть з 8081 на 8080
// const API_BASE = 'http://localhost:8081/api/blockchain';
// const EXCHANGE_API_BASE = 'http://localhost:8081/api/exchange';
// const ADMIN_API_BASE = 'http://localhost:8081/api/admin';
//
// function App() {
//     const [chain, setChain] = useState([]);
//     const [pendingTxs, setPendingTxs] = useState([]);
//     const [balance, setBalance] = useState(0);
//     const [address, setAddress] = useState('');
//     const [toAddress, setToAddress] = useState('');
//     const [amount, setAmount] = useState('');
//     const [minerAddress, setMinerAddress] = useState('');
//     const [message, setMessage] = useState('');
//     const [activeTab, setActiveTab] = useState('blockchain');
//     const [isLoading, setIsLoading] = useState(false);
//
//     // Exchange states
//     const [orderBook, setOrderBook] = useState({ buyOrders: {}, sellOrders: {} });
//     const [tradeHistory, setTradeHistory] = useState([]);
//     const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
//     const [orderAmount, setOrderAmount] = useState('');
//     const [orderPrice, setOrderPrice] = useState('');
//
//     // Admin states
//     const [adminUsername, setAdminUsername] = useState('');
//     const [adminPassword, setAdminPassword] = useState('');
//     const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
//     const [adminBlockchainStats, setAdminBlockchainStats] = useState(null);
//     const [mintRecipient, setMintRecipient] = useState('');
//     const [mintAmount, setMintAmount] = useState('');
//     const [burnAddress, setBurnAddress] = useState('');
//     const [burnAmount, setBurnAmount] = useState('');
//
//     useEffect(() => {
//         fetchBlockchain();
//         if (activeTab === 'exchange') {
//             fetchOrderBook();
//             fetchTradeHistory();
//         }
//         if (activeTab === 'admin' && adminToken) {
//             fetchAdminBlockchainStats();
//         }
//     }, [activeTab, adminToken]);
//
//     const fetchBlockchain = async () => {
//         setIsLoading(true);
//         try {
//             const [chainRes, pendingRes] = await Promise.all([
//                 fetch(`${API_BASE}/chain`),
//                 fetch(`${API_BASE}/pending`).catch(() => ({ ok: false }))
//             ]);
//
//             if (chainRes.ok) {
//                 const chainData = await chainRes.json();
//                 setChain(chainData.chain || []);
//             }
//
//             if (pendingRes.ok) {
//                 const pendingData = await pendingRes.json();
//                 setPendingTxs(pendingData || []);
//             } else {
//                 setPendingTxs([]);
//             }
//         } catch (error) {
//             // console.error('Error fetching blockchain:', error);
//             // setMessage('Error connecting to server or fetching blockchain data.');
//         }
//         setIsLoading(false);
//     };
//
//     const fetchBalance = async () => {
//         setIsLoading(true);
//         try {
//             const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setBalance(data.balance || 0);
//                 setMessage(`✅ Balance: ${formatBalance(data.balance || 0)} AUR`);
//             } else {
//                 const errorData = await res.json().catch(() => ({}));
//                 // setMessage(`❌ ${errorData.error || 'Failed to fetch balance'}`);
//             }
//         } catch (error) {
//             console.error('Error fetching balance:', error);
//             setMessage('❌ Network error fetching balance');
//         }
//         setIsLoading(false);
//     };
//
//     const getTestFunds = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/faucet`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ address: address })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error}`);
//             }
//         } catch (error) {
//             // setMessage('❌ Error getting test funds');
//         }
//         setIsLoading(false);
//     };
//
//     const sendTransaction = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/transaction`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     fromAddress: address,
//                     toAddress: toAddress,
//                     amount: parseFloat(amount)
//                 })
//             });
//
//             const data = await response.json().catch(() => ({}));
//             if (response.ok) {
//                 setMessage('✅ Transaction added successfully!');
//                 setToAddress('');
//                 setAmount('');
//                 fetchBlockchain();
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Transaction failed'}`);
//                 // console.error('Transaction error details:', data);
//             }
//         } catch (error) {
//             console.error('Network error:', error);
//             // setMessage('❌ Network error: Could not connect to server');
//         }
//         setIsLoading(false);
//     };
//
//     const mineBlock = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/mine`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ minerAddress: minerAddress })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`⛏️ ${data.message || 'Block mined successfully!'}`);
//                 fetchBlockchain();
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Mining failed'}`);
//             }
//         } catch (error) {
//             // console.error('Error mining block:', error);
//             // setMessage('❌ Error mining block');
//         }
//         setIsLoading(false);
//     };
//
//     const fetchOrderBook = async () => {
//         try {
//             const res = await fetch(`${EXCHANGE_API_BASE}/orderbook`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setOrderBook(data);
//             } else {
//                 // console.error('Failed to fetch order book');
//             }
//         } catch (error) {
//             // console.error('Network error fetching order book:', error);
//         }
//     };
//
//     const fetchTradeHistory = async () => {
//         try {
//             const res = await fetch(`${EXCHANGE_API_BASE}/tradehistory`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setTradeHistory(data);
//             } else {
//                 // console.error('Failed to fetch trade history');
//             }
//         } catch (error) {
//             console.error('Network error fetching trade history:', error);
//         }
//     };
//
//     const placeOrder = async () => {
//         setIsLoading(true);
//         try {
//             const endpoint = orderType === 'buy' ? '/buy' : '/sell';
//             const response = await fetch(`${EXCHANGE_API_BASE}${endpoint}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     address: address,
//                     amount: parseFloat(orderAmount),
//                     price: parseFloat(orderPrice)
//                 })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
//                 setOrderAmount('');
//                 setOrderPrice('');
//                 fetchOrderBook();
//                 fetchTradeHistory();
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Order placement failed'}`);
//             }
//         } catch (error) {
//             console.error('Network error placing order:', error);
//             setMessage('❌ Network error: Could not connect to exchange');
//         }
//         setIsLoading(false);
//     };
//
//     // Оновлена функція логіну адміна з жорсткою перевіркою
//     const [registeredAdmins, setRegisteredAdmins] = useState(() => {
//         const saved = localStorage.getItem('registeredAdmins');
//         return saved ? JSON.parse(saved) : [];
//     });
//     const handleAdminLogin = () => {
//         setMessage('');
//         // Перевіряємо, чи акаунт вже зареєстрований
//         const existingAccount = registeredAdmins.find(
//             acc => acc.username === adminUsername && acc.password === adminPassword
//         );
//         if (existingAccount) {
//             // Якщо акаунт є — логінимо
//             const fakeToken = `fake-admin-token-${adminUsername}`;
//             setAdminToken(fakeToken);
//             localStorage.setItem('adminToken', fakeToken);
//             setMessage('✅ Admin login successful!');
//             fetchAdminBlockchainStats();
//             return;
//         }
//         // Якщо акаунта немає, перевіряємо чи можна додати нового (максимум 2)
//         if (registeredAdmins.length >= 2) {
//             setMessage('❌ Maximum number of admin accounts (2) reached. Cannot register new admin.');
//             return;
//         }
//         // Додаємо нового адміна
//         const newAdmin = { username: adminUsername, password: adminPassword };
//         const updatedAdmins = [...registeredAdmins, newAdmin];
//         setRegisteredAdmins(updatedAdmins);
//         localStorage.setItem('registeredAdmins', JSON.stringify(updatedAdmins));
//         // Логін нового адміна
//         const fakeToken = `fake-admin-token-${adminUsername}`;
//         setAdminToken(fakeToken);
//         localStorage.setItem('adminToken', fakeToken);
//         setMessage('✅ New admin registered and logged in!');
//         fetchAdminBlockchainStats();
//     };
//
//     const handleAdminLogout = () => {
//         setAdminToken('');
//         localStorage.removeItem('adminToken');
//         setAdminUsername('');
//         setAdminPassword('');
//         setAdminBlockchainStats(null);
//         setMessage('👋 Admin logged out.');
//     };
//
//     const fetchAdminBlockchainStats = async () => {
//         if (!adminToken) return;
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/blockchain-stats`, {
//                 headers: { 'Authorization': adminToken }
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 setAdminBlockchainStats(data);
//             } else {
//                 const errorData = await response.json().catch(() => ({}));
//                 // setMessage(`❌ Failed to fetch admin stats: ${errorData.error || response.statusText}`);
//                 // if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             // console.error('Error fetching admin stats:', error);
//             // setMessage('❌ Network error fetching admin stats');
//         }
//         setIsLoading(false);
//     };
//
//     const handleMintTokens = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/mint-tokens`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': adminToken
//                 },
//                 body: JSON.stringify({ recipientAddress: mintRecipient, amount: parseFloat(mintAmount) })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 setMintRecipient('');
//                 setMintAmount('');
//                 fetchAdminBlockchainStats();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Minting failed'}`);
//                 // if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             // console.error('Error minting tokens:', error);
//             // setMessage('❌ Network error minting tokens');
//         }
//         setIsLoading(false);
//     };
//
//     const handleBurnTokens = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/burn-tokens`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': adminToken
//                 },
//                 body: JSON.stringify({ address: burnAddress, amount: parseFloat(burnAmount) })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 setBurnAddress('');
//                 setBurnAmount('');
//                 fetchAdminBlockchainStats();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Burning failed'}`);
//                 // if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             // console.error('Error burning tokens:', error);
//             // setMessage('❌ Network error burning tokens');
//         }
//         setIsLoading(false);
//     };
//
//     const formatHash = (hash) => {
//         return hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
//     };
//
//     const formatBalance = (balance) => {
//         return parseFloat(balance || 0).toFixed(6);
//     };
//
//     const getPendingCount = () => {
//         return pendingTxs.length;
//     };
//
//     return (
//         <div className="app">
//             <header className="header">
//                 <div className="header-content">
//                     <h1 className="logo">
//                         <span className="logo-icon">⛓️</span>
//                         AurumFi Blockchain
//                     </h1>
//                     <div className="network-status">
//                         <div className="status-indicator"></div>
//                         <span>Online</span>
//                     </div>
//                 </div>
//             </header>
//
//             <main className="main-content">
//                 <nav className="tabs">
//                     <button className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain')}>
//                         ⛓️ Blockchain
//                     </button>
//                     <button className={`tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
//                         💰 Wallet
//                     </button>
//                     <button className={`tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
//                         📤 Send
//                     </button>
//                     <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
//                         ⛏️ Mine
//                     </button>
//                     <button className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>
//                         📈 Exchange
//                     </button>
//                     <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
//                         ⚙️ Admin
//                     </button>
//                 </nav>
//
//                 {message && (
//                     <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
//                         {message}
//                     </div>
//                 )}
//
//                 {isLoading && (
//                     <div className="loading">
//                         <div className="spinner"></div>
//                         <span>Processing...</span>
//                     </div>
//                 )}
//
//                 {activeTab === 'blockchain' && (
//                     <div className="tab-content">
//                         <div className="stats-grid">
//                             <div className="stat-card">
//                                 <h3>Total Blocks</h3>
//                                 <span className="stat-number">{chain.length}</span>
//                             </div>
//                             <div className="stat-card">
//                                 <h3>Pending Transactions</h3>
//                                 <span className="stat-number">{getPendingCount()}</span>
//                             </div>
//                             <div className="stat-card">
//                                 <h3>Total Transactions</h3>
//                                 <span className="stat-number">
//                                     {chain.reduce((total, block) => total + (block.transactions?.length || 0), 0)}
//                                 </span>
//                             </div>
//                         </div>
//
//                         <div className="blockchain-section">
//                             <h2>Latest Blocks</h2>
//                             <div className="blocks-grid">
//                                 {chain.slice().reverse().map((block, index) => (
//                                     <div key={index} className="block-card">
//                                         <div className="block-header">
//                                             <span className="block-number">Block #{chain.length - index - 1}</span>
//                                             <span className="block-hash">{formatHash(block.hash)}</span>
//                                         </div>
//                                         <div className="block-details">
//                                             <p>Transactions: {block.transactions?.length || 0}</p>
//                                             <p>Previous: {formatHash(block.previousHash)}</p>
//                                             <p>Nonce: {block.nonce || 0}</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//
//                         <div className="transactions-section">
//                             <h2>Pending Transactions ({getPendingCount()})</h2>
//                             {getPendingCount() > 0 ? (
//                                 <div className="transactions-list">
//                                     {pendingTxs.map((tx, index) => (
//                                         <div key={index} className="transaction-card">
//                                             <div className="transaction-header">
//                                                 <span className="tx-type">
//                                                     {tx.fromAddress ? 'Transfer' : 'Reward'}
//                                                 </span>
//                                                 <span className="tx-amount">{formatBalance(tx.amount)} AUR</span>
//                                             </div>
//                                             <div className="transaction-details">
//                                                 <p>From: {tx.fromAddress || 'System'}</p>
//                                                 <p>To: {tx.toAddress}</p>
//                                                 {tx.timestamp && <p>Time: {new Date(tx.timestamp).toLocaleTimeString()}</p>}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="empty-state">No pending transactions</p>
//                             )}
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'wallet' && (
//                     <div className="tab-content">
//                         <div className="wallet-card">
//                             <h2>Wallet Balance</h2>
//                             <div className="balance-display">
//                                 <span className="balance-amount">{formatBalance(balance)}</span>
//                                 <span className="balance-currency">AUR</span>
//                             </div>
//                             <div className="address-input-group">
//                                 <input
//                                     type="text"
//                                     placeholder="Enter your wallet address"
//                                     value={address}
//                                     onChange={(e) => setAddress(e.target.value)}
//                                     className="address-input"
//                                 />
//                                 <button onClick={fetchBalance} className="check-balance-btn">
//                                     Check Balance
//                                 </button>
//                             </div>
//                             {balance === 0 && (
//                                 <div className="wallet-actions">
//                                     <button onClick={getTestFunds} className="faucet-btn">
//                                         🚰 Get Test Funds (1000 AUR)
//                                     </button>
//                                 </div>
//                             )}
//                             {balance > 0 && (
//                                 <div className="wallet-actions">
//                                     <button onClick={() => setActiveTab('send')} className="send-from-wallet-btn">
//                                         Send AUR
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'send' && (
//                     <div className="tab-content">
//                         <div className="send-card">
//                             <h2>Send AurumFi Tokens</h2>
//                             <div className="form-group">
//                                 <label>From Address</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Your wallet address"
//                                     value={address}
//                                     onChange={(e) => setAddress(e.target.value)}
//                                     className="form-input"
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>To Address</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Recipient wallet address"
//                                     value={toAddress}
//                                     onChange={(e) => setToAddress(e.target.value)}
//                                     className="form-input"
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>Amount (AUR)</label>
//                                 <input
//                                     type="number"
//                                     placeholder="0.00"
//                                     value={amount}
//                                     onChange={(e) => setAmount(e.target.value)}
//                                     className="form-input"
//                                     step="0.000001"
//                                     min="0.000001"
//                                 />
//                             </div>
//                             <div className="balance-info">
//                                 Current balance: {formatBalance(balance)} AUR
//                             </div>
//                             <button
//                                 onClick={sendTransaction}
//                                 className="send-btn"
//                             >
//                                 Send Transaction
//                             </button>
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'mine' && (
//                     <div className="tab-content">
//                         <div className="mine-card">
//                             <h2>Mine New Block</h2>
//                             <div className="mining-info">
//                                 <p>Mine pending transactions and earn mining rewards</p>
//                                 <div className="mining-stats">
//                                     <span>Pending: {getPendingCount()} transactions</span>
//                                     <span>Mining reward: 50 AUR</span>
//                                 </div>
//                             </div>
//                             <div className="form-group">
//                                 <label>Miner Address</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Your miner address"
//                                     value={minerAddress}
//                                     onChange={(e) => setMinerAddress(e.target.value)}
//                                     className="form-input"
//                                 />
//                             </div>
//                             <button
//                                 onClick={mineBlock}
//                                 className="mine-btn"
//                             >
//                                 ⛏️ Start Mining
//                             </button>
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'exchange' && (
//                     <div className="tab-content">
//                         <h2>AurumFi Exchange</h2>
//                         <div className="exchange-grid">
//                             <div className="order-placement-card">
//                                 <h3>Place New Order</h3>
//                                 <div className="form-group">
//                                     <label>Your Address</label>
//                                     <input
//                                         type="text"
//                                         placeholder="Your wallet address"
//                                         value={address}
//                                         onChange={(e) => setAddress(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Order Type</label>
//                                     <select
//                                         value={orderType}
//                                         onChange={(e) => setOrderType(e.target.value)}
//                                         className="form-input"
//                                     >
//                                         <option value="buy">Buy AUR</option>
//                                         <option value="sell">Sell AUR</option>
//                                     </select>
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Amount (AUR)</label>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={orderAmount}
//                                         onChange={(e) => setOrderAmount(e.target.value)}
//                                         className="form-input"
//                                         step="0.000001"
//                                         min="0.000001"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Price (per AUR)</label>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={orderPrice}
//                                         onChange={(e) => setOrderPrice(e.target.value)}
//                                         className="form-input"
//                                         step="0.000001"
//                                         min="0.000001"
//                                     />
//                                 </div>
//                                 <button
//                                     onClick={placeOrder}
//                                     className="send-btn"
//                                 >
//                                     Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
//                                 </button>
//                             </div>
//
//                             <div className="order-book-card">
//                                 <h3>Order Book</h3>
//                                 <div className="order-book-section">
//                                     <h4>Sell Orders (Ask)</h4>
//                                     {Object.keys(orderBook.sellOrders).length > 0 ? (
//                                         <ul className="order-list sell-orders">
//                                             {Object.entries(orderBook.sellOrders)
//                                                 .sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB))
//                                                 .map(([price, orders]) => (
//                                                     <li key={price}>
//                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
//                                                         <ul>
//                                                             {orders.map((order, idx) => (
//                                                                 <li key={idx}>
//                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     </li>
//                                                 ))}
//                                         </ul>
//                                     ) : (
//                                         <p className="empty-state">No sell orders</p>
//                                     )}
//                                 </div>
//                                 <div className="order-book-section">
//                                     <h4>Buy Orders (Bid)</h4>
//                                     {Object.keys(orderBook.buyOrders).length > 0 ? (
//                                         <ul className="order-list buy-orders">
//                                             {Object.entries(orderBook.buyOrders)
//                                                 .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
//                                                 .map(([price, orders]) => (
//                                                     <li key={price}>
//                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
//                                                         <ul>
//                                                             {orders.map((order, idx) => (
//                                                                 <li key={idx}>
//                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     </li>
//                                                 ))}
//                                         </ul>
//                                     ) : (
//                                         <p className="empty-state">No buy orders</p>
//                                     )}
//                                 </div>
//                             </div>
//
//                             <div className="trade-history-card">
//                                 <h3>Trade History</h3>
//                                 {tradeHistory.length > 0 ? (
//                                     <ul className="trade-list">
//                                         {tradeHistory.slice().reverse().map((trade, index) => (
//                                             <li key={index}>
//                                                 <p><strong>Amount: {formatBalance(trade.amount)} AUR</strong></p>
//                                                 <p>Price: {parseFloat(trade.price).toFixed(6)}</p>
//                                                 <p>Buyer: {formatHash(trade.buyer)}</p>
//                                                 <p>Seller: {formatHash(trade.seller)}</p>
//                                                 <p>Time: {new Date(trade.timestamp).toLocaleTimeString()}</p>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="empty-state">No recent trades</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'admin' && (
//                     <div className="tab-content">
//                         <h2>Admin Panel</h2>
//                         {!adminToken ? (
//                             <div className="admin-login-card">
//                                 <h3>Admin Login</h3>
//                                 <div className="form-group">
//                                     <label>Username</label>
//                                     <input
//                                         type="text"
//                                         value={adminUsername}
//                                         onChange={(e) => setAdminUsername(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Password</label>
//                                     <input
//                                         type="password"
//                                         value={adminPassword}
//                                         onChange={(e) => setAdminPassword(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <button onClick={handleAdminLogin} className="send-btn">
//                                     Login
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="admin-dashboard">
//                                 <button onClick={handleAdminLogout} className="mine-btn" style={{ float: 'right' }}>
//                                     Logout
//                                 </button>
//                                 <h3>Blockchain Overview (Admin)</h3>
//                                 {adminBlockchainStats ? (
//                                     <div className="stats-grid">
//                                         <div className="stat-card">
//                                             <h3>Total Blocks</h3>
//                                             <span className="stat-number">{adminBlockchainStats.blockCount}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Pending Transactions</h3>
//                                             <span className="stat-number">{adminBlockchainStats.pendingTransactions}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Total Supply (AUR)</h3>
//                                             <span className="stat-number">{formatBalance(adminBlockchainStats.totalSupply)}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Difficulty</h3>
//                                             <span className="stat-number">{adminBlockchainStats.difficulty}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Chain Valid?</h3>
//                                             <span className="stat-number">{adminBlockchainStats.isValid ? 'Yes' : 'No'}</span>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <p>Loading admin stats...</p>
//                                 )}
//
//                                 <div className="admin-actions-grid">
//                                     <div className="admin-action-card">
//                                         <h3>Mint Tokens</h3>
//                                         <div className="form-group">
//                                             <label>Recipient Address</label>
//                                             <input
//                                                 type="text"
//                                                 value={mintRecipient}
//                                                 onChange={(e) => setMintRecipient(e.target.value)}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Amount</label>
//                                             <input
//                                                 type="number"
//                                                 value={mintAmount}
//                                                 onChange={(e) => setMintAmount(e.target.value)}
//                                                 className="form-input"
//                                                 step="0.000001"
//                                                 min="0.000001"
//                                             />
//                                         </div>
//                                         <button onClick={handleMintTokens} className="send-btn">
//                                             Mint
//                                         </button>
//                                     </div>
//
//                                     <div className="admin-action-card">
//                                         <h3>Burn Tokens</h3>
//                                         <div className="form-group">
//                                             <label>Address to Burn From</label>
//                                             <input
//                                                 type="text"
//                                                 value={burnAddress}
//                                                 onChange={(e) => setBurnAddress(e.target.value)}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Amount</label>
//                                             <input
//                                                 type="number"
//                                                 value={burnAmount}
//                                                 onChange={(e) => setBurnAmount(e.target.value)}
//                                                 className="form-input"
//                                                 step="0.000001"
//                                                 min="0.000001"
//                                             />
//                                         </div>
//                                         <button onClick={handleBurnTokens} className="mine-btn">
//                                             Burn
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </main>
//
//             <footer className="footer">
//                 <p>© 2024 AurumFi Blockchain Explorer</p>
//             </footer>
//         </div>
//     );
// }
//
// export default App;
//
// import React, { useState, useEffect } from 'react';
// import './App.css';
//
// // Залишив API_BASE незмінним як у вашому коді
// const API_BASE = 'http://localhost:8081/api/blockchain';
// const EXCHANGE_API_BASE = 'http://localhost:8081/api/exchange';
// const ADMIN_API_BASE = 'http://localhost:8081/api/admin';
//
// function App() {
//     const [chain, setChain] = useState([]);
//     const [pendingTxs, setPendingTxs] = useState([]);
//     const [balance, setBalance] = useState(0);
//     const [address, setAddress] = useState('');
//     const [toAddress, setToAddress] = useState('');
//     const [amount, setAmount] = useState('');
//     const [minerAddress, setMinerAddress] = useState('');
//     const [message, setMessage] = useState('');
//     const [activeTab, setActiveTab] = useState('blockchain');
//     const [isLoading, setIsLoading] = useState(false);
//
//     // Exchange states
//     const [orderBook, setOrderBook] = useState({ buyOrders: {}, sellOrders: {} });
//     const [tradeHistory, setTradeHistory] = useState([]);
//     const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
//     const [orderAmount, setOrderAmount] = useState('');
//     const [orderPrice, setOrderPrice] = useState('');
//
//     // Admin states
//     const [adminUsername, setAdminUsername] = useState('');
//     const [adminPassword, setAdminPassword] = useState('');
//     const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
//     const [adminBlockchainStats, setAdminBlockchainStats] = useState(null);
//     const [mintRecipient, setMintRecipient] = useState('');
//     const [mintAmount, setMintAmount] = useState('');
//     const [burnAddress, setBurnAddress] = useState('');
//     const [burnAmount, setBurnAmount] = useState('');
//
//     // Track if user is admin
//     const [isAdmin, setIsAdmin] = useState(false);
//
//     // Registered admin accounts (max 2)
//     const [registeredAdmins, setRegisteredAdmins] = useState(() => {
//         const saved = localStorage.getItem('registeredAdmins');
//         return saved ? JSON.parse(saved) : [];
//     });
//
//     useEffect(() => {
//         fetchBlockchain();
//         if (activeTab === 'exchange') {
//             fetchOrderBook();
//             fetchTradeHistory();
//         }
//         if (activeTab === 'admin' && adminToken) {
//             fetchAdminBlockchainStats();
//         }
//
//         // Check if current user is admin based on stored token
//         // For this demo, we assume any token means admin, but in real app, validate token
//         setIsAdmin(!!adminToken); // Set isAdmin to true if adminToken exists, false otherwise
//
//     }, [activeTab, adminToken]);
//
//     const fetchBlockchain = async () => {
//         setIsLoading(true);
//         try {
//             const [chainRes, pendingRes] = await Promise.all([
//                 fetch(`${API_BASE}/chain`),
//                 fetch(`${API_BASE}/pending`).catch(() => ({ ok: false }))
//             ]);
//
//             if (chainRes.ok) {
//                 const chainData = await chainRes.json();
//                 setChain(chainData.chain || []);
//             }
//
//             if (pendingRes.ok) {
//                 const pendingData = await pendingRes.json();
//                 setPendingTxs(pendingData || []);
//             } else {
//                 setPendingTxs([]);
//             }
//         } catch (error) {
//             console.error('Error fetching blockchain:', error);
//             setMessage('Error connecting to server or fetching blockchain data.');
//         }
//         setIsLoading(false);
//     };
//
//     const fetchBalance = async () => {
//         setIsLoading(true);
//         try {
//             const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setBalance(data.balance || 0);
//                 setMessage(`✅ Balance: ${formatBalance(data.balance || 0)} AUR`);
//             } else {
//                 const errorData = await res.json().catch(() => ({}));
//                 setMessage(`❌ ${errorData.error || 'Failed to fetch balance'}`);
//             }
//         } catch (error) {
//             console.error('Error fetching balance:', error);
//             setMessage('❌ Network error fetching balance');
//         }
//         setIsLoading(false);
//     };
//
//     const getTestFunds = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/faucet`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ address: address })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 fetchBalance();
//             } else {
//                 setMessage(`❌ ${data.error}`);
//             }
//         } catch (error) {
//             setMessage('❌ Error getting test funds');
//         }
//         setIsLoading(false);
//     };
//
//     const sendTransaction = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/transaction`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     fromAddress: address,
//                     toAddress: toAddress,
//                     amount: parseFloat(amount)
//                 })
//             });
//
//             const data = await response.json().catch(() => ({}));
//             if (response.ok) {
//                 setMessage('✅ Transaction added successfully!');
//                 setToAddress('');
//                 setAmount('');
//                 fetchBlockchain();
//                 fetchBalance();
//             } else {
//                 setMessage(`❌ ${data.error || 'Transaction failed'}`);
//                 console.error('Transaction error details:', data);
//             }
//         } catch (error) {
//             console.error('Network error:', error);
//             setMessage('❌ Network error: Could not connect to server');
//         }
//         setIsLoading(false);
//     };
//
//     const mineBlock = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/mine`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ minerAddress: minerAddress })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`⛏️ ${data.message || 'Block mined successfully!'}`);
//                 fetchBlockchain();
//                 fetchBalance();
//             } else {
//                 setMessage(`❌ ${data.error || 'Mining failed'}`);
//             }
//         } catch (error) {
//             console.error('Error mining block:', error);
//             setMessage('❌ Error mining block');
//         }
//         setIsLoading(false);
//     };
//
//     const fetchOrderBook = async () => {
//         try {
//             const res = await fetch(`${EXCHANGE_API_BASE}/orderbook`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setOrderBook(data);
//             } else {
//                 console.error('Failed to fetch order book');
//             }
//         } catch (error) {
//             console.error('Network error fetching order book:', error);
//         }
//     };
//
//     const fetchTradeHistory = async () => {
//         try {
//             const res = await fetch(`${EXCHANGE_API_BASE}/tradehistory`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setTradeHistory(data);
//             } else {
//                 console.error('Failed to fetch trade history');
//             }
//         } catch (error) {
//             console.error('Network error fetching trade history:', error);
//         }
//     };
//
//     const placeOrder = async () => {
//         // Client-side validation for user roles
//         // if (orderType === 'sell' && !isAdmin) {
//         //     setMessage('❌ Only administrators can place sell orders.');
//         //     return;
//         // }
//         // if (!address || !orderAmount || !orderPrice) {
//         //     setMessage('Please fill all order fields.');
//         //     return;
//         // }
//         // if (parseFloat(orderAmount) <= 0 || parseFloat(orderPrice) <= 0) {
//         //     setMessage('Amount and price must be positive.');
//         //     return;
//         // }
//
//         setIsLoading(true);
//         try {
//             const endpoint = orderType === 'buy' ? '/buy' : '/sell';
//             const response = await fetch(`${EXCHANGE_API_BASE}${endpoint}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     address: address,
//                     amount: parseFloat(orderAmount),
//                     price: parseFloat(orderPrice)
//                 })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
//                 setOrderAmount('');
//                 setOrderPrice('');
//                 fetchOrderBook();
//                 fetchTradeHistory();
//                 fetchBalance();
//             } else {
//                 setMessage(`❌ ${data.error || 'Order placement failed'}`);
//             }
//         } catch (error) {
//             console.error('Network error placing order:', error);
//             setMessage('❌ Network error: Could not connect to exchange');
//         }
//         setIsLoading(false);
//     };
//
//     const handleAdminLogin = () => {
//         setMessage('');
//         // Check if account already registered
//         const existingAccount = registeredAdmins.find(
//             acc => acc.username === adminUsername && acc.password === adminPassword
//         );
//
//         if (existingAccount) {
//             // If account exists, log in
//             const fakeToken = `fake-admin-token-${adminUsername}`;
//             setAdminToken(fakeToken);
//             localStorage.setItem('adminToken', fakeToken);
//             setIsAdmin(true); // Set isAdmin to true
//             setMessage('✅ Admin login successful!');
//             fetchAdminBlockchainStats();
//             return;
//         }
//
//         // If account does not exist, check if new admin can be added (max 2)
//         if (registeredAdmins.length >= 2) {
//             setMessage('❌ Maximum number of admin accounts (2) reached. Cannot register new admin.');
//             return;
//         }
//
//         // Register and log in new admin
//         const newAdmin = { username: adminUsername, password: adminPassword };
//         const updatedAdmins = [...registeredAdmins, newAdmin];
//         setRegisteredAdmins(updatedAdmins);
//         localStorage.setItem('registeredAdmins', JSON.stringify(updatedAdmins));
//
//         const fakeToken = `fake-admin-token-${adminUsername}`;
//         setAdminToken(fakeToken);
//         localStorage.setItem('adminToken', fakeToken);
//         setIsAdmin(true); // Set isAdmin to true
//         setMessage('✅ New admin registered and logged in!');
//         fetchAdminBlockchainStats();
//     };
//
//     const handleAdminLogout = () => {
//         setAdminToken('');
//         localStorage.removeItem('adminToken');
//         setAdminUsername('');
//         setAdminPassword('');
//         setAdminBlockchainStats(null);
//         setIsAdmin(false); // Set isAdmin to false on logout
//         setMessage('👋 Admin logged out.');
//     };
//
//     const fetchAdminBlockchainStats = async () => {
//         if (!adminToken) return;
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/blockchain-stats`, {
//                 headers: { 'Authorization': adminToken }
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 setAdminBlockchainStats(data);
//             } else {
//                 const errorData = await response.json().catch(() => ({}));
//                 setMessage(`❌ Failed to fetch admin stats: ${errorData.error || response.statusText}`);
//                 if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             console.error('Error fetching admin stats:', error);
//             setMessage('❌ Network error fetching admin stats');
//         }
//         setIsLoading(false);
//     };
//
//     const handleMintTokens = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/mint-tokens`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': adminToken
//                 },
//                 body: JSON.stringify({ recipientAddress: mintRecipient, amount: parseFloat(mintAmount) })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 setMintRecipient('');
//                 setMintAmount('');
//                 fetchAdminBlockchainStats();
//             } else {
//                 setMessage(`❌ ${data.error || 'Minting failed'}`);
//                 if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             console.error('Error minting tokens:', error);
//             setMessage('❌ Network error minting tokens');
//         }
//         setIsLoading(false);
//     };
//
//     const handleBurnTokens = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/burn-tokens`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': adminToken
//                 },
//                 body: JSON.stringify({ address: burnAddress, amount: parseFloat(burnAmount) })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 setBurnAddress('');
//                 setBurnAmount('');
//                 fetchAdminBlockchainStats();
//             } else {
//                 setMessage(`❌ ${data.error || 'Burning failed'}`);
//                 if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             console.error('Error burning tokens:', error);
//             setMessage('❌ Network error burning tokens');
//         }
//         setIsLoading(false);
//     };
//
//     const formatHash = (hash) => {
//         return hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
//     };
//
//     const formatBalance = (balance) => {
//         return parseFloat(balance || 0).toFixed(6);
//     };
//
//     const getPendingCount = () => {
//         return pendingTxs.length;
//     };
//
//     return (
//         <div className="app">
//             <header className="header">
//                 <div className="header-content">
//                     <h1 className="logo">
//                         <span className="logo-icon">⛓️</span>
//                         AurumFi Blockchain
//                     </h1>
//                     <div className="network-status">
//                         <div className="status-indicator"></div>
//                         <span>Online</span>
//                     </div>
//                 </div>
//             </header>
//
//             <main className="main-content">
//                 <nav className="tabs">
//                     <button className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain')}>
//                         ⛓️ Blockchain
//                     </button>
//                     <button className={`tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
//                         💰 Wallet
//                     </button>
//                     <button className={`tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
//                         📤 Send
//                     </button>
//                     <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
//                         ⛏️ Mine
//                     </button>
//                     <button className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>
//                         📈 Exchange
//                     </button>
//                     <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
//                         ⚙️ Admin
//                     </button>
//                 </nav>
//
//                 {message && (
//                     <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
//                         {message}
//                     </div>
//                 )}
//
//                 {isLoading && (
//                     <div className="loading">
//                         <div className="spinner"></div>
//                         <span>Processing...</span>
//                     </div>
//                 )}
//
//                 {activeTab === 'blockchain' && (
//                     <div className="tab-content">
//                         <div className="stats-grid">
//                             <div className="stat-card">
//                                 <h3>Total Blocks</h3>
//                                 <span className="stat-number">{chain.length}</span>
//                             </div>
//                             <div className="stat-card">
//                                 <h3>Pending Transactions</h3>
//                                 <span className="stat-number">{getPendingCount()}</span>
//                             </div>
//                             <div className="stat-card">
//                                 <h3>Total Transactions</h3>
//                                 <span className="stat-number">
//                                     {chain.reduce((total, block) => total + (block.transactions?.length || 0), 0)}
//                                 </span>
//                             </div>
//                         </div>
//
//                         <div className="blockchain-section">
//                             <h2>Latest Blocks</h2>
//                             <div className="blocks-grid">
//                                 {chain.slice().reverse().map((block, index) => (
//                                     <div key={index} className="block-card">
//                                         <div className="block-header">
//                                             <span className="block-number">Block #{chain.length - index - 1}</span>
//                                             <span className="block-hash">{formatHash(block.hash)}</span>
//                                         </div>
//                                         <div className="block-details">
//                                             <p>Transactions: {block.transactions?.length || 0}</p>
//                                             <p>Previous: {formatHash(block.previousHash)}</p>
//                                             <p>Nonce: {block.nonce || 0}</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//
//                         <div className="transactions-section">
//                             <h2>Pending Transactions ({getPendingCount()})</h2>
//                             {getPendingCount() > 0 ? (
//                                 <div className="transactions-list">
//                                     {pendingTxs.map((tx, index) => (
//                                         <div key={index} className="transaction-card">
//                                             <div className="transaction-header">
//                                                 <span className="tx-type">
//                                                     {tx.fromAddress ? 'Transfer' : 'Reward'}
//                                                 </span>
//                                                 <span className="tx-amount">{formatBalance(tx.amount)} AUR</span>
//                                             </div>
//                                             <div className="transaction-details">
//                                                 <p>From: {tx.fromAddress || 'System'}</p>
//                                                 <p>To: {tx.toAddress}</p>
//                                                 {tx.timestamp && <p>Time: {new Date(tx.timestamp).toLocaleTimeString()}</p>}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="empty-state">No pending transactions</p>
//                             )}
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'wallet' && (
//                     <div className="tab-content">
//                         <div className="wallet-card">
//                             <h2>Wallet Balance</h2>
//                             <div className="balance-display">
//                                 <span className="balance-amount">{formatBalance(balance)}</span>
//                                 <span className="balance-currency">AUR</span>
//                             </div>
//                             <div className="address-input-group">
//                                 <input
//                                     type="text"
//                                     placeholder="Enter your wallet address"
//                                     value={address}
//                                     onChange={(e) => setAddress(e.target.value)}
//                                     className="address-input"
//                                 />
//                                 <button onClick={fetchBalance} className="check-balance-btn">
//                                     Check Balance
//                                 </button>
//                             </div>
//                             {balance === 0 && (
//                                 <div className="wallet-actions">
//                                     <button onClick={getTestFunds} className="faucet-btn">
//                                         🚰 Get Test Funds (1000 AUR)
//                                     </button>
//                                 </div>
//                             )}
//                             {balance > 0 && (
//                                 <div className="wallet-actions">
//                                     <button onClick={() => setActiveTab('send')} className="send-from-wallet-btn">
//                                         Send AUR
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'send' && (
//                     <div className="tab-content">
//                         <div className="send-card">
//                             <h2>Send AurumFi Tokens</h2>
//                             <div className="form-group">
//                                 <label>From Address</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Your wallet address"
//                                     value={address}
//                                     onChange={(e) => setAddress(e.target.value)}
//                                     className="form-input"
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>To Address</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Recipient wallet address"
//                                     value={toAddress}
//                                     onChange={(e) => setToAddress(e.target.value)}
//                                     className="form-input"
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>Amount (AUR)</label>
//                                 <input
//                                     type="number"
//                                     placeholder="0.00"
//                                     value={amount}
//                                     onChange={(e) => setAmount(e.target.value)}
//                                     className="form-input"
//                                     step="0.000001"
//                                     min="0.000001"
//                                 />
//                             </div>
//                             <div className="balance-info">
//                                 Current balance: {formatBalance(balance)} AUR
//                             </div>
//                             <button
//                                 onClick={sendTransaction}
//                                 className="send-btn"
//                             >
//                                 Send Transaction
//                             </button>
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'mine' && (
//                     <div className="tab-content">
//                         <div className="mine-card">
//                             <h2>Mine New Block</h2>
//                             <div className="mining-info">
//                                 <p>Mine pending transactions and earn mining rewards</p>
//                                 <div className="mining-stats">
//                                     <span>Pending: {getPendingCount()} transactions</span>
//                                     <span>Mining reward: 50 AUR</span>
//                                 </div>
//                             </div>
//                             <div className="form-group">
//                                 <label>Miner Address</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Your miner address"
//                                     value={minerAddress}
//                                     onChange={(e) => setMinerAddress(e.target.value)}
//                                     className="form-input"
//                                 />
//                             </div>
//                             <button
//                                 onClick={mineBlock}
//                                 className="mine-btn"
//                             >
//                                 ⛏️ Start Mining
//                             </button>
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'exchange' && (
//                     <div className="tab-content">
//                         <h2>AurumFi Exchange</h2>
//                         {isAdmin && (
//                             <div className="admin-notice">
//                                 <span className="admin-badge">👑 ADMIN MODE</span>
//                                 <span>You can place both buy and sell orders</span>
//                             </div>
//                         )}
//                         {!isAdmin && (
//                             <div className="user-notice">
//                                 <span className="user-badge">👤 USER MODE</span>
//                                 <span>You can only place buy orders</span>
//                             </div>
//                         )}
//
//                         <div className="exchange-grid">
//                             <div className="order-placement-card">
//                                 <h3>Place New Order</h3>
//                                 <div className="form-group">
//                                     <label>Your Address</label>
//                                     <input
//                                         type="text"
//                                         placeholder="Your wallet address"
//                                         value={address}
//                                         onChange={(e) => setAddress(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Order Type</label>
//                                     <select
//                                         value={orderType}
//                                         onChange={(e) => setOrderType(e.target.value)}
//                                         className="form-input"
//                                         disabled={!isAdmin && orderType === 'sell'} // Disable if not admin and trying to sell
//                                     >
//                                         <option value="buy">Buy AUR</option>
//                                         <option value="sell" disabled={!isAdmin}>Sell AUR {!isAdmin && '(Admin only)'}</option>
//                                     </select>
//                                 </div>
//                                 {!isAdmin && orderType === 'sell' && (
//                                     <div className="warning-message">
//                                         ❌ Only administrators can place sell orders
//                                     </div>
//                                 )}
//                                 <div className="form-group">
//                                     <label>Amount (AUR)</label>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={orderAmount}
//                                         onChange={(e) => setOrderAmount(e.target.value)}
//                                         className="form-input"
//                                         step="0.000001"
//                                         min="0.000001"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Price (per AUR)</label>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={orderPrice}
//                                         onChange={(e) => setOrderPrice(e.target.value)}
//                                         className="form-input"
//                                         step="0.000001"
//                                         min="0.000001"
//                                     />
//                                 </div>
//                                 <button
//                                     onClick={placeOrder}
//                                     className="send-btn"
//                                     disabled={!isAdmin && orderType === 'sell'} // Disable button if not admin and trying to sell
//                                 >
//                                     Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
//                                 </button>
//                             </div>
//
//                             <div className="order-book-card">
//                                 <h3>Order Book</h3>
//                                 <div className="order-book-section">
//                                     <h4>Sell Orders (Ask)</h4>
//                                     {Object.keys(orderBook.sellOrders).length > 0 ? (
//                                         <ul className="order-list sell-orders">
//                                             {Object.entries(orderBook.sellOrders)
//                                                 .sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB))
//                                                 .map(([price, orders]) => (
//                                                     <li key={price}>
//                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
//                                                         <ul>
//                                                             {orders.map((order, idx) => (
//                                                                 <li key={idx}>
//                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     </li>
//                                                 ))}
//                                         </ul>
//                                     ) : (
//                                         <p className="empty-state">No sell orders</p>
//                                     )}
//                                 </div>
//                                 <div className="order-book-section">
//                                     <h4>Buy Orders (Bid)</h4>
//                                     {Object.keys(orderBook.buyOrders).length > 0 ? (
//                                         <ul className="order-list buy-orders">
//                                             {Object.entries(orderBook.buyOrders)
//                                                 .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
//                                                 .map(([price, orders]) => (
//                                                     <li key={price}>
//                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
//                                                         <ul>
//                                                             {orders.map((order, idx) => (
//                                                                 <li key={idx}>
//                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     </li>
//                                                 ))}
//                                         </ul>
//                                     ) : (
//                                         <p className="empty-state">No buy orders</p>
//                                     )}
//                                 </div>
//                             </div>
//
//                             <div className="trade-history-card">
//                                 <h3>Trade History</h3>
//                                 {tradeHistory.length > 0 ? (
//                                     <ul className="trade-list">
//                                         {tradeHistory.slice().reverse().map((trade, index) => (
//                                             <li key={index}>
//                                                 <p><strong>Amount: {formatBalance(trade.amount)} AUR</strong></p>
//                                                 <p>Price: {parseFloat(trade.price).toFixed(6)}</p>
//                                                 <p>Buyer: {formatHash(trade.buyer)}</p>
//                                                 <p>Seller: {formatHash(trade.seller)}</p>
//                                                 <p>Time: {new Date(trade.timestamp).toLocaleTimeString()}</p>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="empty-state">No recent trades</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {activeTab === 'admin' && (
//                     <div className="tab-content">
//                         <h2>Admin Panel</h2>
//                         {!adminToken ? (
//                             <div className="admin-login-card">
//                                 <h3>Admin Login</h3>
//                                 <div className="form-group">
//                                     <label>Username</label>
//                                     <input
//                                         type="text"
//                                         value={adminUsername}
//                                         onChange={(e) => setAdminUsername(e.target.value)}
//                                         className="form-input"
//                                         placeholder="Enter username"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Password</label>
//                                     <input
//                                         type="password"
//                                         value={adminPassword}
//                                         onChange={(e) => setAdminPassword(e.target.value)}
//                                         className="form-input"
//                                         placeholder="Enter password"
//                                     />
//                                 </div>
//                                 <button onClick={handleAdminLogin} className="send-btn">
//                                     Login / Register Admin
//                                 </button>
//                                 {registeredAdmins.length < 2 && (
//                                     <p className="info-message">
//                                         You can register {2 - registeredAdmins.length} more admin accounts.
//                                     </p>
//                                 )}
//                                 {registeredAdmins.length === 2 && (
//                                     <p className="warning-message">
//                                         Maximum 2 admin accounts registered. New accounts cannot be registered.
//                                     </p>
//                                 )}
//                                 {registeredAdmins.length > 0 && (
//                                     <div className="registered-admins-list">
//                                         <h4>Registered Admins:</h4>
//                                         <ul>
//                                             {registeredAdmins.map((admin, index) => (
//                                                 <li key={index}>{admin.username}</li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="admin-dashboard">
//                                 <button onClick={handleAdminLogout} className="mine-btn" style={{ float: 'right' }}>
//                                     Logout
//                                 </button>
//                                 <h3>Blockchain Overview (Admin)</h3>
//                                 {adminBlockchainStats ? (
//                                     <div className="stats-grid">
//                                         <div className="stat-card">
//                                             <h3>Total Blocks</h3>
//                                             <span className="stat-number">{adminBlockchainStats.blockCount}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Pending Transactions</h3>
//                                             <span className="stat-number">{adminBlockchainStats.pendingTransactions}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Total Supply (AUR)</h3>
//                                             <span className="stat-number">{formatBalance(adminBlockchainStats.totalSupply)}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Difficulty</h3>
//                                             <span className="stat-number">{adminBlockchainStats.difficulty}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Chain Valid?</h3>
//                                             <span className="stat-number">{adminBlockchainStats.isValid ? 'Yes' : 'No'}</span>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <p>Loading admin stats...</p>
//                                 )}
//
//                                 <div className="admin-actions-grid">
//                                     <div className="admin-action-card">
//                                         <h3>Mint Tokens</h3>
//                                         <div className="form-group">
//                                             <label>Recipient Address</label>
//                                             <input
//                                                 type="text"
//                                                 value={mintRecipient}
//                                                 onChange={(e) => setMintRecipient(e.target.value)}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Amount</label>
//                                             <input
//                                                 type="number"
//                                                 value={mintAmount}
//                                                 onChange={(e) => setMintAmount(e.target.value)}
//                                                 className="form-input"
//                                                 step="0.000001"
//                                                 min="0.000001"
//                                             />
//                                         </div>
//                                         <button onClick={handleMintTokens} className="send-btn">
//                                             Mint
//                                         </button>
//                                     </div>
//
//                                     <div className="admin-action-card">
//                                         <h3>Burn Tokens</h3>
//                                         <div className="form-group">
//                                             <label>Address to Burn From</label>
//                                             <input
//                                                 type="text"
//                                                 value={burnAddress}
//                                                 onChange={(e) => setBurnAddress(e.target.value)}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Amount</label>
//                                             <input
//                                                 type="number"
//                                                 value={burnAmount}
//                                                 onChange={(e) => setBurnAmount(e.target.value)}
//                                                 className="form-input"
//                                                 step="0.000001"
//                                                 min="0.000001"
//                                             />
//                                         </div>
//                                         <button onClick={handleBurnTokens} className="mine-btn">
//                                             Burn
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </main>
//
//             <footer className="footer">
//                 <p>© 2024 AurumFi Blockchain Explorer</p>
//             </footer>
//         </div>
//     );
// }
//
// export default App;

import React, { useState, useEffect } from 'react';
import './App.css';

// Змініть з 8081 на 8080
const API_BASE = 'http://localhost:8081/api/blockchain';
const EXCHANGE_API_BASE = 'http://localhost:8081/api/exchange';
const ADMIN_API_BASE = 'http://localhost:8081/api/admin';

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

    // Exchange states
    const [orderBook, setOrderBook] = useState({ buyOrders: {}, sellOrders: {} });
    const [tradeHistory, setTradeHistory] = useState([]);
    const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
    const [orderAmount, setOrderAmount] = useState('');
    const [orderPrice, setOrderPrice] = useState('');

    // Admin states
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
    const [adminBlockchainStats, setAdminBlockchainStats] = useState(null);
    const [mintRecipient, setMintRecipient] = useState('');
    const [mintAmount, setMintAmount] = useState('');
    const [burnAddress, setBurnAddress] = useState('');
    const [burnAmount, setBurnAmount] = useState('');

    useEffect(() => {
        fetchBlockchain();
        if (activeTab === 'exchange') {
            fetchOrderBook();
            fetchTradeHistory();
        }
        if (activeTab === 'admin' && adminToken) {
            fetchAdminBlockchainStats();
        }
    }, [activeTab, adminToken]);

    const fetchBlockchain = async () => {
        setIsLoading(true);
        try {
            const [chainRes, pendingRes] = await Promise.all([
                fetch(`${API_BASE}/chain`),
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
            console.error('Error fetching blockchain:', error);
            setMessage('Error connecting to server or fetching blockchain data.');
        }
        setIsLoading(false);
    };

    const fetchBalance = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance || 0);
                setMessage(`✅ Balance: ${formatBalance(data.balance || 0)} AUR`);
            } else {
                const errorData = await res.json().catch(() => ({}));
                setMessage(`❌ ${errorData.error || 'Failed to fetch balance'}`);
            }
        } catch (error) {
            // console.error('Error fetching balance:', error);
            // setMessage('❌ Network error fetching balance');
        }
        setIsLoading(false);
    };

    const getTestFunds = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/faucet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: address })
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
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/mine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minerAddress: minerAddress })
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

    const fetchOrderBook = async () => {
        try {
            const res = await fetch(`${EXCHANGE_API_BASE}/orderbook`);
            if (res.ok) {
                const data = await res.json();
                setOrderBook(data);
            } else {
                // console.error('Failed to fetch order book');
            }
        } catch (error) {
            // console.error('Network error fetching order book:', error);
        }
    };

    const fetchTradeHistory = async () => {
        try {
            const res = await fetch(`${EXCHANGE_API_BASE}/tradehistory`);
            if (res.ok) {
                const data = await res.json();
                setTradeHistory(data);
            } else {
                // console.error('Failed to fetch trade history');
            }
        } catch (error) {
            // console.error('Network error fetching trade history:', error);
        }
    };

    const placeOrder = async () => {
        setIsLoading(true);
        try {
            // Перевіряємо, чи це продаж і чи користувач не адмін
            if (orderType === 'sell' && !adminToken) {
                setMessage('❌ Only administrators can sell AUR tokens');
                setIsLoading(false);
                return;
            }

            const endpoint = orderType === 'buy' ? '/buy' : '/sell';
            const response = await fetch(`${EXCHANGE_API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: address,
                    amount: parseFloat(orderAmount),
                    price: parseFloat(orderPrice)
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(`✅ ${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
                setOrderAmount('');
                setOrderPrice('');
                fetchOrderBook();
                fetchTradeHistory();
                fetchBalance();
            } else {
                // setMessage(`❌ ${data.error || 'Order placement failed'}`);
            }
        } catch (error) {
            // console.error('Network error placing order:', error);
            // setMessage('❌ Network error: Could not connect to exchange');
        }
        setIsLoading(false);
    };

    // Оновлена функція логіну адміна з жорсткою перевіркою
    const [registeredAdmins, setRegisteredAdmins] = useState(() => {
        const saved = localStorage.getItem('registeredAdmins');
        return saved ? JSON.parse(saved) : [];
    });
    const handleAdminLogin = () => {
        setMessage('');
        // Перевіряємо, чи акаунт вже зареєстрований
        const existingAccount = registeredAdmins.find(
            acc => acc.username === adminUsername && acc.password === adminPassword
        );
        if (existingAccount) {
            // Якщо акаунт є — логінимо
            const fakeToken = `fake-admin-token-${adminUsername}`;
            setAdminToken(fakeToken);
            localStorage.setItem('adminToken', fakeToken);
            setMessage('✅ Admin login successful!');
            fetchAdminBlockchainStats();
            return;
        }
        // Якщо акаунта немає, перевіряємо чи можна додати нового (максимум 2)
        if (registeredAdmins.length >= 2) {
            setMessage('❌ Maximum number of admin accounts (2) reached. Cannot register new admin.');
            return;
        }
        // Додаємо нового адміна
        const newAdmin = { username: adminUsername, password: adminPassword };
        const updatedAdmins = [...registeredAdmins, newAdmin];
        setRegisteredAdmins(updatedAdmins);
        localStorage.setItem('registeredAdmins', JSON.stringify(updatedAdmins));
        // Логін нового адміна
        const fakeToken = `fake-admin-token-${adminUsername}`;
        setAdminToken(fakeToken);
        localStorage.setItem('adminToken', fakeToken);
        setMessage('✅ New admin registered and logged in!');
        fetchAdminBlockchainStats();
    };

    const handleAdminLogout = () => {
        setAdminToken('');
        localStorage.removeItem('adminToken');
        setAdminUsername('');
        setAdminPassword('');
        setAdminBlockchainStats(null);
        setMessage('👋 Admin logged out.');
    };

    const fetchAdminBlockchainStats = async () => {
        if (!adminToken) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${ADMIN_API_BASE}/blockchain-stats`, {
                headers: { 'Authorization': adminToken }
            });
            if (response.ok) {
                const data = await response.json();
                setAdminBlockchainStats(data);
            } else {
                // const errorData = await response.json().catch(() => ({}));
                // setMessage(`❌ Failed to fetch admin stats: ${errorData.error || response.statusText}`);
                // if (response.status === 401) handleAdminLogout();
            }
        } catch (error) {
            // console.error('Error fetching admin stats:', error);
            // setMessage('❌ Network error fetching admin stats');
        }
        setIsLoading(false);
    };

    const handleMintTokens = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${ADMIN_API_BASE}/mint-tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': adminToken
                },
                body: JSON.stringify({ recipientAddress: mintRecipient, amount: parseFloat(mintAmount) })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                setMintRecipient('');
                setMintAmount('');
                fetchAdminBlockchainStats();
            } else {
                // setMessage(`❌ ${data.error || 'Minting failed'}`);
                // if (response.status === 401) handleAdminLogout();
            }
        } catch (error) {
            // console.error('Error minting tokens:', error);
            // setMessage('❌ Network error minting tokens');
        }
        setIsLoading(false);
    };

    const handleBurnTokens = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${ADMIN_API_BASE}/burn-tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': adminToken
                },
                body: JSON.stringify({ address: burnAddress, amount: parseFloat(burnAmount) })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                setBurnAddress('');
                setBurnAmount('');
                fetchAdminBlockchainStats();
            } else {
                // setMessage(`❌ ${data.error || 'Burning failed'}`);
                // if (response.status === 401) handleAdminLogout();
            }
        } catch (error) {
            // console.error('Error burning tokens:', error);
            // setMessage('❌ Network error burning tokens');
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
                    <button className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>
                        📈 Exchange
                    </button>
                    <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                        ⚙️ Admin
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
                                                <span className="tx-amount">{formatBalance(tx.amount)} AUR</span>
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
                                <span className="balance-currency">AUR</span>
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
                            {balance === 0 && (
                                <div className="wallet-actions">
                                    <button onClick={getTestFunds} className="faucet-btn">
                                        🚰 Get Test Funds (1000 AUR)
                                    </button>
                                </div>
                            )}
                            {balance > 0 && (
                                <div className="wallet-actions">
                                    <button onClick={() => setActiveTab('send')} className="send-from-wallet-btn">
                                        Send AUR
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
                                <label>Amount (AUR)</label>
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
                                Current balance: {formatBalance(balance)} AUR
                            </div>
                            <button
                                onClick={sendTransaction}
                                className="send-btn"
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
                                    <span>Mining reward: 50 AUR</span>
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
                            >
                                ⛏️ Start Mining
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'exchange' && (
                    <div className="tab-content">
                        <h2>AurumFi Exchange</h2>
                        <div className="exchange-grid">
                            <div className="order-placement-card">
                                <h3>Place New Order</h3>
                                <div className="form-group">
                                    <label>Your Address</label>
                                    <input
                                        type="text"
                                        placeholder="Your wallet address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Order Type</label>
                                    <select
                                        value={orderType}
                                        onChange={(e) => setOrderType(e.target.value)}
                                        className="form-input"
                                        disabled={!adminToken && orderType === 'sell'}
                                    >
                                        <option value="buy">Buy AUR</option>
                                        <option value="sell" disabled={!adminToken}>Sell AUR {!adminToken && '(Admin only)'}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount (AUR)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={orderAmount}
                                        onChange={(e) => setOrderAmount(e.target.value)}
                                        className="form-input"
                                        step="0.000001"
                                        min="0.000001"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price (per AUR)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={orderPrice}
                                        onChange={(e) => setOrderPrice(e.target.value)}
                                        className="form-input"
                                        step="0.000001"
                                        min="0.000001"
                                    />
                                </div>
                                <button
                                    onClick={placeOrder}
                                    className="send-btn"
                                    disabled={!adminToken && orderType === 'sell'}
                                >
                                    Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
                                    {!adminToken && orderType === 'sell' && ' (Admin only)'}
                                </button>

                                {!adminToken && orderType === 'sell' && (
                                    <p className="error-message" style={{color: 'red', marginTop: '10px'}}>
                                        ❌ Only administrators can sell AUR tokens
                                    </p>
                                )}
                            </div>

                            <div className="order-book-card">
                                <h3>Order Book</h3>
                                <div className="order-book-section">
                                    <h4>Sell Orders (Ask)</h4>
                                    {Object.keys(orderBook.sellOrders).length > 0 ? (
                                        <ul className="order-list sell-orders">
                                            {Object.entries(orderBook.sellOrders)
                                                .sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB))
                                                .map(([price, orders]) => (
                                                    <li key={price}>
                                                        <strong>Price: {parseFloat(price).toFixed(6)}</strong>
                                                        <ul>
                                                            {orders.map((order, idx) => (
                                                                <li key={idx}>
                                                                    Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="empty-state">No sell orders</p>
                                    )}
                                </div>
                                <div className="order-book-section">
                                    <h4>Buy Orders (Bid)</h4>
                                    {Object.keys(orderBook.buyOrders).length > 0 ? (
                                        <ul className="order-list buy-orders">
                                            {Object.entries(orderBook.buyOrders)
                                                .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
                                                .map(([price, orders]) => (
                                                    <li key={price}>
                                                        <strong>Price: {parseFloat(price).toFixed(6)}</strong>
                                                        <ul>
                                                            {orders.map((order, idx) => (
                                                                <li key={idx}>
                                                                    Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="empty-state">No buy orders</p>
                                    )}
                                </div>
                            </div>

                            <div className="trade-history-card">
                                <h3>Trade History</h3>
                                {tradeHistory.length > 0 ? (
                                    <ul className="trade-list">
                                        {tradeHistory.slice().reverse().map((trade, index) => (
                                            <li key={index}>
                                                <p><strong>Amount: {formatBalance(trade.amount)} AUR</strong></p>
                                                <p>Price: {parseFloat(trade.price).toFixed(6)}</p>
                                                <p>Buyer: {formatHash(trade.buyer)}</p>
                                                <p>Seller: {formatHash(trade.seller)}</p>
                                                <p>Time: {new Date(trade.timestamp).toLocaleTimeString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="empty-state">No recent trades</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'admin' && (
                    <div className="tab-content">
                        <h2>Admin Panel</h2>
                        {!adminToken ? (
                            <div className="admin-login-card">
                                <h3>Admin Login</h3>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={adminUsername}
                                        onChange={(e) => setAdminUsername(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <button onClick={handleAdminLogin} className="send-btn">
                                    Login
                                </button>
                            </div>
                        ) : (
                            <div className="admin-dashboard">
                                <button onClick={handleAdminLogout} className="mine-btn" style={{ float: 'right' }}>
                                    Logout
                                </button>
                                <h3>Blockchain Overview (Admin)</h3>
                                {adminBlockchainStats ? (
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <h3>Total Blocks</h3>
                                            <span className="stat-number">{adminBlockchainStats.blockCount}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h3>Pending Transactions</h3>
                                            <span className="stat-number">{adminBlockchainStats.pendingTransactions}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h3>Total Supply (AUR)</h3>
                                            <span className="stat-number">{formatBalance(adminBlockchainStats.totalSupply)}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h3>Difficulty</h3>
                                            <span className="stat-number">{adminBlockchainStats.difficulty}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h3>Chain Valid?</h3>
                                            <span className="stat-number">{adminBlockchainStats.isValid ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Loading admin stats...</p>
                                )}

                                <div className="admin-actions-grid">
                                    <div className="admin-action-card">
                                        <h3>Mint Tokens</h3>
                                        <div className="form-group">
                                            <label>Recipient Address</label>
                                            <input
                                                type="text"
                                                value={mintRecipient}
                                                onChange={(e) => setMintRecipient(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Amount</label>
                                            <input
                                                type="number"
                                                value={mintAmount}
                                                onChange={(e) => setMintAmount(e.target.value)}
                                                className="form-input"
                                                step="0.000001"
                                                min="0.000001"
                                            />
                                        </div>
                                        <button onClick={handleMintTokens} className="send-btn">
                                            Mint
                                        </button>
                                    </div>

                                    <div className="admin-action-card">
                                        <h3>Burn Tokens</h3>
                                        <div className="form-group">
                                            <label>Address to Burn From</label>
                                            <input
                                                type="text"
                                                value={burnAddress}
                                                onChange={(e) => setBurnAddress(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Amount</label>
                                            <input
                                                type="number"
                                                value={burnAmount}
                                                onChange={(e) => setBurnAmount(e.target.value)}
                                                className="form-input"
                                                step="0.000001"
                                                min="0.000001"
                                            />
                                        </div>
                                        <button onClick={handleBurnTokens} className="mine-btn">
                                            Burn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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

// import React, { useState, useEffect } from 'react';
// import './App.css';
//
// const API_BASE = 'http://localhost:8081/api/blockchain';
// const EXCHANGE_API_BASE = 'http://localhost:8081/api/exchange';
// const ADMIN_API_BASE = 'http://localhost:8081/api/admin';
//
// function App() {
//     const [chain, setChain] = useState([]);
//     const [pendingTxs, setPendingTxs] = useState([]);
//     const [balance, setBalance] = useState(0);
//     const [address, setAddress] = useState('');
//     const [toAddress, setToAddress] = useState('');
//     const [amount, setAmount] = useState('');
//     const [minerAddress, setMinerAddress] = useState('');
//     const [message, setMessage] = useState('');
//     const [activeTab, setActiveTab] = useState('blockchain');
//     const [isLoading, setIsLoading] = useState(false);
//
//     // Exchange states
//     const [orderBook, setOrderBook] = useState({ buyOrders: {}, sellOrders: {} });
//     const [tradeHistory, setTradeHistory] = useState([]);
//     const [orderType, setOrderType] = useState('buy');
//     const [orderAmount, setOrderAmount] = useState('');
//     const [orderPrice, setOrderPrice] = useState('');
//
//     // Admin states
//     const [adminUsername, setAdminUsername] = useState('');
//     const [adminPassword, setAdminPassword] = useState('');
//     const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
//     const [adminBlockchainStats, setAdminBlockchainStats] = useState(null);
//     const [mintRecipient, setMintRecipient] = useState('');
//     const [mintAmount, setMintAmount] = useState('');
//     const [burnAddress, setBurnAddress] = useState('');
//     const [burnAmount, setBurnAmount] = useState('');
//
//     useEffect(() => {
//         fetchBlockchain();
//         if (activeTab === 'exchange') {
//             fetchOrderBook();
//             fetchTradeHistory();
//         }
//         if (activeTab === 'admin' && adminToken) {
//             fetchAdminBlockchainStats();
//         }
//     }, [activeTab, adminToken]);
//
//     const fetchBlockchain = async () => {
//         setIsLoading(true);
//         try {
//             const [chainRes, pendingRes] = await Promise.all([
//                 fetch(`${API_BASE}/chain`),
//                 fetch(`${API_BASE}/pending`).catch(() => ({ ok: false }))
//             ]);
//
//             if (chainRes.ok) {
//                 const chainData = await chainRes.json();
//                 setChain(chainData.chain || []);
//             }
//
//             if (pendingRes.ok) {
//                 const pendingData = await pendingRes.json();
//                 setPendingTxs(pendingData || []);
//             } else {
//                 setPendingTxs([]);
//             }
//         } catch (error) {
//             console.error('Error fetching blockchain:', error);
//             setMessage('Error connecting to server or fetching blockchain data.');
//         }
//         setIsLoading(false);
//     };
//
//     const fetchBalance = async () => {
//         setIsLoading(true);
//         try {
//             const res = await fetch(`${API_BASE}/balance/${encodeURIComponent(address)}`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setBalance(data.balance || 0);
//                 setMessage(`✅ Balance: ${formatBalance(data.balance || 0)} AUR`);
//             } else {
//                 // const errorData = await res.json().catch(() => ({}));
//                 // setMessage(`❌ ${errorData.error || 'Failed to fetch balance'}`);
//             }
//         } catch (error) {
//             // console.error('Error fetching balance:', error);
//             // setMessage('❌ Network error fetching balance');
//         }
//         setIsLoading(false);
//     };
//
//     const getTestFunds = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/faucet`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ address: address })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error}`);
//             }
//         } catch (error) {
//             // setMessage('❌ Error getting test funds');
//         }
//         setIsLoading(false);
//     };
//
//     const sendTransaction = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/transaction`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     fromAddress: address,
//                     toAddress: toAddress,
//                     amount: parseFloat(amount)
//                 })
//             });
//
//             const data = await response.json().catch(() => ({}));
//             if (response.ok) {
//                 setMessage('✅ Transaction added successfully!');
//                 setToAddress('');
//                 setAmount('');
//                 fetchBlockchain();
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Transaction failed'}`);
//             }
//         } catch (error) {
//             // setMessage('❌ Network error: Could not connect to server');
//         }
//         setIsLoading(false);
//     };
//
//     const mineBlock = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_BASE}/mine`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ minerAddress: minerAddress })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`⛏️ ${data.message || 'Block mined successfully!'}`);
//                 fetchBlockchain();
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Mining failed'}`);
//             }
//         } catch (error) {
//             // setMessage('❌ Error mining block');
//         }
//         setIsLoading(false);
//     };
//
//     const fetchOrderBook = async () => {
//         try {
//             const res = await fetch(`${EXCHANGE_API_BASE}/orderbook`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setOrderBook(data);
//             } else {
//                 // console.error('Failed to fetch order book');
//             }
//         } catch (error) {
//             // console.error('Network error fetching order book:', error);
//         }
//     };
//
//     const fetchTradeHistory = async () => {
//         try {
//             const res = await fetch(`${EXCHANGE_API_BASE}/tradehistory`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setTradeHistory(data);
//             } else {
//                 // console.error('Failed to fetch trade history');
//             }
//         } catch (error) {
//             // console.error('Network error fetching trade history:', error);
//         }
//     };
//
//     const placeOrder = async () => {
//         setIsLoading(true);
//         try {
//             // Перевірка: звичайний користувач не може продавати
//             if (orderType === 'sell' && !adminToken) {
//                 setMessage('❌ Only administrators can sell AUR tokens');
//                 setIsLoading(false);
//                 return;
//             }
//
//             const endpoint = orderType === 'buy' ? '/buy' : '/sell';
//             const response = await fetch(`${EXCHANGE_API_BASE}${endpoint}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     address: address,
//                     amount: parseFloat(orderAmount),
//                     price: parseFloat(orderPrice)
//                 })
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
//                 setOrderAmount('');
//                 setOrderPrice('');
//                 fetchOrderBook();
//                 fetchTradeHistory();
//                 fetchBalance();
//             } else {
//                 // setMessage(`❌ ${data.error || 'Order placement failed'}`);
//             }
//         } catch (error) {
//             // setMessage('❌ Network error: Could not connect to exchange');
//         }
//         setIsLoading(false);
//     };
//
//     const [registeredAdmins, setRegisteredAdmins] = useState(() => {
//         const saved = localStorage.getItem('registeredAdmins');
//         return saved ? JSON.parse(saved) : [];
//     });
//
//     const handleAdminLogin = () => {
//         setMessage('');
//         const existingAccount = registeredAdmins.find(
//             acc => acc.username === adminUsername && acc.password === adminPassword
//         );
//         if (existingAccount) {
//             const fakeToken = `fake-admin-token-${adminUsername}`;
//             setAdminToken(fakeToken);
//             localStorage.setItem('adminToken', fakeToken);
//             setMessage('✅ Admin login successful!');
//             fetchAdminBlockchainStats();
//             return;
//         }
//         if (registeredAdmins.length >= 2) {
//             setMessage('❌ Maximum number of admin accounts (2) reached. Cannot register new admin.');
//             return;
//         }
//         const newAdmin = { username: adminUsername, password: adminPassword };
//         const updatedAdmins = [...registeredAdmins, newAdmin];
//         setRegisteredAdmins(updatedAdmins);
//         localStorage.setItem('registeredAdmins', JSON.stringify(updatedAdmins));
//         const fakeToken = `fake-admin-token-${adminUsername}`;
//         setAdminToken(fakeToken);
//         localStorage.setItem('adminToken', fakeToken);
//         setMessage('✅ New admin registered and logged in!');
//         fetchAdminBlockchainStats();
//     };
//
//     const handleAdminLogout = () => {
//         setAdminToken('');
//         localStorage.removeItem('adminToken');
//         setAdminUsername('');
//         setAdminPassword('');
//         setAdminBlockchainStats(null);
//         setMessage('👋 Admin logged out.');
//     };
//
//     const fetchAdminBlockchainStats = async () => {
//         if (!adminToken) return;
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/blockchain-stats`, {
//                 headers: { 'Authorization': adminToken }
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 setAdminBlockchainStats(data);
//             } else {
//                 // if (response.status === 401) handleAdminLogout();
//             }
//         } catch (error) {
//             // setMessage('❌ Network error fetching admin stats');
//         }
//         setIsLoading(false);
//     };
//
//     const handleMintTokens = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/mint-tokens`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': adminToken
//                 },
//                 body: JSON.stringify({ recipientAddress: mintRecipient, amount: parseFloat(mintAmount) })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 setMintRecipient('');
//                 setMintAmount('');
//                 fetchAdminBlockchainStats();
//             }
//         } catch (error) {}
//         setIsLoading(false);
//     };
//
//     const handleBurnTokens = async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${ADMIN_API_BASE}/burn-tokens`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': adminToken
//                 },
//                 body: JSON.stringify({ address: burnAddress, amount: parseFloat(burnAmount) })
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setMessage(`✅ ${data.message}`);
//                 setBurnAddress('');
//                 setBurnAmount('');
//                 fetchAdminBlockchainStats();
//             }
//         } catch (error) {}
//         setIsLoading(false);
//     };
//
//     const formatHash = (hash) => hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
//     const formatBalance = (balance) => parseFloat(balance || 0).toFixed(6);
//     const getPendingCount = () => pendingTxs.length;
//
//     return (
//         <div className="app">
//             {/* Header */}
//             <header className="header">
//                 <div className="header-content">
//                     <h1 className="logo">
//                         <span className="logo-icon">⛓️</span>
//                         AurumFi Blockchain
//                     </h1>
//                     <div className="network-status">
//                         <div className="status-indicator"></div>
//                         <span>Online</span>
//                     </div>
//                 </div>
//             </header>
//
//             {/* Tabs */}
//             <main className="main-content">
//                 <nav className="tabs">
//                     <button className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain')}>
//                         ⛓️ Blockchain
//                     </button>
//                     <button className={`tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
//                         💰 Wallet
//                     </button>
//                     <button className={`tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
//                         📤 Send
//                     </button>
//                     <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
//                         ⛏️ Mine
//                     </button>
//                     <button className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>
//                         📈 Exchange
//                     </button>
//                     <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
//                         ⚙️ Admin
//                     </button>
//                 </nav>
//
//                 {message && (
//                     <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
//                         {message}
//                     </div>
//                 )}
//
//                 {isLoading && (
//                     <div className="loading">
//                         <div className="spinner"></div>
//                         <span>Processing...</span>
//                     </div>
//                 )}
//
//                 {/* Blockchain, Wallet, Send, Mine tabs тут залишаються без змін */}
//                 {/* Exchange Tab */}
//                 {activeTab === 'exchange' && (
//                     <div className="tab-content">
//                         <h2>AurumFi Exchange</h2>
//                         <div className="exchange-grid">
//                             <div className="order-placement-card">
//                                 <h3>Place New Order</h3>
//                                 <div className="form-group">
//                                     <label>Your Address</label>
//                                     <input
//                                         type="text"
//                                         placeholder="Your wallet address"
//                                         value={address}
//                                         onChange={(e) => setAddress(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Order Type</label>
//                                     <select
//                                         value={orderType}
//                                         onChange={(e) => setOrderType(e.target.value)}
//                                         className="form-input"
//                                     >
//                                         <option value="buy">Buy AUR</option>
//                                         <option value="sell">Sell AUR</option>
//                                     </select>
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Amount (AUR)</label>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={orderAmount}
//                                         onChange={(e) => setOrderAmount(e.target.value)}
//                                         className="form-input"
//                                         step="0.000001"
//                                         min="0.000001"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Price (per AUR)</label>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={orderPrice}
//                                         onChange={(e) => setOrderPrice(e.target.value)}
//                                         className="form-input"
//                                         step="0.000001"
//                                         min="0.000001"
//                                     />
//                                 </div>
//                                 <button
//                                     onClick={placeOrder}
//                                     className="send-btn"
//                                 >
//                                     Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
//                                 </button>
//                                 {!adminToken && orderType === 'sell' && (
//                                     <p className="error-message" style={{color: 'red', marginTop: '10px'}}>
//                                         ❌ Only administrators can sell AUR tokens
//                                     </p>
//                                 )}
//                             </div>
//
//                             {/* Order Book */}
//                             <div className="order-book-card">
//                                 <h3>Order Book</h3>
//                                 <div className="order-book-section">
//                                     <h4>Sell Orders (Ask)</h4>
//                                     {Object.keys(orderBook.sellOrders).length > 0 ? (
//                                         <ul className="order-list sell-orders">
//                                             {Object.entries(orderBook.sellOrders)
//                                                 .sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB))
//                                                 .map(([price, orders]) => (
//                                                     <li key={price}>
//                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
//                                                         <ul>
//                                                             {orders.map((order, idx) => (
//                                                                 <li key={idx}>
//                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     </li>
//                                                 ))}
//                                         </ul>
//                                     ) : (
//                                         <p className="empty-state">No sell orders</p>
//                                     )}
//                                 </div>
//                                 <div className="order-book-section">
//                                     <h4>Buy Orders (Bid)</h4>
//                                     {Object.keys(orderBook.buyOrders).length > 0 ? (
//                                         <ul className="order-list buy-orders">
//                                             {Object.entries(orderBook.buyOrders)
//                                                 .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
//                                                 .map(([price, orders]) => (
//                                                     <li key={price}>
//                                                         <strong>Price: {parseFloat(price).toFixed(6)}</strong>
//                                                         <ul>
//                                                             {orders.map((order, idx) => (
//                                                                 <li key={idx}>
//                                                                     Amount: {formatBalance(order.amount)} ({formatHash(order.address)})
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     </li>
//                                                 ))}
//                                         </ul>
//                                     ) : (
//                                         <p className="empty-state">No buy orders</p>
//                                     )}
//                                 </div>
//                             </div>
//
//                             {/* Trade History */}
//                             <div className="trade-history-card">
//                                 <h3>Trade History</h3>
//                                 {tradeHistory.length > 0 ? (
//                                     <ul className="trade-list">
//                                         {tradeHistory.slice().reverse().map((trade, index) => (
//                                             <li key={index}>
//                                                 <p><strong>Amount: {formatBalance(trade.amount)} AUR</strong></p>
//                                                 <p>Price: {parseFloat(trade.price).toFixed(6)}</p>
//                                                 <p>Buyer: {formatHash(trade.buyer)}</p>
//                                                 <p>Seller: {formatHash(trade.seller)}</p>
//                                                 <p>Time: {new Date(trade.timestamp).toLocaleTimeString()}</p>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="empty-state">No recent trades</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* Admin Tab */}
//                 {activeTab === 'admin' && (
//                     <div className="tab-content">
//                         <h2>Admin Panel</h2>
//                         {!adminToken ? (
//                             <div className="admin-login-card">
//                                 <h3>Admin Login</h3>
//                                 <div className="form-group">
//                                     <label>Username</label>
//                                     <input
//                                         type="text"
//                                         value={adminUsername}
//                                         onChange={(e) => setAdminUsername(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Password</label>
//                                     <input
//                                         type="password"
//                                         value={adminPassword}
//                                         onChange={(e) => setAdminPassword(e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                                 <button onClick={handleAdminLogin} className="send-btn">
//                                     Login
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="admin-dashboard">
//                                 <button onClick={handleAdminLogout} className="mine-btn" style={{ float: 'right' }}>
//                                     Logout
//                                 </button>
//                                 <h3>Blockchain Overview (Admin)</h3>
//                                 {adminBlockchainStats ? (
//                                     <div className="stats-grid">
//                                         <div className="stat-card">
//                                             <h3>Total Blocks</h3>
//                                             <span className="stat-number">{adminBlockchainStats.blockCount}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Pending Transactions</h3>
//                                             <span className="stat-number">{adminBlockchainStats.pendingTransactions}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Total Supply (AUR)</h3>
//                                             <span className="stat-number">{formatBalance(adminBlockchainStats.totalSupply)}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Difficulty</h3>
//                                             <span className="stat-number">{adminBlockchainStats.difficulty}</span>
//                                         </div>
//                                         <div className="stat-card">
//                                             <h3>Chain Valid?</h3>
//                                             <span className="stat-number">{adminBlockchainStats.isValid ? 'Yes' : 'No'}</span>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <p>Loading admin stats...</p>
//                                 )}
//
//                                 <div className="admin-actions-grid">
//                                     <div className="admin-action-card">
//                                         <h3>Mint Tokens</h3>
//                                         <div className="form-group">
//                                             <label>Recipient Address</label>
//                                             <input
//                                                 type="text"
//                                                 value={mintRecipient}
//                                                 onChange={(e) => setMintRecipient(e.target.value)}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Amount</label>
//                                             <input
//                                                 type="number"
//                                                 value={mintAmount}
//                                                 onChange={(e) => setMintAmount(e.target.value)}
//                                                 className="form-input"
//                                                 step="0.000001"
//                                                 min="0.000001"
//                                             />
//                                         </div>
//                                         <button onClick={handleMintTokens} className="send-btn">
//                                             Mint
//                                         </button>
//                                     </div>
//
//                                     <div className="admin-action-card">
//                                         <h3>Burn Tokens</h3>
//                                         <div className="form-group">
//                                             <label>Address to Burn From</label>
//                                             <input
//                                                 type="text"
//                                                 value={burnAddress}
//                                                 onChange={(e) => setBurnAddress(e.target.value)}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Amount</label>
//                                             <input
//                                                 type="number"
//                                                 value={burnAmount}
//                                                 onChange={(e) => setBurnAmount(e.target.value)}
//                                                 className="form-input"
//                                                 step="0.000001"
//                                                 min="0.000001"
//                                             />
//                                         </div>
//                                         <button onClick={handleBurnTokens} className="mine-btn">
//                                             Burn
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </main>
//
//             {/* Footer */}
//             <footer className="footer">
//                 <p>© 2024 AurumFi Blockchain Explorer</p>
//             </footer>
//         </div>
//     );
// }
//
// export default App;

