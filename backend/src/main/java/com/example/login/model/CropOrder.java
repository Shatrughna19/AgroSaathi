package com.example.login.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class CropOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long listingId;
    private Long farmerId;
    private Long buyerId;
    private String buyerName;
    private String buyerMobile;
    private String buyerEmail;
    private String cropName;
    private String quantity;
    private Double price;
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, COMPLETED
    private Boolean farmerAccepted = false;
    private Boolean buyerAccepted = false;
    private Boolean partialPaymentDone = false;
    private Boolean fullPaymentDone = false;
    private Double amountPaid = 0.0;
    private String contractHash;
    private Long contractId;
    private String farmerName;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Deadline tracking (4-day window)
    private LocalDateTime deliveryDeadline; // createdAt + 4 days
    private LocalDateTime paymentDeadline;  // createdAt + 4 days (must pay remaining 50% by then)
    private LocalDateTime partialPaymentDate; // when 50% advance was paid
    private Boolean deliveryCompleted = false;
    private Boolean deliveryOnTime = false;

    public CropOrder() {}

    public CropOrder(Long listingId, Long farmerId, Long buyerId, String buyerName, 
                     String buyerMobile, String buyerEmail, String cropName, 
                     String quantity, Double price) {
        this.listingId = listingId;
        this.farmerId = farmerId;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerMobile = buyerMobile;
        this.buyerEmail = buyerEmail;
        this.cropName = cropName;
        this.quantity = quantity;
        this.price = price;
        this.status = "PENDING";
        this.farmerAccepted = false;
        this.buyerAccepted = false;
        this.createdAt = LocalDateTime.now();
        
        // Set 4-day deadline
        this.deliveryDeadline = this.createdAt.plusDays(4);
        this.paymentDeadline = this.createdAt.plusDays(4);
        this.deliveryCompleted = false;
        this.deliveryOnTime = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerMobile() { return buyerMobile; }
    public void setBuyerMobile(String buyerMobile) { this.buyerMobile = buyerMobile; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getFarmerAccepted() { return farmerAccepted; }
    public void setFarmerAccepted(Boolean farmerAccepted) { this.farmerAccepted = farmerAccepted; }

    public Boolean getBuyerAccepted() { return buyerAccepted; }
    public void setBuyerAccepted(Boolean buyerAccepted) { this.buyerAccepted = buyerAccepted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

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

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    
    public LocalDateTime getDeliveryDeadline() { return deliveryDeadline; }
    public void setDeliveryDeadline(LocalDateTime deliveryDeadline) { this.deliveryDeadline = deliveryDeadline; }
    
    public LocalDateTime getPaymentDeadline() { return paymentDeadline; }
    public void setPaymentDeadline(LocalDateTime paymentDeadline) { this.paymentDeadline = paymentDeadline; }
    
    public LocalDateTime getPartialPaymentDate() { return partialPaymentDate; }
    public void setPartialPaymentDate(LocalDateTime partialPaymentDate) { this.partialPaymentDate = partialPaymentDate; }
    
    public Boolean getDeliveryCompleted() { return deliveryCompleted; }
    public void setDeliveryCompleted(Boolean deliveryCompleted) { this.deliveryCompleted = deliveryCompleted; }
    
    public Boolean getDeliveryOnTime() { return deliveryOnTime; }
    public void setDeliveryOnTime(Boolean deliveryOnTime) { this.deliveryOnTime = deliveryOnTime; }
}
