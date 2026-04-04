package com.example.login.controller;

import com.example.login.model.User;
import com.example.login.service.UserService;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Vite default port
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User saved = userService.register(user);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    public static class LoginRequest {
        private String aadharno;
        private String password;

        public String getAadharno() {
            return aadharno;
        }

        public void setAadharno(String aadharno) {
            this.aadharno = aadharno;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.loginWithAadhar(loginRequest.getAadharno(), loginRequest.getPassword());
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("mobile", user.getMobile());
            userMap.put("email", user.getEmail());
            userMap.put("aadharno", user.getAadharno());
            userMap.put("role", user.getRole());
            userMap.put("address", user.getAddress());
            userMap.put("cropsGrown", user.getCropsGrown());
            userMap.put("season", user.getSeason());
            userMap.put("profilePhoto", user.getProfilePhoto());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("user", userMap);

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User user = userService.updateUser(id, updatedUser);
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("mobile", user.getMobile());
            userMap.put("email", user.getEmail());
            userMap.put("aadharno", user.getAadharno());
            userMap.put("role", user.getRole());
            userMap.put("address", user.getAddress());
            userMap.put("cropsGrown", user.getCropsGrown());
            userMap.put("season", user.getSeason());
            userMap.put("profilePhoto", user.getProfilePhoto());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", userMap);

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping(value = "/{id}/photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestPart(value = "image") MultipartFile image) {
        try {
            User user = userService.uploadProfilePhoto(id, image);
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("mobile", user.getMobile());
            userMap.put("email", user.getEmail());
            userMap.put("aadharno", user.getAadharno());
            userMap.put("role", user.getRole());
            userMap.put("address", user.getAddress());
            userMap.put("cropsGrown", user.getCropsGrown());
            userMap.put("season", user.getSeason());
            userMap.put("profilePhoto", user.getProfilePhoto());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile photo updated successfully");
            response.put("user", userMap);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String errorMessage = error.getDefaultMessage();
            errors.put("message", errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }
}
