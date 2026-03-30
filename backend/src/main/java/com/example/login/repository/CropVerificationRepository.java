package com.example.login.repository;

import com.example.login.model.CropVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CropVerificationRepository extends JpaRepository<CropVerification, Long> {
    Optional<CropVerification> findByCropListingId(Long cropListingId);
    List<CropVerification> findByStatus(String status);
    List<CropVerification> findByOfficerId(String officerId);
}
