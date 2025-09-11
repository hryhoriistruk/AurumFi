use std::fs;

#[derive(Clone, Debug)]
pub struct AppConfig {
    // ваші поля
}


impl AppConfig {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let _contents = fs::read_to_string(path)?;
        Ok(AppConfig {
            // заповніть поля конфігурації
        })
    }
}
