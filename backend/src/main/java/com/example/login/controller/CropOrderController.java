package com.example.login.controller;

import com.example.login.model.CropOrder;
import com.example.login.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crop-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class CropOrderController {

    private final MarketplaceService marketplaceService;

    public CropOrderController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @PutMapping("/{id}/farmer/accept")
    public ResponseEntity<CropOrder> farmerAccept(@PathVariable Long id, @RequestParam Long farmerId) {
        return ResponseEntity.ok(marketplaceService.farmerAcceptCropOrder(id, farmerId));
    }

    @PutMapping("/{id}/buyer/accept")
    public ResponseEntity<CropOrder> buyerAccept(@PathVariable Long id, @RequestParam Long buyerId) {
        return ResponseEntity.ok(marketplaceService.buyerAcceptCropOrder(id, buyerId));
    }
}
