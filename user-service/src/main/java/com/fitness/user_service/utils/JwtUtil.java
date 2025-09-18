package com.fitness.user_service.utils;

import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JwtUtil {

  public String extractKeycloakId(String token) {
    try {
      // Remove "Bearer " prefix if present
      if (token.startsWith("Bearer ")) {
        token = token.substring(7);
      }

      // Parse JWT without signature verification (since we trust API Gateway)
      String[] chunks = token.split("\\.");
      Base64.Decoder decoder = Base64.getUrlDecoder();

      String payload = new String(decoder.decode(chunks[1]));
      log.info("JWT Payload: {}", payload);

      // Parse as JSON to extract 'sub' claim
      // You can use Jackson ObjectMapper for this
      return extractSubFromPayload(payload);

    } catch (Exception e) {
      log.error("Failed to extract Keycloak ID from JWT", e);
      return null;
    }
  }

  private String extractSubFromPayload(String payload) {
    // Simple regex to extract 'sub' value
    // In production, use proper JSON parsing
    try {
      String[] parts = payload.split("\"sub\":");
      if (parts.length > 1) {
        String subPart = parts[1].trim();
        // Extract value between quotes
        int start = subPart.indexOf("\"") + 1;
        int end = subPart.indexOf("\"", start);
        return subPart.substring(start, end);
      }
    } catch (Exception e) {
      log.error("Failed to parse sub from payload", e);
    }
    return null;
  }
}
