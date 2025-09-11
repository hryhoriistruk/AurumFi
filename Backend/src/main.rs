use aurumfi_neo_token::{
    blockchain::NeoBlockchain,
    config::AppConfig,
    utils::logger::init_logger,
    wallet::WalletKeypair,
};
use clap::{Parser, Subcommand};
use tokio;

#[derive(Parser)]
#[command(name = "AurumFi NEO Node")]
#[command(version = "0.1.0")]
#[command(about = "NEO-style cryptocurrency node implementation", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Start the node
    Start {
        #[arg(short, long, default_value = "./config.toml")]
        config: String,
    },
    /// Create a new wallet
    CreateWallet {
        #[arg(short, long)]
        name: String,
    },
    /// Show wallet info
    WalletInfo {
        #[arg(short, long)]
        address: String,
    },
    /// Deploy a smart contract
    DeployContract {
        #[arg(short, long)]
        path: String,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_logger();

    let cli = Cli::parse();

    match cli.command {
        Commands::Start { config } => {
            let cfg = AppConfig::load(&config)?;
            let mut blockchain = NeoBlockchain::new(cfg.clone());
            let _wallet = WalletKeypair::new();

            log::info!("Starting AurumFi NEO Node...");
            blockchain
                .start()
                .await
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;
        }
        Commands::CreateWallet { name } => {
            let wallet = WalletKeypair::new();
            println!("Created wallet: {}", wallet.address());
            println!("Public key: {}", wallet.public_key_hex());
            println!("Save your private key securely!");
            println!("(wallet name = {})", name);
        }
        Commands::WalletInfo { address } => {
            println!("Wallet Address: {}", address);
            println!("Public Key: <mocked>");
            println!("Balance: 0");
        }
        Commands::DeployContract { path } => {
            println!("Deploying contract from: {}", path);
        }
    }

    Ok(())
}
