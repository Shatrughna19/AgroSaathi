package com.example.login.service;

import com.example.login.model.Officer;
import com.example.login.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class OfficerService {

    @Autowired
    private OfficerRepository officerRepository;

    /**
     * Generate a unique 4-digit Officer ID
     */
    private String generateUniqueOfficerId() {
        Random random = new Random();
        String officerId;
        
        // Generate unique 4-digit ID (1000-9999)
        do {
            int id = 1000 + random.nextInt(9000);
            officerId = String.valueOf(id);
        } while (officerRepository.findByOfficerId(officerId).isPresent());
        
        return officerId;
    }

    /**
     * Register a new officer
     */
    public Officer registerOfficer(String name, String email, String password, String designation, String phone) throws Exception {
        // Check if email already exists
        if (officerRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already registered");
        }

        // Generate unique Officer ID
        String officerId = generateUniqueOfficerId();

        // Create new officer
        Officer officer = new Officer(officerId, name, email, password, designation, phone);
        
        return officerRepository.save(officer);
    }

    /**
     * Login officer
     */
    public Officer loginOfficer(String officerId, String password) throws Exception {
        Optional<Officer> officer = officerRepository.findByOfficerId(officerId);
        
        if (!officer.isPresent()) {
            throw new Exception("Officer not found");
        }

        Officer foundOfficer = officer.get();
        
        // In production, use proper password hashing (e.g., BCrypt)
        if (!foundOfficer.getPassword().equals(password)) {
            throw new Exception("Invalid password");
        }

        return foundOfficer;
    }

    /**
     * Get officer by Officer ID
     */
    public Optional<Officer> getOfficerById(String officerId) {
        return officerRepository.findByOfficerId(officerId);
    }

    /**
     * Get officer by Email
     */
    public Optional<Officer> getOfficerByEmail(String email) {
        return officerRepository.findByEmail(email);
    }
}
