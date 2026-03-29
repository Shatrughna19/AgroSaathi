package com.example.login.service;

import com.example.login.model.BuyerOrder;
import com.example.login.model.CropListing;
import com.example.login.model.FertilizerListing;
import com.example.login.repository.BuyerOrderRepository;
import com.example.login.repository.CropListingRepository;
import com.example.login.repository.FertilizerListingRepository;
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

    public MarketplaceService(
            CropListingRepository cropListingRepository, 
            BuyerOrderRepository buyerOrderRepository,
            FertilizerListingRepository fertilizerListingRepository) {
        this.cropListingRepository = cropListingRepository;
        this.buyerOrderRepository = buyerOrderRepository;
        this.fertilizerListingRepository = fertilizerListingRepository;
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
}
