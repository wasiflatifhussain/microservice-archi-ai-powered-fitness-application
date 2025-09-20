package com.fitness.user_service.controller;

import com.fitness.user_service.dto.RegisterRequest;
import com.fitness.user_service.dto.UserResponse;
import com.fitness.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
@Slf4j
public class UserController {

  private final UserService userService;

  @PostMapping("/register")
  public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(userService.register(request));
  }

  @GetMapping("/{keycloakId}")
  public ResponseEntity<UserResponse> getUserProfile(@PathVariable String keycloakId) {
    return ResponseEntity.ok(userService.getUserProfile(keycloakId));
  }

  @GetMapping("/{keycloakId}/validate")
  public ResponseEntity<Boolean> validateUser(@PathVariable String keycloakId) {
    return ResponseEntity.ok(userService.existByKeycloakId(keycloakId));
  }
}
