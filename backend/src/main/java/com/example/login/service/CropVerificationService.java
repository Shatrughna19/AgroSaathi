package com.example.login.service;

import com.example.login.model.CropVerification;
import com.example.login.repository.CropVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CropVerificationService {

    @Autowired
    private CropVerificationRepository cropVerificationRepository;

    /**
     * Get all pending verifications
     */
    public List<CropVerification> getPendingVerifications() {
        return cropVerificationRepository.findByStatus("PENDING");
    }

    /**
     * Get verification by crop listing ID
     */
    public Optional<CropVerification> getVerificationByCropId(Long cropListingId) {
        return cropVerificationRepository.findByCropListingId(cropListingId);
    }

    /**
     * Get all verifications by officer ID
     */
    public List<CropVerification> getVerificationsByOfficerId(String officerId) {
        return cropVerificationRepository.findByOfficerId(officerId);
    }

    /**
     * Create or update verification
     */
    public CropVerification verifyListing(Long cropListingId, String officerId, String status, String feedback, String surveyerName) throws Exception {
        // Check if verification already exists
        Optional<CropVerification> existingVerification = cropVerificationRepository.findByCropListingId(cropListingId);
        
        CropVerification verification;
        if (existingVerification.isPresent()) {
            verification = existingVerification.get();
            verification.setStatus(status);
            verification.setFeedback(feedback);
            verification.setOfficerId(officerId);
            verification.setSurveyerName(surveyerName);
        } else {
            verification = new CropVerification(cropListingId, officerId, status, feedback, surveyerName);
        }

        return cropVerificationRepository.save(verification);
    }

    /**
     * Get verification by ID
     */
    public Optional<CropVerification> getVerificationById(Long id) {
        return cropVerificationRepository.findById(id);
    }

    /**
     * Get all verifications with specific status
     */
    public List<CropVerification> getVerificationsByStatus(String status) {
        return cropVerificationRepository.findByStatus(status);
    }
}
