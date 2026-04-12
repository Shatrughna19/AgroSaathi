package com.example.login.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class BuyerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long buyerId;
    private String buyerName;
    private String buyerMobile;
    private String buyerEmail;
    private String cropName;
    private String requiredQuantity;
    private Double targetPrice;
    private String status = "PENDING"; // PENDING, FULFILLED, ACCEPTED, COMPLETED
    private Long fulfilledByFarmerId;
    private String farmerName;
    private String farmerMobile;
    private String farmerEmail;
    private Boolean partialPaymentDone = false;
    private Boolean fullPaymentDone = false;
    private Double amountPaid = 0.0;
    private String contractHash;
    private Long contractId;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerMobile() {
        return buyerMobile;
    }

    public void setBuyerMobile(String buyerMobile) {
        this.buyerMobile = buyerMobile;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getRequiredQuantity() {
        return requiredQuantity;
    }

    public void setRequiredQuantity(String requiredQuantity) {
        this.requiredQuantity = requiredQuantity;
    }

    public Double getTargetPrice() {
        return targetPrice;
    }

    public void setTargetPrice(Double targetPrice) {
        this.targetPrice = targetPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getFulfilledByFarmerId() {
        return fulfilledByFarmerId;
    }

    public void setFulfilledByFarmerId(Long fulfilledByFarmerId) {
        this.fulfilledByFarmerId = fulfilledByFarmerId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmerMobile() {
        return farmerMobile;
    }

    public void setFarmerMobile(String farmerMobile) {
        this.farmerMobile = farmerMobile;
    }

    public String getFarmerEmail() {
        return farmerEmail;
    }

    public void setFarmerEmail(String farmerEmail) {
        this.farmerEmail = farmerEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getPartialPaymentDone() { return partialPaymentDone; }
    public void setPartialPaymentDone(Boolean partialPaymentDone) { this.partialPaymentDone = partialPaymentDone; }

    public Boolean getFullPaymentDone() { return fullPaymentDone; }
    public void setFullPaymentDone(Boolean fullPaymentDone) { this.fullPaymentDone = fullPaymentDone; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public String getContractHash() { return contractHash; }
    public void setContractHash(String contractHash) { this.contractHash = contractHash; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
}
