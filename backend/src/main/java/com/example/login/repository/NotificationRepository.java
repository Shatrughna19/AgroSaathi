package com.example.login.repository;

import com.example.login.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<Notification> findAllByRecipientIdAndIsReadOrderByCreatedAtDesc(Long recipientId, Boolean isRead);
}
