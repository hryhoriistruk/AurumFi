use aurumfi_neo_token::{NeoBlockchain, AppConfig, KeypairManager, AurumFiToken, P2PNode};
use aurumfi_neo_token::blockchain::Transaction;
use aurumfi_neo_token::utils::{format_amount, parse_amount};

use clap::{Parser, Subcommand};
use serde_json::json;
use std::sync::Arc;
use std::fs;
use tokio;

#[derive(Parser)]
#[command(name = "AurumFi NEO Node")]
#[command(version = "1.0.0")]
#[command(about = "AurumFi NEO-style cryptocurrency node implementation")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Start {
        #[arg(short, long, default_value = "./config.toml")]
        config: String,
        #[arg(short, long, default_value_t = 6000)]
        port: u16,
        #[arg(long, default_value_t = 8545)]
        rpc_port: u16,
    },
    // ДОДАНО НОВУ КОМАНДУ:
    Connect {
        #[arg(short, long)]
        peer: String,
    },
    CreateWallet {
        #[arg(short, long)]
        name: String
    },
    ImportWallet {
        #[arg(short, long)]
        name: String,
        #[arg(short, long)]
        private_key: String,
    },
    ListWallets,
    WalletInfo {
        #[arg(short, long)]
        address: String
    },
    Send {
        #[arg(short, long)] from: String,
        #[arg(short, long)] to: String,
        #[arg(short, long)] amount: String,
        #[arg(long)] fee: Option<String>,
    },
    Mine {
        #[arg(short, long)]
        miner_address: String
    },
    Stats,
    Token {
        #[command(subcommand)]
        token_cmd: TokenCommands,
    },
    Contract {
        #[command(subcommand)]
        contract_cmd: ContractCommands,
    },
    Rpc {
        #[arg(long, default_value_t = 8545)]
        port: u16,
    },
}

#[derive(Subcommand)]
enum TokenCommands {
    Info,
    Balance {
        #[arg(short, long)]
        address: String
    },
    Transfer {
        #[arg(short, long)] from: String,
        #[arg(short, long)] to: String,
        #[arg(short, long)] amount: String,
    },
    Mint {
        #[arg(short, long)] to: String,
        #[arg(short, long)] amount: String,
    },
    Burn {
        #[arg(short, long)] from: String,
        #[arg(short, long)] amount: String,
    },
}

