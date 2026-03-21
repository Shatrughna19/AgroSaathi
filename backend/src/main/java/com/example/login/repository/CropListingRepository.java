package com.example.login.repository;

import com.example.login.model.CropListing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CropListingRepository extends JpaRepository<CropListing, Long> {
    List<CropListing> findAllByOrderByCreatedAtDesc();
    List<CropListing> findAllByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
