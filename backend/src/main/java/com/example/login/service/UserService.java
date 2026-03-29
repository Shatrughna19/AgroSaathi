package com.example.login.service;

import com.example.login.model.User;
import com.example.login.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
