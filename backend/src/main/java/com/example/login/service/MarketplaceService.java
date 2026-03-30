package com.example.login.service;

import com.example.login.model.BuyerOrder;
import com.example.login.model.CropListing;
import com.example.login.model.CropOrder;
import com.example.login.model.FertilizerListing;
import com.example.login.model.Notification;
import com.example.login.repository.BuyerOrderRepository;
import com.example.login.repository.CropListingRepository;
import com.example.login.repository.CropOrderRepository;
import com.example.login.repository.FertilizerListingRepository;
import com.example.login.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MarketplaceService {

    private final CropListingRepository cropListingRepository;
    private final BuyerOrderRepository buyerOrderRepository;
    private final FertilizerListingRepository fertilizerListingRepository;
    private final NotificationRepository notificationRepository;
    private final CropOrderRepository cropOrderRepository;

    public MarketplaceService(
            CropListingRepository cropListingRepository, 
            BuyerOrderRepository buyerOrderRepository,
            FertilizerListingRepository fertilizerListingRepository,
            NotificationRepository notificationRepository,
            CropOrderRepository cropOrderRepository) {
        this.cropListingRepository = cropListingRepository;
        this.buyerOrderRepository = buyerOrderRepository;
        this.fertilizerListingRepository = fertilizerListingRepository;
        this.notificationRepository = notificationRepository;
        this.cropOrderRepository = cropOrderRepository;
    }

    private String saveImage(MultipartFile image) throws Exception {
        if (image != null && !image.isEmpty()) {
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName;
        }
        return null;
    }

    public CropListing createCropListing(CropListing listing, MultipartFile image) throws Exception {
        String imageUrl = saveImage(image);
        if (imageUrl != null) {
            listing.setImageUrl(imageUrl);
        }
        return cropListingRepository.save(listing);
    }

    public List<CropListing> getAllCropListings() {
        return cropListingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CropListing> getCropListingsForBuyer(Long buyerId) {
        // Buyers see all crop listings (no restrictions)
        return cropListingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BuyerOrder> getBuyerOrdersForFarmer(Long farmerId) {
        // Farmers see all buyer demands (no restrictions)
        return buyerOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public BuyerOrder createBuyerOrder(BuyerOrder order) {
        return buyerOrderRepository.save(order);
    }

    public List<BuyerOrder> getAllBuyerOrders() {
        return buyerOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CropListing> getCropListingsByFarmerId(Long farmerId) {
        return cropListingRepository.findAllByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<BuyerOrder> getBuyerOrdersByBuyerId(Long buyerId) {
        return buyerOrderRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    // Fertilizer methods
    public FertilizerListing createFertilizerListing(FertilizerListing listing, MultipartFile image) throws Exception {
        String imageUrl = saveImage(image);
        if (imageUrl != null) {
            listing.setImageUrl(imageUrl);
        }
        return fertilizerListingRepository.save(listing);
    }

    public List<FertilizerListing> getAllFertilizerListings() {
        return fertilizerListingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<FertilizerListing> getFertilizerListingsByShopOwnerId(Long shopOwnerId) {
        return fertilizerListingRepository.findAllByShopOwnerIdOrderByCreatedAtDesc(shopOwnerId);
    }

    // Notification methods
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long recipientId) {
        return notificationRepository.findAllByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    public List<Notification> getUnreadNotifications(Long recipientId) {
        return notificationRepository.findAllByRecipientIdAndIsReadOrderByCreatedAtDesc(recipientId, false);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void addPlaceOrderNotification(Long farmerId, Long buyerId, String buyerName, 
                                         String buyerMobile, String buyerEmail, String cropName, 
                                         String quantity, Double price) {
        Notification notification = new Notification(
            farmerId, 
            buyerId, 
            buyerName, 
            buyerMobile, 
            buyerEmail, 
            "Buyer", 
            "ORDER_PLACED",
            buyerName + " is interested in your " + cropName + " listing",
            cropName,
            quantity,
            price
        );
        notificationRepository.save(notification);
    }

    public void addContactNotification(Long recipientId, Long senderId, String senderName, 
                                       String senderMobile, String senderEmail, String senderRole, 
                                       String cropName) {
        Notification notification = new Notification(
            recipientId,
            senderId,
            senderName,
            senderMobile,
            senderEmail,
            senderRole,
            "CONTACT_INQUIRY",
            senderName + " wants to contact you regarding " + cropName,
            cropName,
            null,
            null
        );
        notificationRepository.save(notification);
    }

    // Crop Orders persistent records
    public CropOrder createCropOrder(CropOrder order) {
        return cropOrderRepository.save(order);
    }

    public List<CropOrder> getOrdersByFarmerId(Long farmerId) {
        return cropOrderRepository.findAllByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<CropOrder> getOrdersByBuyerId(Long buyerId) {
        return cropOrderRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }
}
