package com.fitness.ai_service.client.gemini;

import com.fitness.ai_service.dto.GeminiRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@Slf4j
public class GeminiClient {
  private final WebClient webClient;

  @Value("${gemini.api.key}")
  private String apiKey;

  @Value("${gemini.api.url}")
  private String apiUrl;

  public GeminiClient(WebClient.Builder webClientBuilder) {
    this.webClient = webClientBuilder.build();
  }

  public String getAnswer(String question) {
    GeminiRequest request = GeminiRequest.fromText(question);

    log.info("Sending request to Gemini API");
    try {
      String response =
          webClient
              .post()
              .uri(apiUrl)
              .header("x-goog-api-key", apiKey)
              .header("Content-Type", "application/json")
              .bodyValue(request)
              .retrieve()
              .bodyToMono(String.class)
              .block();
      log.info("Received response from Gemini API={}", response);
      return response;
    } catch (Exception e) {
      log.error("Error while calling Gemini API", e);
      throw new IllegalStateException("Failed to get answer from Gemini API", e);
    }
  }
}
