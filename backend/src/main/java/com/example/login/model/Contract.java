package com.example.login.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;           // CropOrder or BuyerOrder ID
    private String orderType;       // "CROP_ORDER" or "DEMAND_ORDER"
    private Long farmerId;
    private String farmerName;
    private Long buyerId;
    private String buyerName;
    private String cropName;
    private String quantity;
    private Double agreedPrice;
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED

    // Blockchain fields
    @Column(length = 512)
    private String blockchainHash;
    private String blockIndex;
    private String previousHash;
    private Long nonce;
    private LocalDateTime blockTimestamp;

    // Payment tracking
    private Boolean advancePaid = false;
    private Boolean fullPaid = false;
    private Double advanceAmount = 0.0;
    private Double totalPaid = 0.0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public Double getAgreedPrice() { return agreedPrice; }
    public void setAgreedPrice(Double agreedPrice) { this.agreedPrice = agreedPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBlockchainHash() { return blockchainHash; }
    public void setBlockchainHash(String blockchainHash) { this.blockchainHash = blockchainHash; }

    public String getBlockIndex() { return blockIndex; }
    public void setBlockIndex(String blockIndex) { this.blockIndex = blockIndex; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public Long getNonce() { return nonce; }
    public void setNonce(Long nonce) { this.nonce = nonce; }

    public LocalDateTime getBlockTimestamp() { return blockTimestamp; }
    public void setBlockTimestamp(LocalDateTime blockTimestamp) { this.blockTimestamp = blockTimestamp; }

    public Boolean getAdvancePaid() { return advancePaid; }
    public void setAdvancePaid(Boolean advancePaid) { this.advancePaid = advancePaid; }

    public Boolean getFullPaid() { return fullPaid; }
    public void setFullPaid(Boolean fullPaid) { this.fullPaid = fullPaid; }

    public Double getAdvanceAmount() { return advanceAmount; }
    public void setAdvanceAmount(Double advanceAmount) { this.advanceAmount = advanceAmount; }

    public Double getTotalPaid() { return totalPaid; }
    public void setTotalPaid(Double totalPaid) { this.totalPaid = totalPaid; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
