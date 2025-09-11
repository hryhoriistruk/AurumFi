// src/token/core.rs

pub struct AurumFiToken {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

impl AurumFiToken {
    pub fn new(name: &str, symbol: &str, decimals: u8) -> Self {
        AurumFiToken {
            name: name.to_string(),
            symbol: symbol.to_string(),
            decimals,
        }
    }
}