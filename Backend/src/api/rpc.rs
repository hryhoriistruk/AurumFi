use std::sync::Arc;
use warp::Filter;
use crate::blockchain::NeoBlockchain;

pub async fn run_rpc(blockchain: Arc<NeoBlockchain>, port: u16) {
    let blockchain_filter = warp::any().map(move || blockchain.clone());

    let get_balance = warp::path!("balance" / String)
        .and(warp::get())
        .and(blockchain_filter.clone())
        .map(|address: String, blockchain: Arc<NeoBlockchain>| {
            let balance = blockchain.get_balance(&address);
            warp::reply::json(&serde_json::json!({ "balance": balance }))
        });

    let get_block_count = warp::path!("blockcount")
        .and(warp::get())
        .and(blockchain_filter.clone())
        .map(|blockchain: Arc<NeoBlockchain>| {
            let chain = blockchain.chain.lock().unwrap();
            let count = chain.len();
            warp::reply::json(&serde_json::json!({ "block_count": count }))
        });

    let routes = get_balance.or(get_block_count);

    println!("RPC server started on port {}", port);
    warp::serve(routes).run(([127, 0, 0, 1], port)).await;
}