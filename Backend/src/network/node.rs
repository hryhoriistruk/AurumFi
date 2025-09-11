use std::collections::HashSet;
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use std::sync::{Arc, Mutex};

pub struct P2PNode {
    pub peers: Arc<Mutex<HashSet<String>>>,
}

impl P2PNode {
    pub fn new() -> Self {
        Self {
            peers: Arc::new(Mutex::new(HashSet::new())),
        }
    }

    pub async fn start(&self, port: u16) -> tokio::io::Result<()> {
        let listener = TcpListener::bind(("0.0.0.0", port)).await?;
        println!("P2P node listening on port {}", port);

        loop {
            let (mut socket, addr) = listener.accept().await?;
            println!("New connection: {}", addr);

            let peers_clone = self.peers.clone();
            tokio::spawn(async move {
                let mut buffer = [0u8; 1024];
                match socket.read(&mut buffer).await {
                    Ok(n) if n > 0 => {
                        let msg = String::from_utf8_lossy(&buffer[..n]);
                        println!("Received message: {}", msg);

                        peers_clone.lock().unwrap().insert(addr.to_string());
                    }
                    _ => {}
                }
            });
        }
    }

    pub async fn broadcast(&self, message: &str) {
        for peer in self.peers.lock().unwrap().iter() {
            if let Ok(mut stream) = TcpStream::connect(peer).await {
                let _ = stream.write_all(message.as_bytes()).await;
            }
        }
    }
}
