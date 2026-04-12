package com.example.login.controller;

import com.example.login.model.*;
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
@CrossOrigin(origins = "*")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final CropListingRepository cropListingRepository;

    public MarketplaceController(MarketplaceService marketplaceService, CropListingRepository cropListingRepository) {
        this.marketplaceService = marketplaceService;
        this.cropListingRepository = cropListingRepository;
    }

    // ─── Crop Listing Endpoints ────────────────────────────────────────

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

    @GetMapping("/admin/listings")
    public ResponseEntity<List<CropListing>> getAllListingsForAdmin() {
        return ResponseEntity.ok(marketplaceService.getAllCropListingsForAdmin());
    }

    @GetMapping("/listings/for-buyer/{buyerId}")
    public ResponseEntity<List<CropListing>> getListingsForBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(marketplaceService.getCropListingsForBuyer(buyerId));
    }

    @GetMapping("/listings/farmer/{farmerId}")
    public ResponseEntity<List<CropListing>> getListingsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(marketplaceService.getCropListingsByFarmerId(farmerId));
    }

    @PutMapping("/listings/{id}/verify")
    public ResponseEntity<CropListing> verifyListing(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(marketplaceService.verifyCropListing(id, status, feedback));
    }

    // ─── Buyer Order (Demand) Endpoints ────────────────────────────────

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

    @GetMapping("/orders/buyer/{buyerId}")
    public ResponseEntity<List<BuyerOrder>> getOrdersByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(marketplaceService.getBuyerOrdersByBuyerId(buyerId));
    }

    // ─── Fertilizer Endpoints ──────────────────────────────────────────

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

    // ─── Notification Endpoints ────────────────────────────────────────

    @GetMapping("/notifications/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getNotificationsForUser(userId));
    }

    @GetMapping("/notifications/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getUnreadNotifications(userId));
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(marketplaceService.markAsRead(notificationId));
    }

    // ─── Crop Order Endpoints ──────────────────────────────────────────

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

            String quantityStr = listing.getQuantity();
            double qty = 1.0;
            try {
                if (quantityStr != null && !quantityStr.trim().isEmpty()) {
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("([0-9]+(\\.[0-9]+)?)").matcher(quantityStr);
                    if (m.find()) {
                        qty = Double.parseDouble(m.group(1));
                    }
                }
            } catch (Exception e) { qty = 1.0; }

            double unitPrice = listing.getPricePerUnit() != null ? listing.getPricePerUnit() : 0.0;
            double totalPrice = unitPrice * qty;

            CropOrder order = new CropOrder(
                listingId, listing.getFarmerId(), buyerId,
                buyerName, buyerMobile, buyerEmail,
                listing.getCropName(), listing.getQuantity(), totalPrice
            );
            order.setFarmerName(listing.getFarmerName());
            marketplaceService.createCropOrder(order);

            marketplaceService.addPlaceOrderNotification(
                listing.getFarmerId(), buyerId, buyerName,
                buyerMobile, buyerEmail, listing.getCropName(),
                listing.getQuantity(), totalPrice
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

    @PutMapping("/orders/crop/{id}/status")
    public ResponseEntity<CropOrder> updateCropOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(marketplaceService.updateCropOrderStatus(id, status));
    }

    // ─── Payment Endpoints (with bank details) ─────────────────────────

    @PutMapping("/orders/crop/{id}/pay-partial")
    public ResponseEntity<CropOrder> payPartial(@PathVariable Long id, @RequestBody(required = false) PaymentRecord paymentDetails) {
        return ResponseEntity.ok(marketplaceService.payPartialPayment(id, paymentDetails));
    }

    @PutMapping("/orders/crop/{id}/complete")
    public ResponseEntity<CropOrder> completeCropOrder(@PathVariable Long id, @RequestBody(required = false) PaymentRecord paymentDetails) {
        return ResponseEntity.ok(marketplaceService.completeFullOrder(id, paymentDetails));
    }

    // Demand order payment endpoints
    @PutMapping("/orders/demand/{id}/pay-advance")
    public ResponseEntity<BuyerOrder> payDemandAdvance(@PathVariable Long id, @RequestBody(required = false) PaymentRecord paymentDetails) {
        return ResponseEntity.ok(marketplaceService.payDemandAdvance(id, paymentDetails));
    }

    @PutMapping("/orders/demand/{id}/complete")
    public ResponseEntity<BuyerOrder> completeDemandOrder(@PathVariable Long id, @RequestBody(required = false) PaymentRecord paymentDetails) {
        return ResponseEntity.ok(marketplaceService.completeDemandPayment(id, paymentDetails));
    }

    // ─── Farmer Bid Endpoints ──────────────────────────────────────────

    @PostMapping("/orders/buyer/{orderId}/bids")
    public ResponseEntity<FarmerBid> createBid(@PathVariable Long orderId, @RequestBody FarmerBid bid) {
        bid.setBuyerOrderId(orderId);
        return ResponseEntity.ok(marketplaceService.createFarmerBid(bid));
    }

    @GetMapping("/orders/buyer/{orderId}/bids")
    public ResponseEntity<List<FarmerBid>> getBidsForOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(marketplaceService.getBidsForOrder(orderId));
    }

    @PutMapping("/orders/buyer/{orderId}/bids/{bidId}/accept")
    public ResponseEntity<BuyerOrder> acceptBid(@PathVariable Long orderId, @PathVariable Long bidId) {
        return ResponseEntity.ok(marketplaceService.acceptFarmerBid(bidId));
    }

    // ─── Legacy Fulfillment Endpoints ──────────────────────────────────

    @PostMapping("/contact/send")
    public ResponseEntity<?> sendContact(
            @RequestParam Long recipientId, @RequestParam Long senderId,
            @RequestParam String senderName, @RequestParam String senderMobile,
            @RequestParam String senderEmail, @RequestParam String senderRole,
            @RequestParam String cropName) {
        try {
            marketplaceService.addContactNotification(recipientId, senderId, senderName, senderMobile, senderEmail, senderRole, cropName);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contact information sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/orders/buyer/{id}/fulfill")
    public ResponseEntity<BuyerOrder> fulfillBuyerOrder(
            @PathVariable Long id, @RequestParam Long farmerId,
            @RequestParam String farmerName, @RequestParam String farmerMobile,
            @RequestParam String farmerEmail) {
        return ResponseEntity.ok(marketplaceService.fulfillBuyerOrder(id, farmerId, farmerName, farmerMobile, farmerEmail));
    }

    @PutMapping("/orders/buyer/{id}/accept-fulfillment")
    public ResponseEntity<BuyerOrder> acceptBuyerFulfillment(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.acceptBuyerFulfillment(id));
    }

    // ─── Contract Endpoints ────────────────────────────────────────────

    @GetMapping("/contracts/{id}")
    public ResponseEntity<Contract> getContract(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getContractById(id));
    }

    @GetMapping("/contracts/farmer/{farmerId}")
    public ResponseEntity<List<Contract>> getContractsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(marketplaceService.getContractsByFarmerId(farmerId));
    }

    @GetMapping("/contracts/buyer/{buyerId}")
    public ResponseEntity<List<Contract>> getContractsByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(marketplaceService.getContractsByBuyerId(buyerId));
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<Contract>> getAllContracts() {
        return ResponseEntity.ok(marketplaceService.getAllContracts());
    }

    // ─── Payment Record Endpoints ──────────────────────────────────────

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentRecord>> getAllPayments() {
        return ResponseEntity.ok(marketplaceService.getAllPayments());
    }

    @GetMapping("/payments/pending")
    public ResponseEntity<List<PaymentRecord>> getPendingPayments() {
        return ResponseEntity.ok(marketplaceService.getPendingPayments());
    }

    @PutMapping("/payments/{id}/verify")
    public ResponseEntity<PaymentRecord> verifyPayment(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String adminNote) {
        return ResponseEntity.ok(marketplaceService.verifyPayment(id, status, adminNote));
    }
}
