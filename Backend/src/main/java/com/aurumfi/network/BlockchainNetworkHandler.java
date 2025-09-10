package com.aurumfi.network;

import com.aurumfi.core.Blockchain;
import com.aurumfi.model.Block;
import com.aurumfi.model.Transaction;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import io.netty.channel.ChannelHandler;

import java.util.List;

@Component
@ChannelHandler.Sharable
public class BlockchainNetworkHandler extends SimpleChannelInboundHandler<String> {

    @Autowired
    private Blockchain blockchain;

    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) throws Exception {
        try {
            NetworkMessage networkMessage = mapper.readValue(msg, NetworkMessage.class);

            switch (networkMessage.getType()) {
                case "GET_CHAIN":
                    ctx.writeAndFlush(mapper.writeValueAsString(
                            new NetworkMessage("CHAIN", mapper.writeValueAsString(blockchain.getChain()))
                    ));
                    break;
                case "NEW_TRANSACTION":
                    Transaction tx = mapper.readValue(networkMessage.getData(), Transaction.class);
                    blockchain.addTransaction(tx);
                    break;
                case "NEW_BLOCK":
                    Block block = mapper.readValue(networkMessage.getData(), Block.class);
                    // Логіка додавання блоку (потрібна перевірка)
                    break;
                default:
                    System.out.println("Unknown message type: " + networkMessage.getType());
            }
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}