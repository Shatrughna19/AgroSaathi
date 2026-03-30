package com.example.login.controller;

import com.example.login.model.Officer;
import com.example.login.service.OfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/officers")
@CrossOrigin(origins = "*")
public class OfficerController {

    @Autowired
    private OfficerService officerService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");
            String designation = request.get("designation");
            String phone = request.get("phone");

            // Validation
            if (name == null || email == null || password == null || phone == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "All fields are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (password.length() < 6) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Password must be at least 6 characters");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Officer officer = officerService.registerOfficer(name, email, password, designation != null ? designation : "", phone);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("officerId", officer.getOfficerId());
            response.put("name", officer.getName());
            response.put("email", officer.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String officerId = request.get("officerId");
            String password = request.get("password");

            if (officerId == null || password == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Officer ID and password are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Officer officer = officerService.loginOfficer(officerId, password);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("officerId", officer.getOfficerId());
            response.put("name", officer.getName());
            response.put("email", officer.getEmail());
            response.put("designation", officer.getDesignation());
            response.put("phone", officer.getPhone());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{officerId}")
    public ResponseEntity<?> getOfficer(@PathVariable String officerId) {
        try {
            Optional<Officer> officer = officerService.getOfficerById(officerId);

            if (!officer.isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Officer not found");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(officer.get());

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
