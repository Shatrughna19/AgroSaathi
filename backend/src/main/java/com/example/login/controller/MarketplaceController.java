package com.example.login.controller;

import com.example.login.model.BuyerOrder;
import com.example.login.model.CropListing;
import com.example.login.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173") // Vite default port
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @PostMapping("/listings")
    public ResponseEntity<CropListing> createListing(@RequestBody CropListing listing) {
        return ResponseEntity.ok(marketplaceService.createCropListing(listing));
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
}
