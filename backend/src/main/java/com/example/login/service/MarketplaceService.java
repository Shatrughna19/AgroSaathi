package com.example.login.service;

import com.example.login.model.BuyerOrder;
import com.example.login.model.CropListing;
import com.example.login.repository.BuyerOrderRepository;
import com.example.login.repository.CropListingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarketplaceService {

    private final CropListingRepository cropListingRepository;
    private final BuyerOrderRepository buyerOrderRepository;

    public MarketplaceService(CropListingRepository cropListingRepository, BuyerOrderRepository buyerOrderRepository) {
        this.cropListingRepository = cropListingRepository;
        this.buyerOrderRepository = buyerOrderRepository;
    }

    public CropListing createCropListing(CropListing listing) {
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
}
