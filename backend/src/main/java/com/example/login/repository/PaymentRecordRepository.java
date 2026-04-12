package com.example.login.repository;

import com.example.login.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findAllByPayerIdOrderByCreatedAtDesc(Long payerId);
    List<PaymentRecord> findAllByPayeeIdOrderByCreatedAtDesc(Long payeeId);
    List<PaymentRecord> findAllByOrderIdAndOrderTypeOrderByCreatedAtDesc(Long orderId, String orderType);
    List<PaymentRecord> findAllByVerificationStatusOrderByCreatedAtDesc(String status);
    List<PaymentRecord> findAllByOrderByCreatedAtDesc();
}
