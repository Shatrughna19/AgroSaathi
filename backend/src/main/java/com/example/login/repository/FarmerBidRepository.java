package com.example.login.repository;

import com.example.login.model.FarmerBid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FarmerBidRepository extends JpaRepository<FarmerBid, Long> {
    List<FarmerBid> findAllByBuyerOrderIdOrderByCreatedAtDesc(Long buyerOrderId);
    List<FarmerBid> findAllByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
