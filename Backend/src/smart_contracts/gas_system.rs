use std::collections::HashMap;

pub struct GasSystem {
    pub gas_reserve: HashMap<String, u64>,
}

impl GasSystem {
    pub fn new() -> Self {
        GasSystem {
            gas_reserve: HashMap::new(),
        }
    }
}