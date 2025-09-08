package com.fitness.activtiy_service.adapter;

import com.fitness.activtiy_service.port.UserServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class UserServiceClientAdapter implements UserServiceClient {

  private final WebClient userServiceWebClient;

  public UserServiceClientAdapter(WebClient userServiceWebClient) {
    this.userServiceWebClient = userServiceWebClient;
  }

  @Override
  public Mono<Boolean> validateUser(String userId) {

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
