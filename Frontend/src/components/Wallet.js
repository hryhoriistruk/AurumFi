
import React, { useState, useEffect } from 'react';
import { generateWallet, importWallet, getStoredWallets, storeWallet, getWalletByAddress, removeWalletByAddress } from '../utils/crypto';
import { getBalance } from '../services/api';
import './Wallet.css';

function Wallet({ setCurrentAddress, currentAddress }) {
    const [walletName, setWalletName] = useState('');
    const [privateKeyInput, setPrivateKeyInput] = useState('');
    const [wallets, setWallets] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [selectedWalletDetails, setSelectedWalletDetails] = useState(null);

    useEffect(() => {
        const loadedWallets = getStoredWallets();
        setWallets(loadedWallets);
        if (loadedWallets.length > 0 && !currentAddress) {
            setCurrentAddress(loadedWallets[0].address);
        }
    }, [currentAddress, setCurrentAddress]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (currentAddress) {
                try {
                    const balance = await getBalance(currentAddress);
                    setWalletBalance(balance);
                    const details = getWalletByAddress(currentAddress);
                    setSelectedWalletDetails(details);
                } catch (error) {
                    console.error("Error fetching balance:", error);
                    setWalletBalance('N/A');
                }
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [currentAddress]);

    const handleCreateWallet = () => {
        if (!walletName) {
            alert('Please enter a wallet name.');
            return;
        }
        const newWallet = generateWallet(walletName);
        storeWallet(newWallet);
        setWallets(getStoredWallets());
        setCurrentAddress(newWallet.address);
        setWalletName('');
        alert(`Wallet "${newWallet.name}" created! Address: ${newWallet.address}`);
    };

    const handleImportWallet = () => {
        if (!walletName || !privateKeyInput) {
            alert('Please enter both name and private key.');
            return;
        }
        try {
            const imported = importWallet(walletName, privateKeyInput);
            storeWallet(imported);
            setWallets(getStoredWallets());
            setCurrentAddress(imported.address);
            setWalletName('');
            setPrivateKeyInput('');
            alert(`Wallet "${imported.name}" imported! Address: ${imported.address}`);
        } catch (error) {
            alert(`Error importing wallet: ${error.message}`);
        }
    };

    const handleSelectWallet = (address) => {
        setCurrentAddress(address);
    };

    const handleRemoveWallet = (address) => {
        if (window.confirm(`Are you sure you want to remove wallet with address ${address}?`)) {
            removeWalletByAddress(address);
            const loadedWallets = getStoredWallets();
            setWallets(loadedWallets);
            if (loadedWallets.length > 0) {
                setCurrentAddress(loadedWallets[0].address);
            } else {
                setCurrentAddress('');
            }
        }
    };

    return (
        <div className="wallet-container">
            <div className="wallet-grid">
                <div className="wallets-list-section">
                    <h3>Your Wallets</h3>
                    {wallets.length > 0 ? (
                        <ul className="wallet-list">
                            {wallets.map((wallet) => (
                                <li
                                    key={wallet.address}
                                    className={`wallet-item ${wallet.address === currentAddress ? 'selected' : ''}`}
                                    onClick={() => handleSelectWallet(wallet.address)}
                                >
                                    <span className="wallet-name">{wallet.name}</span>
                                    <span className="wallet-address">{wallet.address}</span>
                                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleRemoveWallet(wallet.address); }}>&times;</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">No wallets found. Create or import one.</p>
                    )}

                    {selectedWalletDetails && (
                        <div className="selected-wallet-info">
                            <h3>Selected Wallet:</h3>
                            <p><strong>Address:</strong> {selectedWalletDetails.address}</p>
                            <p><strong>Balance:</strong> {walletBalance/100000000} AUF</p>
                        </div>
                    )}
                </div>

                <div className="wallet-actions-section">
                    <h3>Create Wallet</h3>
                    <input
                        type="text"
                        placeholder="Wallet Name"
                        value={walletName}
                        onChange={(e) => setWalletName(e.target.value)}
                    />
                    <button onClick={handleCreateWallet}>Create Wallet</button>

                    <h3>Import Wallet</h3>
                    <input
                        type="text"
                        placeholder="Wallet Name"
                        value={walletName}
                        onChange={(e) => setWalletName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Private Key (hex)"
                        value={privateKeyInput}
                        onChange={(e) => setPrivateKeyInput(e.target.value)}
                    />
                    <button onClick={handleImportWallet}>Import Wallet</button>
                </div>
            </div>
        </div>
    );
}

export default Wallet;
