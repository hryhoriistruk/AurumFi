use crate::smart_contracts::SmartContract;
use std::collections::HashMap;

pub struct VM {
    pub contracts: HashMap<String, SmartContract>,
}

impl VM {
    pub fn new() -> Self {
        VM {
            contracts: HashMap::new(),
        }
    }
}