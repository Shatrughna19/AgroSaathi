package com.example.login.service;

import com.example.login.model.Contract;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

/**
 * Simulated blockchain service that generates deterministic hashes for contracts.
 * Each contract block references the previous block's hash, forming a chain.
 */
@Service
public class BlockchainService {

    private String lastBlockHash = "0000000000000000000000000000000000000000000000000000000000000000";
    private long blockIndex = 0;

    /**
     * Mine a block for the given contract data and return the contract enriched
     * with blockchain metadata.
     */
    public Contract mineBlock(Contract contract) {
        blockIndex++;
        contract.setBlockIndex(String.valueOf(blockIndex));
        contract.setPreviousHash(lastBlockHash);
        contract.setBlockTimestamp(LocalDateTime.now());

        // Build the block data string
        String blockData = blockIndex
                + contract.getPreviousHash()
                + contract.getOrderId()
                + contract.getOrderType()
                + contract.getFarmerId()
                + contract.getBuyerId()
                + contract.getCropName()
                + contract.getQuantity()
                + contract.getAgreedPrice()
                + contract.getBlockTimestamp().toString();

        // Simple proof-of-work: find a nonce where hash starts with "0000"
        long nonce = 0;
        String hash;
        do {
            nonce++;
            hash = calculateHash(blockData + nonce);
        } while (!hash.startsWith("0000") && nonce < 1000000);

        contract.setNonce(nonce);
        contract.setBlockchainHash(hash);
        lastBlockHash = hash;

        return contract;
    }

    /**
     * Verify that a contract's hash is valid.
     */
    public boolean verifyBlock(Contract contract) {
        String blockData = contract.getBlockIndex()
                + contract.getPreviousHash()
                + contract.getOrderId()
                + contract.getOrderType()
                + contract.getFarmerId()
                + contract.getBuyerId()
                + contract.getCropName()
                + contract.getQuantity()
                + contract.getAgreedPrice()
                + contract.getBlockTimestamp().toString();

        String computedHash = calculateHash(blockData + contract.getNonce());
        return computedHash.equals(contract.getBlockchainHash());
    }

    private String calculateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute hash", e);
        }
    }
}
