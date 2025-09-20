package com.fitness.user_service.service;

import com.fitness.user_service.client.KeycloakAdminClient;
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
  private final KeycloakAdminClient keycloakAdminClient;

  public UserResponse register(@Valid RegisterRequest request) {
    log.info("Starting user registration process for email={}", request.getEmail());

    if (userRepository.existsByEmail(request.getEmail())) {
      log.error("Registration failed - email already exists: email={}", request.getEmail());
      throw new RuntimeException("User with email already exists");
    }

    String keycloakId =
        keycloakAdminClient.createUser(
            request.getEmail(),
            request.getPassword(),
            request.getFirstName(),
            request.getLastName());

    User user =
        User.builder()
            .email(request.getEmail())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .keycloakId(keycloakId)
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
      keycloakAdminClient.deleteUser(keycloakId);
      throw new RuntimeException("Registration failed. Please try again.", e);
    }
  }

  public UserResponse getUserProfile(String keycloakId) {
    log.info("Retrieving user profile for keycloakId={}", keycloakId);

    try {
      User user = userRepository.findByKeycloakId(keycloakId).orElse(null);

      if (user == null) {
        log.error("User profile not found: keycloakId={}", keycloakId);
        // return an empty user
        return new UserResponse();
      }

      log.info(
          "Successfully retrieved user profile: keycloakId={}, email={}",
          user.getId(),
          user.getEmail());
      return mapToUserResponse(user);
    } catch (Exception e) {
      log.error("Database error retrieving user profile: keycloakId={}", keycloakId, e);
      throw new RuntimeException("Failed to retrieve user profile due to system error", e);
    }
  }

  public Boolean existByKeycloakId(String keycloakId) {
    log.info("Checking if user exists: keycloakId={}", keycloakId);

    try {
      Boolean exists = userRepository.existsByKeycloakId(keycloakId);
      log.info("User existence check result: keycloakId={}, exists={}", keycloakId, exists);
      return exists;
    } catch (Exception e) {
      log.error("Error checking user existence: keycloakId={}", keycloakId, e);
      return false;
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
        .keycloakId(user.getKeycloakId())
        .build();
  }
}
