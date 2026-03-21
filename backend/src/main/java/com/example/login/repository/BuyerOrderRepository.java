package com.example.login.repository;

import com.example.login.model.BuyerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BuyerOrderRepository extends JpaRepository<BuyerOrder, Long> {
    List<BuyerOrder> findAllByOrderByCreatedAtDesc();
    List<BuyerOrder> findAllByBuyerIdOrderByCreatedAtDesc(Long buyerId);
}
