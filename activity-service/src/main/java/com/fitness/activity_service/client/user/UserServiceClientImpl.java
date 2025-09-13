package com.fitness.activity_service.client.user;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@AllArgsConstructor
public class UserServiceClientImpl implements UserServiceClient {

  private final WebClient userServiceWebClient;

  @Override
  public Mono<Boolean> validateUser(String userId) {
    log.info("Entering validateUser method in UserServiceClientAdapter");
    try {
      log.info("Validating user with ID: " + userId);
      return userServiceWebClient
          .get()
          .uri("/api/users/{userId}/validate", userId)
          .retrieve()
          .bodyToMono(Boolean.class)
          .onErrorReturn(false);
    } catch (Exception e) {
      log.error("Logging failed: " + e.getMessage());
      return Mono.just(false);
    }
  }
}
