package com.example.login.repository;

import com.example.login.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findAllByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Contract> findAllByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    Optional<Contract> findByOrderIdAndOrderType(Long orderId, String orderType);
    List<Contract> findAllByOrderByCreatedAtDesc();
}
