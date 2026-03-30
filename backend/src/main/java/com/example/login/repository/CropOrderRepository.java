package com.example.login.repository;

import com.example.login.model.CropOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropOrderRepository extends JpaRepository<CropOrder, Long> {
    List<CropOrder> findAllByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<CropOrder> findAllByBuyerIdOrderByCreatedAtDesc(Long buyerId);
}
