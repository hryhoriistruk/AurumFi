import React, { useState, useEffect } from 'react';
import { getBlockCount } from '../services/api';
import './AurumFiToken.css';

function AurumFiToken() {
    const [networkStats, setNetworkStats] = useState({
        blockCount: 0,
        totalSupply: '100,000,000',
        circulatingSupply: '25,000,000',
        lastUpdate: new Date().toLocaleTimeString()
    });

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                const count = await getBlockCount();
                setNetworkStats(prev => ({
                    ...prev,
                    blockCount: count,
                    lastUpdate: new Date().toLocaleTimeString()
                }));
            } catch (error) {
                console.error("Error fetching network data:", error);
            }
        };

        const interval = setInterval(fetchNetworkData, 10000);
        fetchNetworkData();

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="token-container">
            <div className="floating-elements">
                <div className="floating-coin"></div>
                <div className="floating-coin"></div>
                <div className="floating-coin"></div>
                <div className="floating-coin"></div>
                <div className="floating-coin"></div>
            </div>

            <div className="token-header">
                <div className="token-icon">
                    <i className="fas fa-coins"></i>
                </div>
                <h1 className="token-title">AurumFi Token (AUF)</h1>
                <p className="token-subtitle">The decentralized future of digital gold.</p>
            </div>

            <div className="network-stats">
                <h2>Network Stats</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Total Supply</span>
                        <span className="stat-value">{networkStats.totalSupply} AUF</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Current Block</span>
                        <span className="stat-value">{networkStats.blockCount}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Circulating Supply</span>
                        <span className="stat-value">{networkStats.circulatingSupply} AUF</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Last Update</span>
                        <span className="stat-value">{networkStats.lastUpdate}</span>
                    </div>
                </div>
            </div>

            <div className="tokenomics-section">
                <h2>Tokenomics</h2>
                <div className="tokenomics-grid">
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Initial Airdrop</span>
                        <span className="tokenomics-value">10% AUF</span>
                    </div>
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Staking Pool</span>
                        <span className="tokenomics-value">30%</span>
                    </div>
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Liquidity</span>
                        <span className="tokenomics-value">20%</span>
                    </div>
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Team</span>
                        <span className="tokenomics-value">15%</span>
                    </div>
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Marketing</span>
                        <span className="tokenomics-value">10%</span>
                    </div>
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Reserve</span>
                        <span className="tokenomics-value">25%</span>
                    </div>
                    <div className="tokenomics-item">
                        <span className="tokenomics-label">Blockchain</span>
                        <span className="tokenomics-value">AurumFi Chain</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AurumFiToken;