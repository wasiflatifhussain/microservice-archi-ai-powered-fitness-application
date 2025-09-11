package com.fitness.activity_service.client.user;

import reactor.core.publisher.Mono;

public interface UserServiceClient {
  Mono<Boolean> validateUser(String userId);
}
