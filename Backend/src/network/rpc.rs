use aurumfi_neo_token::blockchain::{NeoBlockchain, block::Transaction};
use std::sync::Arc;
use warp::Filter;
use serde_json::json;

pub async fn run_rpc(blockchain: Arc<NeoBlockchain>, port: u16) {
    // GET /balance/{address}
    let get_balance = warp::path!("balance" / String)
        .map({
            let blockchain = blockchain.clone();
            move |address: String| {
                let balance = blockchain.get_balance(&address);
                warp::reply::json(&json!({ "address": address, "balance": balance }))
            }
        });

    // POST /send { "from": "...", "to": "...", "amount": 123 }
    let send_tx = warp::path("send")
        .and(warp::post())
        .and(warp::body::json())
        .map({
            let blockchain = blockchain.clone();
            move |tx: Transaction| {
                blockchain.create_transaction(tx.clone());
                warp::reply::json(&json!({ "status": "ok", "tx": tx }))
            }
        });

    // POST /mine { "miner_address": "..." }
    let mine = warp::path("mine")
        .and(warp::post())
        .and(warp::body::json())
        .map({
            let blockchain = blockchain.clone();
            move |body: serde_json::Value| {
                if let Some(miner_address) = body.get("miner_address").and_then(|v| v.as_str()) {
                    blockchain.mine_pending(miner_address);
                    warp::reply::json(&json!({ "status": "block mined", "miner": miner_address }))
                } else {
                    warp::reply::json(&json!({ "error": "miner_address missing" }))
                }
            }
        });

    let routes = get_balance.or(send_tx).or(mine);

    println!("RPC server running on port {}", port);
    warp::serve(routes).run(([0, 0, 0, 0], port)).await;
}
