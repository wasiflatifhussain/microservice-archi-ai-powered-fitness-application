package com.fitness.user_service.client;

import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminClient {

  @Value("${keycloak.admin.realm}")
  private String realm;

  private final Keycloak keycloak;

  public String createUser(String email, String password, String firstName, String lastName) {
    UserRepresentation user = new UserRepresentation();
    user.setUsername(email);
    user.setEmail(email);
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setEnabled(true);
    user.setEmailVerified(true);

    // Create user on keycloak
    Response response = keycloak.realm(realm).users().create(user);
    String userId = CreatedResponseUtil.getCreatedId(response);

    // Set password
    CredentialRepresentation credential = new CredentialRepresentation();
    credential.setType(CredentialRepresentation.PASSWORD);
    credential.setValue(password);
    credential.setTemporary(false);

    keycloak.realm(realm).users().get(userId).resetPassword(credential);
    log.info("Successfully created user in Keycloak: userId={}, email={}", userId, email);
    return userId;
  }

  public void deleteUser(String userId) {
    log.info("Attempting to delete user from Keycloak: userId={}", userId);
    try {
      keycloak.realm(realm).users().get(userId).remove();
      log.info("Successfully deleted user from Keycloak: userId={}", userId);
    } catch (Exception e) {
      log.error("Failed to delete user from Keycloak: userId={}", userId, e);
    }
  }
}
