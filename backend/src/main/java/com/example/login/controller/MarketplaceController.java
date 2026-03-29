package com.example.login.controller;

import com.example.login.model.BuyerOrder;
import com.example.login.model.CropListing;
import com.example.login.model.FertilizerListing;
import com.example.login.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173") // Vite default port
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
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

    @PostMapping("/orders")
    public ResponseEntity<BuyerOrder> createOrder(@RequestBody BuyerOrder order) {
        return ResponseEntity.ok(marketplaceService.createBuyerOrder(order));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<BuyerOrder>> getAllOrders() {
        return ResponseEntity.ok(marketplaceService.getAllBuyerOrders());
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
}
