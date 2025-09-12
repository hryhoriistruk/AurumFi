use crate::smart_contracts::vm::{NeoVirtualMachine, Value};

pub struct Nep5Contract {
    vm: NeoVirtualMachine,
    contract_address: String,
}

impl Nep5Contract {
    pub fn new(vm: NeoVirtualMachine, contract_address: String) -> Self {
        Self {
            vm,
            contract_address,
        }
    }

    pub fn transfer(
        &mut self,
        from: String,
        to: String,
        amount: u64,
    ) -> Result<bool, Nep5Error> {
        let result = self.vm.execute_contract(
            &self.contract_address,
            "transfer",
            vec![
                Value::String(from),
                Value::String(to),
                Value::Integer(amount as i64),
            ],
        )?;

        match result {
            Value::Bool(success) => Ok(success),
            _ => Err(Nep5Error::InvalidReturnValue),
        }
    }

    pub fn balance_of(&mut self, address: String) -> Result<u64, Nep5Error> {
        let result = self.vm.execute_contract(
            &self.contract_address,
            "balanceOf",
            vec![Value::String(address)],
        )?;

        match result {
            Value::Integer(balance) => Ok(balance as u64),
            _ => Err(Nep5Error::InvalidReturnValue),
        }
    }

    pub fn total_supply(&mut self) -> Result<u64, Nep5Error> {
        let result = self.vm.execute_contract(
            &self.contract_address,
            "totalSupply",
            vec![],
        )?;

        match result {
            Value::Integer(supply) => Ok(supply as u64),
            _ => Err(Nep5Error::InvalidReturnValue),
        }
    }

    pub fn decimals(&mut self) -> Result<u8, Nep5Error> {
        let result = self.vm.execute_contract(
            &self.contract_address,
            "decimals",
            vec![],
        )?;

        match result {
            Value::Integer(decimals) => Ok(decimals as u8),
            _ => Err(Nep5Error::InvalidReturnValue),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Nep5Error {
    #[error("VM error: {0}")]
    VmError(#[from] crate::smart_contracts::vm::VmError),
    #[error("Invalid return value")]
    InvalidReturnValue,
    #[error("Insufficient balance")]
    InsufficientBalance,
    #[error("Transfer failed")]
    TransferFailed,
}