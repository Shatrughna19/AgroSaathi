package com.example.login.controller;

import com.example.login.model.CropVerification;
import com.example.login.service.CropVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class CropVerificationController {

    @Autowired
    private CropVerificationService cropVerificationService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCrop(@RequestBody Map<String, String> request) {
        try {
            String cropListingIdStr = request.get("cropListingId");
            String officerId = request.get("officerId");
            String status = request.get("status");
            String feedback = request.get("feedback");
            String surveyerName = request.get("surveyerName");

            // Validation
            if (cropListingIdStr == null || officerId == null || status == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Crop ID, Officer ID, and Status are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Long cropListingId = Long.parseLong(cropListingIdStr);

            // Status should be VERIFIED or REJECTED
            if (!status.equals("VERIFIED") && !status.equals("REJECTED")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid status. Must be VERIFIED or REJECTED");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            CropVerification verification = cropVerificationService.verifyListing(
                    cropListingId, officerId, status, feedback != null ? feedback : "", surveyerName != null ? surveyerName : ""
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Verification submitted successfully");
            response.put("verificationId", verification.getId());
            response.put("status", verification.getStatus());

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid Crop ID format");
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingVerifications() {
        try {
            List<CropVerification> verifications = cropVerificationService.getPendingVerifications();
            return ResponseEntity.ok(verifications);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/crop/{cropListingId}")
    public ResponseEntity<?> getVerificationByCrop(@PathVariable Long cropListingId) {
        try {
            Optional<CropVerification> verification = cropVerificationService.getVerificationByCropId(cropListingId);

            if (!verification.isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "No verification found for this crop");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(verification.get());

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/officer/{officerId}")
    public ResponseEntity<?> getVerificationsByOfficer(@PathVariable String officerId) {
        try {
            List<CropVerification> verifications = cropVerificationService.getVerificationsByOfficerId(officerId);
            return ResponseEntity.ok(verifications);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getVerificationsByStatus(@PathVariable String status) {
        try {
            List<CropVerification> verifications = cropVerificationService.getVerificationsByStatus(status);
            return ResponseEntity.ok(verifications);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
