use std::collections::HashMap;

pub struct Storage {
    pub storage: HashMap<String, String>,
}

impl Storage {
    pub fn new() -> Self {
        Storage {
            storage: HashMap::new(),
        }
    }
}