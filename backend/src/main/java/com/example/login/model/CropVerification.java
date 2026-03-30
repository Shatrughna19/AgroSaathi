package com.example.login.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crop_verifications")
public class CropVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cropListingId;

    @Column(nullable = false)
    private String officerId;

    @Column(nullable = false)
    private String status; // PENDING, VERIFIED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = false)
    private String surveyerName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime verificationDate;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        verificationDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public CropVerification() {}

    public CropVerification(Long cropListingId, String officerId, String status, String feedback, String surveyerName) {
        this.cropListingId = cropListingId;
        this.officerId = officerId;
        this.status = status;
        this.feedback = feedback;
        this.surveyerName = surveyerName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCropListingId() {
        return cropListingId;
    }

    public void setCropListingId(Long cropListingId) {
        this.cropListingId = cropListingId;
    }

    public String getOfficerId() {
        return officerId;
    }

    public void setOfficerId(String officerId) {
        this.officerId = officerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getSurveyerName() {
        return surveyerName;
    }

    public void setSurveyerName(String surveyerName) {
        this.surveyerName = surveyerName;
    }

    public LocalDateTime getVerificationDate() {
        return verificationDate;
    }

    public void setVerificationDate(LocalDateTime verificationDate) {
        this.verificationDate = verificationDate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
