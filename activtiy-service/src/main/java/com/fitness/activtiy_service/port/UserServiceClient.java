package com.fitness.activtiy_service.port;

import reactor.core.publisher.Mono;

public interface UserServiceClient {
  Mono<Boolean> validateUser(String userId);
}
