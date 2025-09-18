package com.fitness.user_service.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakAdminConfig {

  @Value("${keycloak.admin.server-url}")
  private String serverUrl;

  @Value("${keycloak.admin.realm}")
  private String realm;

  @Value("${keycloak.admin.client-id}")
  private String clientId;

  @Value("${keycloak.admin.client-secret}")
  private String clientSecret;

  @Value("${keycloak.admin.grant-type}")
  private String grantType;

  @Bean
  public Keycloak keycloak() {
    return KeycloakBuilder.builder()
        .serverUrl(serverUrl)
        .realm(realm)
        .grantType(grantType)
        .clientId(clientId)
        .clientSecret(clientSecret)
        .build();
  }
}
