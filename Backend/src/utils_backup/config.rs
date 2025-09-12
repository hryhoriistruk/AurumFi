// src/utils/config.rs

use config::{Config, Environment, File};
use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Deserialize)]
pub struct MyConfig {
    pub field1: String,
    pub field2: u32,
}

pub fn load_config<P: AsRef<Path>>(path: Option<P>) -> Result<MyConfig, config::ConfigError> {
    let mut builder = Config::builder();

    if let Some(path) = path {
        builder = builder.add_source(File::with_name(path.as_ref().to_str().unwrap()).required(false));
    }

    builder = builder.add_source(Environment::with_prefix("AURUMFI").separator("_"));

    let config = builder.build()?;
    config.try_deserialize()
}