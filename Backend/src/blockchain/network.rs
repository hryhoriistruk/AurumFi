use std::net::TcpListener as StdTcpListener;
use tokio::net::TcpListener;
use std::io;

pub struct NetworkManager {
    _listener: TcpListener, // префікс _ для уникнення warning
}

impl NetworkManager {
    pub async fn new(addr: &str) -> io::Result<Self> {
        let std_listener = StdTcpListener::bind(addr)?;
        let listener = TcpListener::from_std(std_listener)?;
        Ok(NetworkManager { _listener: listener })
    }
}
