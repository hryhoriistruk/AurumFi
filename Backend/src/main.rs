use aurumfi_neo_token::{NeoBlockchain, AppConfig, WalletKeypair, P2PNode};
use aurumfi_neo_token::blockchain::block::Transaction;

use clap::{Parser, Subcommand};
use serde_json::json;
use std::sync::Arc;
use tokio;

#[derive(Parser)]
#[command(name = "AurumFi NEO Node")]
#[command(version = "0.1.0")]
#[command(about = "NEO-style cryptocurrency node implementation")]
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
    },
    CreateWallet { #[arg(short, long)] name: String },
    WalletInfo { #[arg(short, long)] address: String },
    Send {
        #[arg(short, long)] from: String,
        #[arg(short, long)] to: String,
        #[arg(short, long)] amount: u64,
    },
    Mine { #[arg(short, long)] miner_address: String },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Завантажуємо конфіг
    let config_path = "./config.toml";
    let config = AppConfig::load(config_path)?;

    // Створюємо блокчейн та P2P вузол
    let blockchain = Arc::new(NeoBlockchain::new(config.clone()));
    let p2p_node = P2PNode::new(blockchain.clone());

    let cli = Cli::parse();

    match cli.command {
        Commands::Start { config: path, port } => {
            println!("Node started with config: {}", path);
            println!("Listening for P2P connections on port {}", port);
            // Запускаємо P2P мережу
            p2p_node.start(port).await?;
        }
        Commands::CreateWallet { name } => {
            let wallet = WalletKeypair::new();
            println!("Wallet created | Name: {}", name);
            println!("Address: {}", wallet.address());
            println!("Public key: {}", wallet.public_key_hex());
            println!("Secret key: {}", wallet.secret_key_hex());
        }
        Commands::WalletInfo { address } => {
            let balance = blockchain.get_balance(&address);
            println!("Wallet: {} | Balance: {}", address, balance);
        }
        Commands::Send { from, to, amount } => {
            let tx = Transaction {
                sender: from.clone(),
                recipient: to.clone(),
                amount,
                signature: "".to_string(),
            };
            if blockchain.create_transaction(tx.clone()) {
                println!("Transaction created: {} -> {} [{}]", from, to, amount);

                // Транслюємо транзакцію по P2P мережі
                let msg = json!({
                    "type": "transaction",
                    "data": tx,
                });
                p2p_node.broadcast(&msg).await;
            } else {
                println!("Transaction rejected: insufficient balance or invalid transaction");
            }
        }
        Commands::Mine { miner_address } => {
            blockchain.mine_pending(&miner_address);
            println!("Block mined! Reward sent to {}", miner_address);

            // Публікуємо останній блок всім вузлам
            let chain = blockchain.chain.lock().unwrap();
            let last_block = chain.last().unwrap().clone();
            let msg = json!({
                "type": "block",
                "data": last_block,
            });
            p2p_node.broadcast(&msg).await;
        }
    }

    Ok(())
}
