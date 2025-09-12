use crate::blockchain::NeoBlockchain;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::collections::HashSet;
use tokio::sync::Mutex;
use serde_json::{Value, json};
use crate::blockchain::Block; // Додано імпорт Block

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
            let (mut socket, addr) = listener.accept().await?;
            println!("New connection from: {}", addr);

            let blockchain = self.blockchain.clone();
            let peers = self.peers.clone();

            // Додаємо піра до списку
            let peer_addr = addr.to_string();
            peers.lock().await.insert(peer_addr.clone());

            tokio::spawn(async move {
                let mut buffer = [0u8; 4096];

                loop {
                    match socket.read(&mut buffer).await {
                        Ok(0) => {
                            println!("Connection closed by peer: {}", peer_addr);
                            break;
                        }
                        Ok(n) => {
                            let msg = String::from_utf8_lossy(&buffer[..n]);
                            println!("Received message from {}: {}", peer_addr, msg);

                            if let Ok(v) = serde_json::from_str::<Value>(&msg) {
                                match v["type"].as_str() {
                                    Some("block") => {
                                        // Вказуємо тип явно для deserialization
                                        if let Ok(block) = serde_json::from_value::<Block>(v["data"].clone()) {
                                            blockchain.receive_block(serde_json::to_value(block).unwrap());
                                            println!("Received and processed block from peer");
                                        }
                                    }
                                    Some("transaction") => {
                                        // Вказуємо тип явно для deserialization
                                        if let Ok(tx) = serde_json::from_value::<crate::blockchain::Transaction>(v["data"].clone()) {
                                            blockchain.receive_transaction(serde_json::to_value(tx).unwrap());
                                            println!("Received and processed transaction from peer");
                                        }
                                    }
                                    Some("peer") => {
                                        // Обмін пірами
                                        if let Some(peer_addr) = v["data"].as_str() {
                                            peers.lock().await.insert(peer_addr.to_string());
                                            println!("Added new peer: {}", peer_addr);
                                        }
                                    }
                                    Some("get_blocks") => {
                                        // Обмін ланцюгом блоків
                                        if let Ok(chain_json) = blockchain.get_chain_json() {
                                            let response = json!({
                                                "type": "chain",
                                                "data": serde_json::from_str::<Value>(&chain_json).unwrap()
                                            });
                                            let _ = socket.write_all(response.to_string().as_bytes()).await;
                                        }
                                    }
                                    _ => {
                                        println!("Unknown message type: {:?}", v["type"]);
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            println!("Error reading from socket: {}", e);
                            break;
                        }
                    }
                }

                // Видаляємо піра при відключенні
                peers.lock().await.remove(&peer_addr);
                println!("Peer disconnected: {}", peer_addr);
            });
        }
    }

    pub async fn broadcast(&self, msg: &Value) {
        let peers = self.peers.lock().await.clone();

        for peer in peers.iter() {
            if let Ok(mut stream) = TcpStream::connect(peer).await {
                let msg_str = msg.to_string();
                match stream.write_all(msg_str.as_bytes()).await {
                    Ok(_) => {
                        println!("Broadcast message to peer: {}", peer);
                    }
                    Err(e) => {
                        println!("Failed to send message to {}: {}", peer, e);
                        // Видаляємо недоступного піра
                        self.peers.lock().await.remove(peer);
                    }
                }
            } else {
                println!("Failed to connect to peer: {}", peer);
                self.peers.lock().await.remove(peer);
            }
        }
    }

    pub async fn add_peer(&self, address: &str) {
        self.peers.lock().await.insert(address.to_string());
        println!("Added peer: {}", address);
    }

    pub async fn list_peers(&self) -> Vec<String> {
        self.peers.lock().await.iter().cloned().collect()
    }

    pub async fn connect_to_peer(&self, address: &str) -> tokio::io::Result<()> {
        if let Ok(mut stream) = TcpStream::connect(address).await {
            // Відправляємо наш адрес як піра
            let peer_msg = json!({
                "type": "peer",
                "data": format!("127.0.0.1:{}", self.get_listening_port().await?)
            });

            stream.write_all(peer_msg.to_string().as_bytes()).await?;
            self.add_peer(address).await;
            println!("Successfully connected to peer: {}", address);
            Ok(())
        } else {
            println!("Failed to connect to peer: {}", address);
            Err(tokio::io::Error::new(
                tokio::io::ErrorKind::ConnectionRefused,
                format!("Failed to connect to peer: {}", address)
            ))
        }
    }

    pub async fn sync_with_peer(&self, address: &str) -> tokio::io::Result<()> {
        if let Ok(mut stream) = TcpStream::connect(address).await {
            // Запитуємо ланцюг блоків у піра
            let request = json!({
                "type": "get_blocks"
            });

            stream.write_all(request.to_string().as_bytes()).await?;

            // Читаємо відповідь
            let mut buffer = [0u8; 65536];
            let n = stream.read(&mut buffer).await?;

            if n > 0 {
                let response = String::from_utf8_lossy(&buffer[..n]);
                if let Ok(v) = serde_json::from_str::<Value>(&response) {
                    if v["type"] == "chain" {
                        if let Ok(chain) = serde_json::from_value::<Vec<Block>>(v["data"].clone()) {
                            if self.blockchain.replace_chain(chain) {
                                println!("Successfully synced with peer: {}", address);
                            }
                        }
                    }
                }
            }

            Ok(())
        } else {
            Err(tokio::io::Error::new(
                tokio::io::ErrorKind::ConnectionRefused,
                format!("Failed to sync with peer: {}", address)
            ))
        }
    }

    async fn get_listening_port(&self) -> tokio::io::Result<u16> {
        // Заглушка - в реальній реалізації потрібно зберігати порт
        Ok(6000)
    }

    pub async fn broadcast_block(&self, block: &Block) {
        let msg = json!({
            "type": "block",
            "data": block
        });
        self.broadcast(&msg).await;
    }

    pub async fn broadcast_transaction(&self, transaction: &crate::blockchain::Transaction) {
        let msg = json!({
            "type": "transaction",
            "data": transaction
        });
        self.broadcast(&msg).await;
    }
}