#[derive(Subcommand)]
enum ContractCommands {
    Deploy {
        #[arg(short, long)]
        file: String,
        #[arg(short, long)]
        author: String,
    },
    Call {
        #[arg(short, long)]
        address: String,
        #[arg(short, long)]
        method: String,
        #[arg(short, long)]
        params: Vec<String>,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    let config = AppConfig::load("./config.toml").unwrap_or_else(|_| {
        println!("⚠️  Could not load config, using defaults");
        AppConfig {
            node_name: "AurumFi Node".to_string(),
            difficulty: 2,
            genesis_balance: 1000000,
            mining_reward: 50,
            transaction_fee: 1,
            chain_file: "chain.json".to_string(),
        }
    });

    let blockchain = NeoBlockchain::new(config.clone());
    let mut token = AurumFiToken::new();
    let mut wallet_manager = KeypairManager::new();
    let p2p_node = P2PNode::new(Arc::new(blockchain.clone()));

    let cli = Cli::parse();

    match cli.command {
        Commands::Start { config: path, port, rpc_port } => {
            println!("🚀 Starting AurumFi Node...");
            println!("📁 Config: {}", path);
            println!("🌐 P2P Port: {}", port);
            println!("🔌 RPC Port: {}", rpc_port);

            if let Err(_) = blockchain.load_from_file(&config.chain_file) {
                println!("📦 No existing blockchain found, starting fresh");
            } else {
                println!("📦 Loaded existing blockchain");
            }

            let blockchain_rpc = Arc::new(blockchain.clone());
            tokio::spawn(async move {
                aurumfi_neo_token::api::rpc::run_rpc(blockchain_rpc, rpc_port).await;
            });

            println!("✅ Node started successfully!");
            p2p_node.start(port).await?;
        }

        // ДОДАНО ОБРОБКУ НОВОЇ КОМАНДИ:
        Commands::Connect { peer } => {
            println!("🔗 Connecting to peer: {}", peer);
            match p2p_node.connect_to_peer(&peer).await {
                Ok(_) => println!("✅ Successfully connected to peer {}", peer),
                Err(e) => println!("❌ Failed to connect to peer {}: {}", peer, e),
            }
        }

        Commands::CreateWallet { name } => {
            let address = wallet_manager.create_wallet(name.clone());
            let wallet = wallet_manager.get_wallet(&name).unwrap();

            println!("🎉 Wallet created successfully!");
            println!("📛 Name: {}", name);
            println!("📍 Address: {}", address);
            println!("🔑 Public Key: {}", wallet.public_key_hex());
            println!("🔐 Private Key: {}", wallet.secret_key_hex());
            println!("");
            println!("⚠️  IMPORTANT: Save your private key securely!");

            let wallet_info = json!({
                "name": name,
                "address": address,
                "public_key": wallet.public_key_hex(),
                "private_key": wallet.secret_key_hex(),
            });

            fs::write(format!("{}_wallet.json", name), wallet_info.to_string())?;
            println!("💾 Wallet saved to {}_wallet.json", name);
        }

        Commands::ImportWallet { name, private_key } => {
            match wallet_manager.import_wallet(name.clone(), &private_key) {
                Ok(address) => {
                    println!("✅ Wallet imported successfully!");
                    println!("📛 Name: {}", name);
                    println!("📍 Address: {}", address);
                }
                Err(e) => {
                    println!("❌ Failed to import wallet: {}", e);
                }
            }
        }

        Commands::ListWallets => {
            let wallets = wallet_manager.list_wallets();
            if wallets.is_empty() {
                println!("📭 No wallets found");
            } else {
                println!("💼 Wallets:");
                for (name, address) in wallets {
                    println!("  {} -> {}", name, address);
                }
            }
        }

        Commands::WalletInfo { address } => {
            let balance = blockchain.get_balance(&address);
            let token_balance = token.balance_of(&address);

            println!("💼 Wallet Information:");
            println!("📍 Address: {}", address);
            println!("💰 Chain Balance: {}", balance);
            println!("🪙 AFI Token Balance: {} AFI", format_amount(token_balance, 8));
        }

        Commands::Send { from, to, amount, fee: _ } => {
            let parsed_amount = parse_amount(&amount, 8)?;

            // Створюємо транзакцію з правильними полями
            let tx = Transaction {
                sender: from.clone(),
                recipient: to.clone(),
                amount: parsed_amount,
                signature: "unsigned".to_string(), // Тимчасова сигнатура
            };

            if blockchain.create_transaction(tx) {
                println!("✅ Transaction created successfully!");
                println!("📤 From: {}", from);
                println!("📥 To: {}", to);
                println!("💰 Amount: {} AFI", format_amount(parsed_amount, 8));

                blockchain.save_to_file(&config.chain_file)?;
            } else {
                println!("❌ Transaction rejected: insufficient balance");
            }
        }

        Commands::Mine { miner_address } => {
            println!("⛏️  Mining block...");
            let start_time = std::time::Instant::now();

            blockchain.mine_pending(&miner_address);

            let duration = start_time.elapsed();
            println!("✅ Block mined successfully in {:?}!", duration);
            println!("🎁 Reward sent to: {}", miner_address);

            blockchain.save_to_file(&config.chain_file)?;
        }

        Commands::Stats => {
            let stats = blockchain.get_network_stats();

            println!("📊 AurumFi Network Statistics:");
            println!("╭─────────────────────────────────────╮");
            println!("│              BLOCKCHAIN             │");
            println!("├─────────────────────────────────────┤");
            println!("│ Total Blocks: {:>18} │", stats.get("total_blocks").unwrap_or(&"0".to_string()));
            println!("│ Pending Transactions: {:>10} │", stats.get("pending_transactions").unwrap_or(&"0".to_string()));
            println!("│ Mining Difficulty: {:>13} │", stats.get("difficulty").unwrap_or(&"2".to_string()));
            println!("│ Mining Reward: {:>16} │", stats.get("mining_reward").unwrap_or(&"50".to_string()));
            println!("╰─────────────────────────────────────╯");
        }

        Commands::Token { token_cmd } => {
            match token_cmd {
                TokenCommands::Info => {
                    let info = token.get_token_info();
                    println!("🪙 AurumFi Token Information:");
                    println!("🏷️  Name: {}", info.name);
                    println!("🔤 Symbol: {}", info.symbol);
                    println!("📊 Total Supply: {} {}", format_amount(info.total_supply, info.decimals), info.symbol);
                }
                TokenCommands::Balance { address } => {
                    let balance = token.balance_of(&address);
                    println!("💰 Token Balance for {}:", address);
                    println!("   {} AFI", format_amount(balance, 8));
                }
                TokenCommands::Transfer { from, to, amount } => {
                    let parsed_amount = parse_amount(&amount, 8)?;
                    match token.transfer(&from, &to, parsed_amount) {
                        Ok(_) => println!("✅ Token transfer successful!"),
                        Err(e) => println!("❌ Token transfer failed: {}", e),
                    }
                }
                TokenCommands::Mint { to, amount } => {
                    let parsed_amount = parse_amount(&amount, 8)?;
                    match token.mint(&to, parsed_amount) {
                        Ok(_) => println!("✅ Tokens minted successfully!"),
                        Err(e) => println!("❌ Minting failed: {}", e),
                    }
                }
                TokenCommands::Burn { from, amount } => {
                    let parsed_amount = parse_amount(&amount, 8)?;
                    match token.burn(&from, parsed_amount) {
                        Ok(_) => println!("🔥 Tokens burned successfully!"),
                        Err(e) => println!("❌ Burning failed: {}", e),
                    }
                }
            }
        }

        Commands::Contract { contract_cmd } => {
            match contract_cmd {
                ContractCommands::Deploy { file, author: _ } => {
                    match fs::read(&file) {
                        Ok(_) => println!("✅ Contract deployment simulation"),
                        Err(e) => println!("❌ Failed to read contract file: {}", e),
                    }
                }
                ContractCommands::Call { address, method, params } => {
                    println!("📞 Calling contract: {}", address);
                    println!("🎯 Method: {}", method);
                    println!("📝 Params: {:?}", params);
                }
            }
        }

        Commands::Rpc { port } => {
            println!("🔌 Starting RPC server on port {}...", port);
            let blockchain_arc = Arc::new(blockchain);
            aurumfi_neo_token::api::rpc::run_rpc(blockchain_arc, port).await;
        }
    }

    Ok(())
}