# AurumFi NEO Token 🪙

> Advanced NEO-style cryptocurrency implementation in Rust

[![Rust](https://img.shields.io/badge/rust-1.70%2B-orange)](https://rustlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()

## 🌟 Features

### 🏗️ Core Blockchain
- **NEO-style Architecture** - Advanced consensus and validation
- **Proof of Work Mining** - Secure block creation with adjustable difficulty
- **Transaction Pool** - Efficient pending transaction management
- **Chain Persistence** - Blockchain state saved to disk
- **Block Validation** - Comprehensive integrity checking

### 🪙 AurumFi Token (AFI)
- **ERC-20 Compatible** - Standard token interface
- **Fixed Supply** - 21 million AFI maximum supply
- **8 Decimal Precision** - High-precision transactions
- **Mint & Burn** - Administrative token supply management
- **Transfer & Allowances** - Complete token functionality

### 🔐 Security
- **ED25519 Cryptography** - Military-grade digital signatures
- **SHA-256 Hashing** - Secure block and transaction hashing
- **Address Generation** - Unique wallet addresses with AFI prefix
- **Signature Verification** - Transaction authenticity validation

### 🌐 Networking
- **P2P Protocol** - Decentralized node communication
- **Block Broadcasting** - Real-time network updates
- **Transaction Relay** - Efficient transaction propagation
- **Peer Discovery** - Dynamic network growth

### 📡 RPC Interface
- **REST API** - HTTP-based interaction
- **JSON-RPC** - Standard blockchain RPC
- **Real-time Queries** - Balance, transaction, and block info
- **Contract Interaction** - Smart contract deployment and calls

### 📜 Smart Contracts
- **NEO VM** - Virtual machine for contract execution
- **Gas System** - Resource metering and fee calculation
- **NEP-5 Standard** - Token standard implementation
- **Contract Storage** - Persistent contract state

## 🚀 Quick Start

### Prerequisites
```bash
# Install Rust (1.70+)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone repository
git clone https://github.com/your-username/aurumfi-neo-token
cd aurumfi-neo-token
```

### Build & Run
```bash
# Build the project
cargo build --release

# Create default configuration
echo 'node_name = "AurumFi Node"
difficulty = 4
genesis_balance = 1000000
mining_reward = 5000000000
transaction_fee = 100000
chain_file = "aurumfi_chain.json"' > config.toml

# Start the node
cargo run -- start --port 6000 --rpc-port 8545
```

## 💼 Wallet Management

### Create New Wallet
```bash
# Create a new wallet
cargo run -- create-wallet --name alice

# Output:
# 🎉 Wallet created successfully!
# 📛 Name: alice
# 📍 Address: AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d
# 🔑 Public Key: a1b2c3d4e5f6...
# 🔐 Private Key: f6e5d4c3b2a1...
# 💾 Wallet saved to alice_wallet.json
```

### Import Existing Wallet
```bash
cargo run -- import-wallet --name bob --private-key f6e5d4c3b2a1...
```

### List Wallets
```bash
cargo run -- list-wallets

# Output:
# 💼 Wallets:
#   alice -> AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d
#   bob -> AFI9Zj8iL3nO7pR2sU4vX6yA7bC8dE9fG0h
```

## 💸 Transactions

### Send Tokens
```bash
# Send 10 AFI from alice to bob
cargo run -- send \
  --from AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d \
  --to AFI9Zj8iL3nO7pR2sU4vX6yA7bC8dE9fG0h \
  --amount 10.0 \
  --fee 0.001
```

### Check Balance
```bash
cargo run -- wallet-info --address AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d

# Output:
# 💼 Wallet Information:
# 📍 Address: AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d
# 💰 Chain Balance: 50
# 🪙 AFI Token Balance: 1000.5 AFI
```

## ⛏️ Mining

### Start Mining
```bash
cargo run -- mine --miner-address AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d

# Output:
# ⛏️  Mining block...
# ✅ Block mined successfully in 2.3s!
# 🎁 Reward sent to: AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d
```

## 🪙 Token Operations

### Get Token Information
```bash
cargo run -- token info

# Output:
# 🪙 AurumFi Token Information:
# 🏷️  Name: AurumFi
# 🔤 Symbol: AFI
# 📊 Total Supply: 10500000.0 AFI
# 🎯 Max Supply: 21000000.0 AFI
# 👥 Holders: 3
# 🔢 Decimals: 8
```

### Token Transfers
```bash
# Transfer tokens
cargo run -- token transfer \
  --from AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d \
  --to AFI9Zj8iL3nO7pR2sU4vX6yA7bC8dE9fG0h \
  --amount 100.5

# Mint new tokens (admin only)
cargo run -- token mint \
  --to AFI9Zj8iL3nO7pR2sU4vX6yA7bC8dE9fG0h \
  --amount 1000.0

# Burn tokens
cargo run -- token burn \
  --from AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d \
  --amount 50.0
```

## 📊 Network Statistics

```bash
cargo run -- stats

# Output:
# 📊 AurumFi Network Statistics:
# ╭─────────────────────────────────────╮
# │              BLOCKCHAIN             │
# ├─────────────────────────────────────┤
# │ Total Blocks:                    15 │
# │ Total Transactions:              42 │
# │ Pending Transactions:             3 │
# │ Mining Difficulty:                4 │
# │ Mining Reward:            50.0 AFI │
# ├─────────────────────────────────────┤
# │               TOKEN                 │
# ├─────────────────────────────────────┤
# │ Name:                    AurumFi    │
# │ Symbol:                       AFI   │
# │ Total Supply:        10500000.0 AFI │
# │ Max Supply:          21000000.0 AFI │
# │ Token Holders:                   15 │
# │ Decimals:                         8 │
# ╰─────────────────────────────────────╯
```

## 📜 Smart Contracts

### Deploy Contract
```bash
cargo run -- contract deploy \
  --file ./contracts/my_contract.neo \
  --author AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d

# Output:
# ✅ Smart contract deployed successfully!
# 📍 Contract Address: contract_a1b2c3d4e5f6...
# 👤 Author: AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d
# 📄 Code Size: 1024 bytes
```

### Call Contract Method
```bash
cargo run -- contract call \
  --address contract_a1b2c3d4e5f6... \
  --method "transfer" \
  --params "AFI7Xh9r..." "AFI9Zj8i..." "1000"
```

## 🔌 RPC API

### Start RPC Server
```bash
cargo run -- rpc --port 8545
```

### API Endpoints

#### Get Balance
```bash
curl http://localhost:8545/balance/AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d

# Response:
# {
#   "address": "AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d",
#   "balance": 1500000000
# }
```

#### Send Transaction
```bash
curl -X POST http://localhost:8545/send \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d",
    "recipient": "AFI9Zj8iL3nO7pR2sU4vX6yA7bC8dE9fG0h",
    "amount": 100000000,
    "signature": ""
  }'
```

#### Mine Block
```bash
curl -X POST http://localhost:8545/mine \
  -H "Content-Type: application/json" \
  -d '{"miner_address": "AFI7Xh9rK2mM8vN3pQ4sT5uW6xY7zA8bC9d"}'
```

## 🌐 P2P Network

### Start Node with P2P
```bash
# Node 1 (Bootstrap node)
cargo run -- start --port 6000

# Node 2 (Connect to bootstrap)
cargo run -- start --port 6001
```

### Network Features
- **Automatic Peer Discovery** - Find and connect to other nodes
- **Transaction Broadcasting** - Share transactions across network
- **Block Synchronization** - Download missing blocks from peers
- **Consensus Validation** - Verify blocks from other nodes

## ⚙️ Configuration

### Enhanced Config File (`config.toml`)
```toml
[node]
name = "AurumFi Node"
data_dir = "./data"
log_level = "info"

[token]
name = "AurumFi"
symbol = "AFI"
decimals = 8
initial_supply = 1050000000000000  # 10.5M AFI
max_supply = 2100000000000000      # 21M AFI

[network]
p2p_port = 6000
max_peers = 50
bootstrap_nodes = [
    "127.0.0.1:6000",
    "127.0.0.1:6001"
]

[mining]
difficulty = 4
reward = 5000000000          # 50 AFI
target_block_time = 600      # 10 minutes

[rpc]
enabled = true
port = 8545
allowed_ips = ["127.0.0.1", "::1"]
```

## 🧪 Testing

### Run Unit Tests
```bash
cargo test

# Run specific test
cargo test test_token_creation
cargo test test_blockchain_validation
```

### Integration Tests
```bash
cargo test --test integration_tests
```

### Performance Benchmarks
```bash
cargo bench
```

## 📈 Monitoring & Metrics

### Node Metrics
- Block height and hash rate
- Transaction throughput (TPS)
- Network peer count
- Memory and CPU usage

### Token Metrics
- Total supply and circulation
- Holder distribution
- Transaction volume
- Token velocity

## 🔧 Development

### Project Structure
```
aurumfi-neo-token/
├── src/
│   ├── api/              # REST and RPC endpoints
│   ├── blockchain/       # Core blockchain logic
│   ├── network/          # P2P networking
│   ├── smart_contracts/  # VM and contract system
│   ├── wallet.rs         # Cryptography and wallets
│   ├── token.rs          # AFI token implementation
│   ├── config.rs         # Configuration management
│   ├── utils.rs          # Helper functions
│   └── lib.rs           # Library exports
├── tests/               # Integration tests
├── benches/             # Performance benchmarks
├── contracts/           # Example smart contracts
├── config.toml          # Node configuration
└── README.md           # This file
```

### Adding Features
1. **New RPC Endpoints** - Add to `src/api/rpc.rs`
2. **Consensus Changes** - Modify `src/blockchain/consensus.rs`
3. **Token Features** - Extend `src/token.rs`
4. **Smart Contracts** - Add to `src/smart_contracts/`

## 🛡️ Security Considerations

### Production Deployment
- **Private Key Security** - Never expose private keys
- **Network Isolation** - Use firewalls and VPNs
- **Regular Backups** - Backup blockchain and wallet data
- **Monitoring** - Set up alerts for unusual activity
- **Updates** - Keep software updated with security patches

### Known Limitations
- **Alpha Software** - Not yet production-ready
- **Limited Consensus** - Simple PoW, consider PoS for mainnet
- **Smart Contract Security** - VM needs formal verification
- **Scalability** - Limited TPS, consider sharding solutions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NEO Project** - Inspiration for architecture
- **Rust Community** - Amazing ecosystem and tools
- **Bitcoin & Ethereum** - Blockchain pioneers
- **OpenSSL** - Cryptographic foundations

## 📞 Support

- **Discord**: [AurumFi Community](https://discord.gg/aurumfi)
- **Telegram**: [@AurumFiOfficial](https://t.me/AurumFiOfficial)
- **Email**: support@aurumfi.io
- **GitHub Issues**: [Report bugs here](https://github.com/your-username/aurumfi-neo-token/issues)

---

**⚠️ Disclaimer**: This software is experimental and should not be used with real funds without proper security audits. Always test on testnet first.