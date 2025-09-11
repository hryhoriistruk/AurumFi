use crate::blockchain::NeoBlockchain;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::collections::HashSet;
use tokio::sync::Mutex;
use serde_json::Value;

#[derive(Clone)]
pub struct P2PNode {
    pub peers: Arc<Mutex<HashSet<String>>>,
    pub blockchain: Arc<NeoBlockchain>,
}

impl P2PNode {
    pub fn new(blockchain: Arc<NeoBlockchain>) -> Self {
        Self {
            peers: Arc::new(Mutex::new(HashSet::new())),
            blockchain,
        }
    }

    pub async fn start(&self, port: u16) -> tokio::io::Result<()> {
        let listener = TcpListener::bind(("0.0.0.0", port)).await?;
        println!("P2P node listening on port {}", port);

        loop {
            let (mut socket, _addr) = listener.accept().await?;
            let blockchain = self.blockchain.clone();

            tokio::spawn(async move {
                let mut buffer = [0u8; 4096];
                if let Ok(n) = socket.read(&mut buffer).await {
                    if n == 0 { return; }
                    let msg = String::from_utf8_lossy(&buffer[..n]);
                    if let Ok(v) = serde_json::from_str::<Value>(&msg) {
                        match v["type"].as_str() {
                            Some("block") => blockchain.receive_block(v["data"].clone()),
                            Some("transaction") => blockchain.receive_transaction(v["data"].clone()),
                            _ => {}
                        }
                    }
                }
            });
        }
    }

    pub async fn broadcast(&self, msg: &Value) {
        for peer in self.peers.lock().await.iter() {
            if let Ok(mut stream) = TcpStream::connect(peer).await {
                let _ = stream.write_all(msg.to_string().as_bytes()).await;
            }
        }
    }
}
