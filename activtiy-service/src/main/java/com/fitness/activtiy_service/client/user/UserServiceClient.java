package com.fitness.activtiy_service.client.user;

import reactor.core.publisher.Mono;

public interface UserServiceClient {
  Mono<Boolean> validateUser(String userId);
}
