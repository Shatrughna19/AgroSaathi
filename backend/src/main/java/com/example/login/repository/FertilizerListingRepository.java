package com.example.login.repository;

import com.example.login.model.FertilizerListing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FertilizerListingRepository extends JpaRepository<FertilizerListing, Long> {
    List<FertilizerListing> findAllByOrderByCreatedAtDesc();
    List<FertilizerListing> findAllByShopOwnerIdOrderByCreatedAtDesc(Long shopOwnerId);
}
