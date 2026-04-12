package com.example.login.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class FarmerBid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long buyerOrderId;
    private Long farmerId;
    private String farmerName;
    private String farmerMobile;
    private String farmerEmail;
    private Double offeredPrice; // total price offered
    private String message;
    private String seasonType;
    private String suppliedQuantity;
    private Boolean accepted = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBuyerOrderId() { return buyerOrderId; }
    public void setBuyerOrderId(Long buyerOrderId) { this.buyerOrderId = buyerOrderId; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getFarmerMobile() { return farmerMobile; }
    public void setFarmerMobile(String farmerMobile) { this.farmerMobile = farmerMobile; }

    public String getFarmerEmail() { return farmerEmail; }
    public void setFarmerEmail(String farmerEmail) { this.farmerEmail = farmerEmail; }

    public Double getOfferedPrice() { return offeredPrice; }
    public void setOfferedPrice(Double offeredPrice) { this.offeredPrice = offeredPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSeasonType() { return seasonType; }
    public void setSeasonType(String seasonType) { this.seasonType = seasonType; }

    public String getSuppliedQuantity() { return suppliedQuantity; }
    public void setSuppliedQuantity(String suppliedQuantity) { this.suppliedQuantity = suppliedQuantity; }

    public Boolean getAccepted() { return accepted; }
    public void setAccepted(Boolean accepted) { this.accepted = accepted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
