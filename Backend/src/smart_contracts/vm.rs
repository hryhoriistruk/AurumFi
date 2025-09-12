use super::SmartContract;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

pub type WalletAddress = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Value {
    String(String),
    Integer(i64),
    Bool(bool),
    Array(Vec<Value>),
}

pub struct NeoVirtualMachine {
    pub contracts: HashMap<String, SmartContract>,
    pub gas_limit: u64,
    pub gas_price: u64,
}

impl NeoVirtualMachine {
    pub fn new() -> Self {
        Self {
            contracts: HashMap::new(),
            gas_limit: 1000000, // 1M gas limit
            gas_price: 1,       // 1 unit per gas
        }
    }

    pub fn deploy_contract(&mut self, contract: SmartContract) -> Result<String, VmError> {
        let address = contract.address.clone();
        self.contracts.insert(address.clone(), contract);
        Ok(address)
    }

    pub fn execute_contract(
        &mut self,
        address: &str,
        method: &str,
        params: Vec<Value>,
    ) -> Result<Value, VmError> {
        let contract = self.contracts.get_mut(address)
            .ok_or(VmError::ContractNotFound)?;

        // Convert Value params to String params for execution
        let string_params: Vec<String> = params.into_iter().map(|v| match v {
            Value::String(s) => s,
            Value::Integer(i) => i.to_string(),
            Value::Bool(b) => b.to_string(),
            Value::Array(_) => "[]".to_string(), // Simplified
        }).collect();

        match contract.execute(method, string_params) {
            Ok(result) => {
                // Try to parse result back to appropriate Value
                if result == "true" || result == "false" {
                    Ok(Value::Bool(result == "true"))
                } else if let Ok(int_val) = result.parse::<i64>() {
                    Ok(Value::Integer(int_val))
                } else {
                    Ok(Value::String(result))
                }
            }
            Err(e) => Err(VmError::ExecutionError(e))
        }
    }

    pub fn get_contract_storage(&self, address: &str, key: &str) -> Option<String> {
        self.contracts.get(address)?.storage.get(key).cloned()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum VmError {
    #[error("Contract not found")]
    ContractNotFound,
    #[error("Execution error: {0}")]
    ExecutionError(String),
    #[error("Out of gas")]
    OutOfGas,
    #[error("Invalid parameters")]
    InvalidParameters,
}