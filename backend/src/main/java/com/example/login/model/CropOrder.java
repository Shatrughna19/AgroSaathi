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
    private LocalDateTime createdAt = LocalDateTime.now();

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
        this.createdAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
