// FileName: /Backend/src/api/rpc.rs
use std::sync::Arc;
use warp::Filter;
use crate::blockchain::{NeoBlockchain, Transaction}; // Імпортуємо Transaction з blockchain.rs
use warp::http::Method;
use serde_json::json;

pub async fn run_rpc(blockchain: Arc<NeoBlockchain>, port: u16) {
    let blockchain_filter = warp::any().map(move || blockchain.clone());

    // Конфігурація CORS
    let cors = warp::cors()
        .allow_any_origin() // Дозволити запити з будь-якого джерела (для розробки)
        // .allow_origins(["http://localhost:3000"]) // У продакшені вказуйте конкретні домени
        .allow_methods(&[Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS]) // Додайте OPTIONS для preflight запитів
        .allow_headers(vec!["Content-Type", "Authorization"])
        .build();

    // GET /balance/{address}
    let get_balance = warp::path!("balance" / String)
        .and(warp::get())
        .and(blockchain_filter.clone())
        .map(|address: String, blockchain: Arc<NeoBlockchain>| {
            let balance = blockchain.get_balance(&address);
            warp::reply::json(&json!({ "address": address, "balance": balance }))
        });

    // GET /blockcount
    let get_block_count = warp::path!("blockcount")
        .and(warp::get())
        .and(blockchain_filter.clone())
        .map(|blockchain: Arc<NeoBlockchain>| {
            let count = blockchain.get_block_count();
            warp::reply::json(&json!({ "block_count": count }))
        });

    // POST /send { "sender": "...", "recipient": "...", "amount": 123, "signature": "...", "public_key": "..." }
    let send_tx = warp::path("send")
        .and(warp::post())
        .and(warp::body::json())
        .and(blockchain_filter.clone())
        .map(|tx: Transaction, blockchain: Arc<NeoBlockchain>| {
            if blockchain.create_transaction(tx.clone()) {
                warp::reply::json(&json!({ "status": "ok", "tx_hash": tx.get_message_to_sign() })) // Повертаємо хеш повідомлення як ідентифікатор
            } else {
                warp::reply::json(&json!({ "status": "error", "message": "Invalid transaction or insufficient funds" }))
            }
        });

    // POST /mine { "miner_address": "..." }
    let mine = warp::path("mine")
        .and(warp::post())
        .and(warp::body::json())
        .and(blockchain_filter.clone())
        .map(|body: serde_json::Value, blockchain: Arc<NeoBlockchain>| {
            if let Some(miner_address) = body.get("miner_address").and_then(|v| v.as_str()) {
                blockchain.mine_pending(miner_address);
                warp::reply::json(&json!({ "status": "block mined", "miner": miner_address }))
            } else {
                warp::reply::json(&json!({ "error": "miner_address missing" }))
            }
        });

    let routes = get_balance
        .or(get_block_count)
        .or(send_tx)
        .or(mine)
        .with(cors); // Застосовуємо CORS до всіх маршрутів

    println!("RPC server started on port {}", port);
    warp::serve(routes).run(([127, 0, 0, 1], port)).await;
}