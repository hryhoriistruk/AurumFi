package com.aurumfi.util;

import com.aurumfi.model.Block;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

public class BlockSerializer {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String serializeBlock(Block block) {
        try {
            return mapper.writeValueAsString(block);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize block", e);
        }
    }

    public static Block deserializeBlock(String json) {
        try {
            return mapper.readValue(json, Block.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize block", e);
        }
    }

    public static String serializeBlockList(List<Block> blocks) {
        try {
            return mapper.writeValueAsString(blocks);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize block list", e);
        }
    }

    public static List<Block> deserializeBlockList(String json) {
        try {
            return mapper.readValue(json,
                    mapper.getTypeFactory().constructCollectionType(List.class, Block.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize block list", e);
        }
    }
}