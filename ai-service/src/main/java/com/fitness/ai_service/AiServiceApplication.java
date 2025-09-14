package com.fitness.ai_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class AiServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(AiServiceApplication.class, args);
  }
}
