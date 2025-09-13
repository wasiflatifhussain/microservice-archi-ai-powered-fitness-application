package com.fitness.user_service.service;

import com.fitness.user_service.dto.RegisterRequest;
import com.fitness.user_service.dto.UserResponse;
import com.fitness.user_service.model.User;
import com.fitness.user_service.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class UserService {
  private final UserRepository userRepository;

  public UserResponse register(@Valid RegisterRequest request) {
    log.info("Starting user registration process for email={}", request.getEmail());

    if (userRepository.existsByEmail(request.getEmail())) {
      log.warn("Registration failed - email already exists: email={}", request.getEmail());
      throw new RuntimeException("Email already exists.");
    }

    User user =
        User.builder()
            .email(request.getEmail())
            .password(request.getPassword())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .build();

    try {
      User savedUser = userRepository.save(user);
      log.info(
          "User registration successful: userId={}, email={}",
          savedUser.getId(),
          savedUser.getEmail());
      return mapToUserResponse(savedUser);
    } catch (Exception e) {
      log.error("Failed to save user during registration: email={}", request.getEmail(), e);
      throw new RuntimeException("Registration failed. Please try again.", e);
    }
  }

  public UserResponse getUserProfile(String userId) {
    log.info("Retrieving user profile for userId={}", userId);

    try {
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(
                  () -> {
                    log.warn("User profile not found: userId={}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                  });

      log.info(
          "Successfully retrieved user profile: userId={}, email={}",
          user.getId(),
          user.getEmail());
      return mapToUserResponse(user);
    } catch (Exception e) {
      if (e.getMessage().contains("User not found")) {
        throw e; // Re-throw user not found exception
      }
      log.error("Unexpected error retrieving user profile: userId={}", userId, e);
      throw new RuntimeException("Failed to retrieve user profile", e);
    }
  }

  private UserResponse mapToUserResponse(User user) {
    log.info("Mapping user entity to response: userId={}", user.getId());
    return UserResponse.builder()
        .id(user.getId())
        .email(user.getEmail())
        .firstName(user.getFirstName())
        .lastName(user.getLastName())
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }

  public Boolean existByUserId(String userId) {
    log.info("Checking if user exists: userId={}", userId);

    try {
      Boolean exists = userRepository.existsById(userId);
      log.info("User existence check result: userId={}, exists={}", userId, exists);
      return exists;
    } catch (Exception e) {
      log.error("Error checking user existence: userId={}", userId, e);
      return false;
    }
  }
}
