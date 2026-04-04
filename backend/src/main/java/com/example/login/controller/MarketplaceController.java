package com.example.login.controller;

import com.example.login.model.BuyerOrder;
import com.example.login.model.CropListing;
import com.example.login.model.CropOrder;
import com.example.login.model.FertilizerListing;
import com.example.login.repository.CropListingRepository;
import com.example.login.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173") // Vite default port
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final CropListingRepository cropListingRepository;

    public MarketplaceController(MarketplaceService marketplaceService, CropListingRepository cropListingRepository) {
        this.marketplaceService = marketplaceService;
        this.cropListingRepository = cropListingRepository;
    }

    @PostMapping(value = "/listings", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CropListing> createListing(
            @RequestPart("listing") String listingJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            CropListing listing = mapper.readValue(listingJson, CropListing.class);
            return ResponseEntity.ok(marketplaceService.createCropListing(listing, image));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create listing", e);
        }
    }

    @GetMapping("/listings")
    public ResponseEntity<List<CropListing>> getAllListings() {
        return ResponseEntity.ok(marketplaceService.getAllCropListings());
    }

    @GetMapping("/listings/for-buyer/{buyerId}")
    public ResponseEntity<List<CropListing>> getListingsForBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(marketplaceService.getCropListingsForBuyer(buyerId));
    }

    @PostMapping("/orders")
    public ResponseEntity<BuyerOrder> createOrder(@RequestBody BuyerOrder order) {
        return ResponseEntity.ok(marketplaceService.createBuyerOrder(order));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<BuyerOrder>> getAllOrders() {
        return ResponseEntity.ok(marketplaceService.getAllBuyerOrders());
    }

    @GetMapping("/orders/for-farmer/{farmerId}")
    public ResponseEntity<List<BuyerOrder>> getOrdersForFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(marketplaceService.getBuyerOrdersForFarmer(farmerId));
    }

    @GetMapping("/listings/farmer/{farmerId}")
    public ResponseEntity<List<CropListing>> getListingsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(marketplaceService.getCropListingsByFarmerId(farmerId));
    }

    @GetMapping("/orders/buyer/{buyerId}")
    public ResponseEntity<List<BuyerOrder>> getOrdersByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(marketplaceService.getBuyerOrdersByBuyerId(buyerId));
    }

    // Fertilizer Endpoints
    @PostMapping(value = "/fertilizers", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FertilizerListing> createFertilizerListing(
            @RequestPart("listing") String listingJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            FertilizerListing listing = mapper.readValue(listingJson, FertilizerListing.class);
            return ResponseEntity.ok(marketplaceService.createFertilizerListing(listing, image));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create fertilizer listing", e);
        }
    }

    @GetMapping("/fertilizers")
    public ResponseEntity<List<FertilizerListing>> getAllFertilizers() {
        return ResponseEntity.ok(marketplaceService.getAllFertilizerListings());
    }

    @GetMapping("/fertilizers/shop/{shopOwnerId}")
    public ResponseEntity<List<FertilizerListing>> getFertilizersByShopOwner(@PathVariable Long shopOwnerId) {
        return ResponseEntity.ok(marketplaceService.getFertilizerListingsByShopOwnerId(shopOwnerId));
    }

    // Notification Endpoints
    @GetMapping("/notifications/user/{userId}")
    public ResponseEntity<List<com.example.login.model.Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getNotificationsForUser(userId));
    }

    @GetMapping("/notifications/user/{userId}/unread")
    public ResponseEntity<List<com.example.login.model.Notification>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getUnreadNotifications(userId));
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<com.example.login.model.Notification> markNotificationAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(marketplaceService.markAsRead(notificationId));
    }

    // Crop Order Endpoints
    @GetMapping("/orders/crop/farmer/{farmerId}")
    public ResponseEntity<List<CropOrder>> getCropOrdersForFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(marketplaceService.getOrdersByFarmerId(farmerId));
    }

    @GetMapping("/orders/crop/buyer/{buyerId}")
    public ResponseEntity<List<CropOrder>> getCropOrdersByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(marketplaceService.getOrdersByBuyerId(buyerId));
    }

    @PostMapping("/orders/place")
    public ResponseEntity<?> placeOrder(
            @RequestParam Long listingId,
            @RequestParam Long buyerId,
            @RequestParam String buyerName,
            @RequestParam String buyerMobile,
            @RequestParam String buyerEmail) {
        try {
            CropListing listing = cropListingRepository.findById(listingId)
                    .orElseThrow(() -> new RuntimeException("Listing not found"));
            
            // 1. Create persistent CropOrder record
            CropOrder order = new CropOrder(
                listingId,
                listing.getFarmerId(),
                buyerId,
                buyerName,
                buyerMobile,
                buyerEmail,
                listing.getCropName(),
                listing.getQuantity(),
                listing.getPricePerUnit()
            );
            marketplaceService.createCropOrder(order);

            // 2. Create notification for farmer
            marketplaceService.addPlaceOrderNotification(
                listing.getFarmerId(),
                buyerId,
                buyerName,
                buyerMobile,
                buyerEmail,
                listing.getCropName(),
                listing.getQuantity(),
                listing.getPricePerUnit()
            );
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Order placed successfully, record saved and notification sent to farmer");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/contact/send")
    public ResponseEntity<?> sendContact(
            @RequestParam Long recipientId,
            @RequestParam Long senderId,
            @RequestParam String senderName,
            @RequestParam String senderMobile,
            @RequestParam String senderEmail,
            @RequestParam String senderRole,
            @RequestParam String cropName) {
        try {
            marketplaceService.addContactNotification(
                recipientId,
                senderId,
                senderName,
                senderMobile,
                senderEmail,
                senderRole,
                cropName
            );
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contact information sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/orders/crop/{id}/status")
    public ResponseEntity<CropOrder> updateCropOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(marketplaceService.updateCropOrderStatus(id, status));
    }

    @PutMapping("/orders/buyer/{id}/fulfill")
    public ResponseEntity<BuyerOrder> fulfillBuyerOrder(
            @PathVariable Long id, 
            @RequestParam Long farmerId,
            @RequestParam String farmerName,
            @RequestParam String farmerMobile,
            @RequestParam String farmerEmail) {
        return ResponseEntity.ok(marketplaceService.fulfillBuyerOrder(id, farmerId, farmerName, farmerMobile, farmerEmail));
    }

    @PutMapping("/orders/buyer/{id}/accept-fulfillment")
    public ResponseEntity<BuyerOrder> acceptBuyerFulfillment(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.acceptBuyerFulfillment(id));
    }
}
