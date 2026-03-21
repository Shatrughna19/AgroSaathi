package com.example.login.controller;

import com.example.login.model.User;
import com.example.login.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", ex.getMessage())
            );
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
            return ResponseEntity.ok(
                    java.util.Map.of(
                            "message", "Login successful",
                            "user", java.util.Map.of(
                                    "id", user.getId(),
                                    "name", user.getName(),
                                    "mobile", user.getMobile(),
                                    "email", user.getEmail(),
                                    "aadharno", user.getAadharno(),
                                    "role", user.getRole()
                            )
                    )
            );
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", ex.getMessage())
            );
        }
    }
}

