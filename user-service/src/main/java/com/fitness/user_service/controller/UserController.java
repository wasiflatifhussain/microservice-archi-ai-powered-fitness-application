package com.fitness.user_service.controller;

import com.fitness.user_service.dto.RegisterRequest;
import com.fitness.user_service.dto.UserResponse;
import com.fitness.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

  private UserService userService;

  @GetMapping("/{userId}")
  public ResponseEntity<UserResponse> getUserProfile(@PathVariable String userId) {
    return ResponseEntity.ok(userService.getUserProfile(userId));
  }

  @PostMapping("/register")
  public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(userService.register(request));
  }
}
