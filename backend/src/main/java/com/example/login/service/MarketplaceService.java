package com.example.login.service;

import com.example.login.model.*;
import com.example.login.repository.*;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
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
    private final FarmerBidRepository farmerBidRepository;
    private final ContractRepository contractRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final BlockchainService blockchainService;
    private final UserRepository userRepository;

    public MarketplaceService(
            CropListingRepository cropListingRepository,
            BuyerOrderRepository buyerOrderRepository,
            FertilizerListingRepository fertilizerListingRepository,
            NotificationRepository notificationRepository,
            CropOrderRepository cropOrderRepository,
            FarmerBidRepository farmerBidRepository,
            ContractRepository contractRepository,
            PaymentRecordRepository paymentRecordRepository,
            BlockchainService blockchainService,
            UserRepository userRepository) {
        this.cropListingRepository = cropListingRepository;
        this.buyerOrderRepository = buyerOrderRepository;
        this.fertilizerListingRepository = fertilizerListingRepository;
        this.notificationRepository = notificationRepository;
        this.cropOrderRepository = cropOrderRepository;
        this.farmerBidRepository = farmerBidRepository;
        this.contractRepository = contractRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.blockchainService = blockchainService;
        this.userRepository = userRepository;
    }

    /** Returns true if the farmer who owns this listing has all required bank details set. */
    private boolean farmerHasBankDetails(Long farmerId) {
        return userRepository.findById(farmerId)
                .map(u -> u.getBankAccountNumber() != null && !u.getBankAccountNumber().trim().isEmpty()
                        && u.getBankIfscCode() != null && !u.getBankIfscCode().trim().isEmpty()
                        && u.getBankName() != null && !u.getBankName().trim().isEmpty()
                        && u.getBankAccountHolderName() != null && !u.getBankAccountHolderName().trim().isEmpty())
                .orElse(false);
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

    // ─── Crop Listing Methods ───────────────────────────────────────────

    public CropListing createCropListing(CropListing listing, MultipartFile image) throws Exception {
        String imageUrl = saveImage(image);
        if (imageUrl != null) {
            listing.setImageUrl(imageUrl);
        }
        return cropListingRepository.save(listing);
    }

    public List<CropListing> getAllCropListings() {
        // Show all active listings that are verified. 
        // We'll handle bank detail checks in the UI/Order flow instead of hiding the whole product.
        return cropListingRepository.findAllByIsSoldFalseOrderByCreatedAtDesc()
                .stream()
                .filter(l -> "VERIFIED".equals(l.getVerificationStatus()) || "ACTIVE".equals(l.getVerificationStatus()) || l.getVerificationStatus() == null)
                .collect(Collectors.toList());
    }

    public List<CropListing> getAllCropListingsForAdmin() {
        // Admin sees all listings that are not sold yet
        return cropListingRepository.findAllByIsSoldFalseOrderByCreatedAtDesc();
    }

    public List<CropListing> getCropListingsForBuyer(Long buyerId) {
        // Show verified listings to buyers
        return cropListingRepository.findAllByIsSoldFalseOrderByCreatedAtDesc()
                .stream()
                .filter(l -> "VERIFIED".equals(l.getVerificationStatus()) || "ACTIVE".equals(l.getVerificationStatus()))
                .collect(Collectors.toList());
    }

    public List<CropListing> getCropListingsByFarmerId(Long farmerId) {
        return cropListingRepository.findAllByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    // ─── Buyer Order (Demand) Methods ───────────────────────────────────

    public BuyerOrder createBuyerOrder(BuyerOrder order) {
        return buyerOrderRepository.save(order);
    }

    public List<BuyerOrder> getAllBuyerOrders() {
        return buyerOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BuyerOrder> getBuyerOrdersForFarmer(Long farmerId) {
        return buyerOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BuyerOrder> getBuyerOrdersByBuyerId(Long buyerId) {
        return buyerOrderRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    // ─── Fertilizer Methods ─────────────────────────────────────────────

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

    // ─── Notification Methods ───────────────────────────────────────────

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
            farmerId, buyerId, buyerName, buyerMobile, buyerEmail,
            "Buyer", "ORDER_PLACED",
            buyerName + " is interested in your " + cropName + " listing",
            cropName, quantity, price
        );
        notificationRepository.save(notification);
    }

    public void addContactNotification(Long recipientId, Long senderId, String senderName,
                                       String senderMobile, String senderEmail, String senderRole,
                                       String cropName) {
        Notification notification = new Notification(
            recipientId, senderId, senderName, senderMobile, senderEmail,
            senderRole, "CONTACT_INQUIRY",
            senderName + " wants to contact you regarding " + cropName,
            cropName, null, null
        );
        notificationRepository.save(notification);
    }

    // ─── Crop Order (persistent records) ────────────────────────────────

    public CropOrder createCropOrder(CropOrder order) {
        return cropOrderRepository.save(order);
    }

    public List<CropOrder> getOrdersByFarmerId(Long farmerId) {
        return cropOrderRepository.findAllByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<CropOrder> getOrdersByBuyerId(Long buyerId) {
        return cropOrderRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public CropOrder updateCropOrderStatus(Long orderId, String status) {
        CropOrder order = cropOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);

        Notification notification = new Notification(
            order.getBuyerId(), order.getFarmerId(),
            "System", "", "", "Farmer", "ORDER_STATUS_UPDATE",
            "Your order for " + order.getCropName() + " has been " + status.toLowerCase(),
            order.getCropName(), order.getQuantity(), order.getPrice()
        );
        notificationRepository.save(notification);

        return cropOrderRepository.save(order);
    }

    // ─── Farmer Accept / Reject Crop Order ──────────────────────────────

    public CropOrder farmerAcceptCropOrder(Long orderId, Long farmerId) {
        CropOrder order = cropOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Farmer mismatch");
        }
        order.setFarmerAccepted(true);
        order.setStatus("ACCEPTED");

        // Create blockchain contract on acceptance
        Contract contract = createBlockchainContract(
            order.getId(), "CROP_ORDER",
            order.getFarmerId(), order.getFarmerName() != null ? order.getFarmerName() : "Farmer",
            order.getBuyerId(), order.getBuyerName(),
            order.getCropName(), order.getQuantity(), order.getPrice()
        );
        order.setContractHash(contract.getBlockchainHash());
        order.setContractId(contract.getId());

        // Notify buyer that farmer accepted
        Notification notification = new Notification(
            order.getBuyerId(), order.getFarmerId(),
            "Farmer", "", "", "Farmer",
            "CROP_ORDER_FARMER_ACCEPTED",
            "Farmer has accepted your order for " + order.getCropName() + ". Contract stored on blockchain.",
            order.getCropName(), order.getQuantity(), order.getPrice()
        );
        notificationRepository.save(notification);

        return cropOrderRepository.save(order);
    }

    public CropOrder farmerRejectCropOrder(Long orderId, Long farmerId) {
        CropOrder order = cropOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Farmer mismatch");
        }
        order.setStatus("REJECTED");

        Notification notification = new Notification(
            order.getBuyerId(), order.getFarmerId(),
            "Farmer", "", "", "Farmer",
            "CROP_ORDER_FARMER_REJECTED",
            "Farmer has rejected your order for " + order.getCropName(),
            order.getCropName(), order.getQuantity(), order.getPrice()
        );
        notificationRepository.save(notification);

        return cropOrderRepository.save(order);
    }
    
    // ─── Admin Listing Verification ────────────────────────────────────
    
    public CropListing verifyCropListing(Long listingId, String status, String feedback) {
        CropListing listing = cropListingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setVerificationStatus(status);
        if (feedback != null && !feedback.trim().isEmpty()) {
            listing.setAdminFeedback(feedback);
        }
        
        Notification notification = new Notification(
            listing.getFarmerId(), 0L, "Admin", "", "", "Admin", "LISTING_VERIFICATION",
            "Your crop listing for " + listing.getCropName() + " has been " + status.toLowerCase(),
            listing.getCropName(), listing.getQuantity(), listing.getPricePerUnit()
        );
        notificationRepository.save(notification);
        
        return cropListingRepository.save(listing);
    }

    public CropOrder buyerAcceptCropOrder(Long orderId, Long buyerId) {
        CropOrder order = cropOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Buyer mismatch");
        }
        order.setBuyerAccepted(true);

        if (Boolean.TRUE.equals(order.getFarmerAccepted())) {
            order.setStatus("ACCEPTED");
        }

        Notification notification = new Notification(
            order.getFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "CROP_ORDER_BUYER_ACCEPTED",
            order.getBuyerName() + " accepted your offer to fulfill " + order.getCropName(),
            order.getCropName(), order.getQuantity(), order.getPrice()
        );
        notificationRepository.save(notification);

        return cropOrderRepository.save(order);
    }

    // ─── Payment Methods ────────────────────────────────────────────────

    public CropOrder payPartialPayment(Long orderId, PaymentRecord paymentDetails) {
        CropOrder order = cropOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        double advanceAmount = order.getPrice() * 0.5;
        order.setPartialPaymentDone(true);
        order.setAmountPaid(advanceAmount);
        order.setPartialPaymentDate(LocalDateTime.now()); // Set payment date

        // Mark the listing as sold
        try {
            CropListing listing = cropListingRepository.findById(order.getListingId()).orElse(null);
            if (listing != null) {
                listing.setIsSold(true);
                cropListingRepository.save(listing);
            }
        } catch (Exception e) { /* listing might not exist for demand orders */ }

        // Save payment record
        if (paymentDetails != null) {
            paymentDetails.setOrderId(orderId);
            paymentDetails.setOrderType("CROP_ORDER");
            paymentDetails.setContractId(order.getContractId());
            paymentDetails.setAmount(advanceAmount);
            paymentDetails.setPaymentType("ADVANCE_50");
            paymentDetails.setPaymentMethod("BANK_TRANSFER");
            paymentDetails.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            paymentRecordRepository.save(paymentDetails);
        }

        // Update contract
        if (order.getContractId() != null) {
            contractRepository.findById(order.getContractId()).ifPresent(contract -> {
                contract.setAdvancePaid(true);
                contract.setAdvanceAmount(advanceAmount);
                contract.setTotalPaid(advanceAmount);
                contract.setUpdatedAt(LocalDateTime.now());
                contractRepository.save(contract);
            });
        }

        // Notify farmer with deadline information
        double remainingAmount = order.getPrice() - advanceAmount;
        String deadlineMsg = String.format(
            "%s has paid 50%% advance (₹%.2f) for %s. Remaining payment (₹%.2f) must be paid by %s (4-day deadline). Dispatch produce immediately.",
            order.getBuyerName(), advanceAmount, order.getCropName(), remainingAmount,
            order.getPaymentDeadline().toString()
        );
        
        Notification notification = new Notification(
            order.getFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "ORDER_PARTIAL_PAYMENT",
            deadlineMsg,
            order.getCropName(), order.getQuantity(), advanceAmount
        );
        notificationRepository.save(notification);

        return cropOrderRepository.save(order);
    }

    public CropOrder completeFullOrder(Long orderId, PaymentRecord paymentDetails) {
        CropOrder order = cropOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        double remainingAmount = order.getPrice() - (order.getAmountPaid() != null ? order.getAmountPaid() : 0.0);
        order.setFullPaymentDone(true);
        order.setAmountPaid(order.getPrice());
        order.setStatus("COMPLETED");
        
        // Check if payment was made within the 4-day deadline
        LocalDateTime paymentTime = LocalDateTime.now();
        boolean paymentOnTime = paymentTime.isBefore(order.getPaymentDeadline());
        order.setDeliveryOnTime(paymentOnTime);

        // Save payment record
        if (paymentDetails != null) {
            paymentDetails.setOrderId(orderId);
            paymentDetails.setOrderType("CROP_ORDER");
            paymentDetails.setContractId(order.getContractId());
            paymentDetails.setAmount(remainingAmount);
            paymentDetails.setPaymentType("FULL_PAYMENT");
            paymentDetails.setPaymentMethod("BANK_TRANSFER");
            paymentDetails.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            paymentRecordRepository.save(paymentDetails);
        }

        // Update contract
        if (order.getContractId() != null) {
            contractRepository.findById(order.getContractId()).ifPresent(contract -> {
                contract.setFullPaid(true);
                contract.setTotalPaid(order.getPrice());
                contract.setStatus("COMPLETED");
                contract.setUpdatedAt(LocalDateTime.now());
                contractRepository.save(contract);
            });
        }

        String completionMsg = paymentOnTime 
            ? String.format("Order for %s completed successfully! Final payment of ₹%.2f received within deadline.", order.getCropName(), remainingAmount)
            : String.format("Order for %s completed. Final payment of ₹%.2f received AFTER deadline (charges may apply).", order.getCropName(), remainingAmount);

        Notification notification = new Notification(
            order.getFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "ORDER_COMPLETED",
            completionMsg,
            order.getCropName(), order.getQuantity(), order.getPrice()
        );
        notificationRepository.save(notification);

        return cropOrderRepository.save(order);
    }

    // ─── Farmer Bid Methods (Demand Fulfillment) ────────────────────────

    public FarmerBid createFarmerBid(FarmerBid bid) {
        FarmerBid saved = farmerBidRepository.save(bid);
        try {
            BuyerOrder order = buyerOrderRepository.findById(bid.getBuyerOrderId()).orElse(null);
            if (order != null) {
                Notification notification = new Notification(
                    order.getBuyerId(), bid.getFarmerId(),
                    bid.getFarmerName(), bid.getFarmerMobile(), bid.getFarmerEmail(),
                    "Farmer", "BID_PLACED",
                    bid.getFarmerName() + " placed an offer to fulfill your requirement for " + order.getCropName(),
                    order.getCropName(), order.getRequiredQuantity(), bid.getOfferedPrice()
                );
                notificationRepository.save(notification);
            }
        } catch (Exception e) { /* don't block bid creation */ }
        return saved;
    }

    public List<FarmerBid> getBidsForOrder(Long orderId) {
        return farmerBidRepository.findAllByBuyerOrderIdOrderByCreatedAtDesc(orderId);
    }

    public BuyerOrder acceptFarmerBid(Long bidId) {
        FarmerBid bid = farmerBidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        BuyerOrder order = buyerOrderRepository.findById(bid.getBuyerOrderId())
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        order.setStatus("ACCEPTED");
        order.setFulfilledByFarmerId(bid.getFarmerId());
        order.setFarmerName(bid.getFarmerName());
        order.setFarmerMobile(bid.getFarmerMobile());
        order.setFarmerEmail(bid.getFarmerEmail());
        
        if (bid.getSuppliedQuantity() != null && !bid.getSuppliedQuantity().trim().isEmpty()) {
            order.setRequiredQuantity(bid.getSuppliedQuantity());
        }
        if (bid.getOfferedPrice() != null) {
            order.setTargetPrice(bid.getOfferedPrice());
        }

        bid.setAccepted(true);
        farmerBidRepository.save(bid);

        // Create blockchain contract for demand fulfillment
        Contract contract = createBlockchainContract(
            order.getId(), "DEMAND_ORDER",
            bid.getFarmerId(), bid.getFarmerName(),
            order.getBuyerId(), order.getBuyerName(),
            order.getCropName(), order.getRequiredQuantity(), bid.getOfferedPrice()
        );
        order.setContractHash(contract.getBlockchainHash());
        order.setContractId(contract.getId());

        // Notify selected farmer
        Notification notification = new Notification(
            bid.getFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "BID_ACCEPTED",
            order.getBuyerName() + " accepted your offer for " + order.getCropName() + ". Contract stored on blockchain.",
            order.getCropName(), order.getRequiredQuantity(), bid.getOfferedPrice()
        );
        notificationRepository.save(notification);

        return buyerOrderRepository.save(order);
    }

    // ─── Demand Payment Methods ─────────────────────────────────────────

    public BuyerOrder payDemandAdvance(Long orderId, PaymentRecord paymentDetails) {
        BuyerOrder order = buyerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        double advanceAmount = order.getTargetPrice() * 0.5;
        order.setPartialPaymentDone(true);
        order.setAmountPaid(advanceAmount);

        if (paymentDetails != null) {
            paymentDetails.setOrderId(orderId);
            paymentDetails.setOrderType("DEMAND_ORDER");
            paymentDetails.setContractId(order.getContractId());
            paymentDetails.setAmount(advanceAmount);
            paymentDetails.setPaymentType("ADVANCE_50");
            paymentDetails.setPaymentMethod("BANK_TRANSFER");
            paymentDetails.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            paymentRecordRepository.save(paymentDetails);
        }

        if (order.getContractId() != null) {
            contractRepository.findById(order.getContractId()).ifPresent(contract -> {
                contract.setAdvancePaid(true);
                contract.setAdvanceAmount(advanceAmount);
                contract.setTotalPaid(advanceAmount);
                contract.setUpdatedAt(LocalDateTime.now());
                contractRepository.save(contract);
            });
        }

        Notification notification = new Notification(
            order.getFulfilledByFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "DEMAND_PARTIAL_PAYMENT",
            order.getBuyerName() + " has paid 50% advance for " + order.getCropName(),
            order.getCropName(), order.getRequiredQuantity(), advanceAmount
        );
        notificationRepository.save(notification);

        return buyerOrderRepository.save(order);
    }

    public BuyerOrder completeDemandPayment(Long orderId, PaymentRecord paymentDetails) {
        BuyerOrder order = buyerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        double totalPrice = order.getTargetPrice();
        double remaining = totalPrice - (order.getAmountPaid() != null ? order.getAmountPaid() : 0.0);
        order.setFullPaymentDone(true);
        order.setAmountPaid(totalPrice);
        order.setStatus("COMPLETED");

        if (paymentDetails != null) {
            paymentDetails.setOrderId(orderId);
            paymentDetails.setOrderType("DEMAND_ORDER");
            paymentDetails.setContractId(order.getContractId());
            paymentDetails.setAmount(remaining);
            paymentDetails.setPaymentType("FULL_PAYMENT");
            paymentDetails.setPaymentMethod("BANK_TRANSFER");
            paymentDetails.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            paymentRecordRepository.save(paymentDetails);
        }

        if (order.getContractId() != null) {
            contractRepository.findById(order.getContractId()).ifPresent(contract -> {
                contract.setFullPaid(true);
                contract.setTotalPaid(totalPrice);
                contract.setStatus("COMPLETED");
                contract.setUpdatedAt(LocalDateTime.now());
                contractRepository.save(contract);
            });
        }

        Notification notification = new Notification(
            order.getFulfilledByFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "DEMAND_COMPLETED",
            "Demand for " + order.getCropName() + " has been fully paid and completed",
            order.getCropName(), order.getRequiredQuantity(), totalPrice
        );
        notificationRepository.save(notification);

        return buyerOrderRepository.save(order);
    }

    // Legacy methods kept for backward compat
    public BuyerOrder fulfillBuyerOrder(Long orderId, Long farmerId, String name, String mobile, String email) {
        BuyerOrder order = buyerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        order.setStatus("FULFILLED");
        order.setFulfilledByFarmerId(farmerId);
        order.setFarmerName(name);
        order.setFarmerMobile(mobile);
        order.setFarmerEmail(email);

        Notification notification = new Notification(
            order.getBuyerId(), farmerId, name, mobile, email,
            "Farmer", "REQUIREMENT_FULFILLED",
            name + " has offered to fulfill your requirement for " + order.getCropName(),
            order.getCropName(), order.getRequiredQuantity(), order.getTargetPrice()
        );
        notificationRepository.save(notification);

        return buyerOrderRepository.save(order);
    }

    public BuyerOrder acceptBuyerFulfillment(Long orderId) {
        BuyerOrder order = buyerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));
        order.setStatus("ACCEPTED");

        Notification notification = new Notification(
            order.getFulfilledByFarmerId(), order.getBuyerId(),
            order.getBuyerName(), order.getBuyerMobile(), order.getBuyerEmail(),
            "Buyer", "FULFILLMENT_ACCEPTED",
            order.getBuyerName() + " accepted your fulfillment for " + order.getCropName(),
            order.getCropName(), order.getRequiredQuantity(), order.getTargetPrice()
        );
        notificationRepository.save(notification);

        return buyerOrderRepository.save(order);
    }

    // ─── Blockchain Contract Creation ───────────────────────────────────

    private Contract createBlockchainContract(Long orderId, String orderType,
                                              Long farmerId, String farmerName,
                                              Long buyerId, String buyerName,
                                              String cropName, String quantity, Double price) {
        Contract contract = new Contract();
        contract.setOrderId(orderId);
        contract.setOrderType(orderType);
        contract.setFarmerId(farmerId);
        contract.setFarmerName(farmerName);
        contract.setBuyerId(buyerId);
        contract.setBuyerName(buyerName);
        contract.setCropName(cropName);
        contract.setQuantity(quantity);
        contract.setAgreedPrice(price);

        // Mine block on blockchain
        contract = blockchainService.mineBlock(contract);

        return contractRepository.save(contract);
    }

    // ─── Contract Query Methods ───────────────────────────────────────

    public Contract getContractById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
    }

    public List<Contract> getContractsByFarmerId(Long farmerId) {
        return contractRepository.findAllByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<Contract> getContractsByBuyerId(Long buyerId) {
        return contractRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<Contract> getAllContracts() {
        return contractRepository.findAllByOrderByCreatedAtDesc();
    }

    // ─── Payment Query Methods ──────────────────────────────────────────

    public List<PaymentRecord> getPaymentsByPayerId(Long payerId) {
        return paymentRecordRepository.findAllByPayerIdOrderByCreatedAtDesc(payerId);
    }

    public List<PaymentRecord> getPaymentsByPayeeId(Long payeeId) {
        return paymentRecordRepository.findAllByPayeeIdOrderByCreatedAtDesc(payeeId);
    }

    public List<PaymentRecord> getPendingPayments() {
        return paymentRecordRepository.findAllByVerificationStatusOrderByCreatedAtDesc("PENDING");
    }

    public List<PaymentRecord> getAllPayments() {
        return paymentRecordRepository.findAllByOrderByCreatedAtDesc();
    }

    public PaymentRecord verifyPayment(Long paymentId, String status, String adminNote) {
        PaymentRecord payment = paymentRecordRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setVerificationStatus(status);
        payment.setAdminNote(adminNote);
        payment.setVerifiedAt(LocalDateTime.now());
        return paymentRecordRepository.save(payment);
    }
}
