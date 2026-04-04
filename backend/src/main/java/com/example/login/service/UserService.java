package com.example.login.service;

import com.example.login.model.User;
import com.example.login.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        userRepository.findByEmail(user.getEmail()).ifPresent(existing -> {
            throw new RuntimeException("Email already registered");
        });
        userRepository.findByAadharno(user.getAadharno()).ifPresent(existing -> {
            throw new RuntimeException("Aadhar number already registered");
        });
        // NOTE: For real apps, hash the password before saving.
        return userRepository.save(user);
    }

    public User loginWithAadhar(String aadharno, String password) {
        User user = userRepository.findByAadharno(aadharno)
                .orElseThrow(() -> new RuntimeException("User not found for given Aadhar number"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }

    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getName() != null && !updatedUser.getName().isEmpty())
            existingUser.setName(updatedUser.getName());
        if (updatedUser.getMobile() != null && !updatedUser.getMobile().isEmpty())
            existingUser.setMobile(updatedUser.getMobile());
        existingUser.setAddress(updatedUser.getAddress());
        existingUser.setCropsGrown(updatedUser.getCropsGrown());
        existingUser.setSeason(updatedUser.getSeason());

        return userRepository.save(existingUser);
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

    public User uploadProfilePhoto(Long userId, MultipartFile image) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String url = saveImage(image);
        if (url != null) {
            user.setProfilePhoto(url);
            return userRepository.save(user);
        }
        return user;
    }
}
