package com.fitness.ai_service.service;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.ai_service.client.gemini.GeminiClient;
import com.fitness.ai_service.dto.ActivityObject;
import com.fitness.ai_service.exception.RecommendationGenerationException;
import com.fitness.ai_service.model.Recommendation;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@Slf4j
@RequiredArgsConstructor
public class AICallerService {
  private final GeminiClient geminiClient;
  private final ObjectMapper objectMapper;

  //  NOTE: It is unfeasible to do infinite retries for failures due to API cost limitations. Hence,
  // we implement a max 3 retries with exponential backoff.
  @Retryable(
      retryFor = {WebClientResponseException.class, RuntimeException.class},
      noRetryFor = {IllegalArgumentException.class, JsonParseException.class},
      maxAttempts = 3,
      backoff = @Backoff(delay = 1000, multiplier = 2, maxDelay = 15000))
  public Recommendation generateRecommendation(ActivityObject activity) {
    log.info("Generating recommendation for activity={}", activity.getId());

    try {
      String prompt = createPromptForActivity(activity);
      String aiResponse = geminiClient.getAnswer(prompt);
      Recommendation recommendation = parseGeminiResponse(aiResponse, activity);

      log.info("Successfully generated recommendation for activity={}", activity.getId());
      return recommendation;
    } catch (Exception e) {
      log.error(
          "Error generating recommendation for activity={}: {}", activity.getId(), e.getMessage());
      throw e; // Let @Retryable handle the retry
    }
  }

  @Recover
  public Recommendation recoverFromFailure(Exception ex, ActivityObject activity) {
    log.error("All retry attempts failed for activity={}: {}", activity.getId(), ex.getMessage());
    throw new RecommendationGenerationException(
        "Failed to generate recommendation after all retries for activity=" + activity.getId(), ex);
  }

  private Recommendation parseGeminiResponse(String geminiResponse, ActivityObject activity) {
    try {
      JsonNode root = objectMapper.readTree(geminiResponse);
      JsonNode candidates = root.get("candidates");

      if (candidates != null && candidates.isArray() && candidates.size() > 0) {
        JsonNode content = candidates.get(0).get("content");
        JsonNode parts = content.get("parts");

        if (parts != null && parts.isArray() && parts.size() > 0) {
          String textContent = parts.get(0).get("text").asText();
          String jsonContent = extractJsonFromMarkdown(textContent);
          JsonNode analysisData = objectMapper.readTree(jsonContent);

          return Recommendation.builder()
              .activityId(activity.getId())
              .keycloakId(activity.getKeycloakId())
              .type(activity.getType())
              .recommendation(extractRecommendation(analysisData))
              .improvements(extractImprovements(analysisData))
              .suggestions(extractSuggestions(analysisData))
              .safety(extractSafety(analysisData))
              .build();
        }
      }

      throw new IllegalStateException("Invalid Gemini response format");

    } catch (Exception e) {
      log.error("Error parsing Gemini response", e);
      throw new IllegalStateException("Failed to parse AI response", e);
    }
  }

  private String extractJsonFromMarkdown(String text) {
    // Remove markdown code block markers
    String cleaned = text.trim();

    // Check if it starts with ```json and ends with ```
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7); // Remove ```json
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3); // Remove ```
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length() - 3); // Remove trailing ```
    }

    return cleaned.trim();
  }

  private String extractRecommendation(JsonNode analysisData) {
    try {
      JsonNode analysis = analysisData.get("analysis");
      if (analysis != null && analysis.has("overall")) {
        String recommendation = analysis.get("overall").asText();
        return recommendation != null && !recommendation.trim().isEmpty()
            ? recommendation
            : "No detailed analysis provided";
      }
    } catch (Exception e) {
      log.warn("Failed to extract recommendation: {}", e.getMessage());
    }
    return "No detailed analysis provided";
  }

  private List<String> extractImprovements(JsonNode analysisData) {
    try {
      JsonNode improvements = analysisData.get("improvements");
      List<String> result = extractStringList(improvements, "recommendation");

      if (result == null || result.isEmpty()) {
        return List.of("No improvements suggested");
      }

      // Filter out empty strings
      List<String> filtered =
          result.stream().filter(s -> s != null && !s.trim().isEmpty()).toList();

      return filtered.isEmpty() ? List.of("No improvements suggested") : filtered;

    } catch (Exception e) {
      log.warn("Failed to extract improvements: {}", e.getMessage());
      return List.of("No improvements suggested");
    }
  }

  private List<String> extractSuggestions(JsonNode analysisData) {
    try {
      JsonNode suggestions = analysisData.get("suggestions");
      List<String> result = extractStringList(suggestions, "description");

      if (result == null || result.isEmpty()) {
        return List.of("No workout suggestions provided");
      }

      // Filter out empty strings
      List<String> filtered =
          result.stream().filter(s -> s != null && !s.trim().isEmpty()).toList();

      return filtered.isEmpty() ? List.of("No workout suggestions provided") : filtered;

    } catch (Exception e) {
      log.warn("Failed to extract suggestions: {}", e.getMessage());
      return List.of("No workout suggestions provided");
    }
  }

  private List<String> extractSafety(JsonNode analysisData) {
    try {
      JsonNode safety = analysisData.get("safety");
      List<String> result = extractStringArray(safety);

      if (result == null || result.isEmpty()) {
        return List.of("Follow general safety guidelines for your activity type");
      }

      // Filter out empty strings
      List<String> filtered =
          result.stream().filter(s -> s != null && !s.trim().isEmpty()).toList();

      return filtered.isEmpty()
          ? List.of("Follow general safety guidelines for your activity type")
          : filtered;

    } catch (Exception e) {
      log.warn("Failed to extract safety guidelines: {}", e.getMessage());
      return List.of("Follow general safety guidelines for your activity type");
    }
  }

  private List<String> extractStringList(JsonNode arrayNode, String fieldName) {
    List<String> result = new ArrayList<>();
    if (arrayNode != null && arrayNode.isArray()) {
      for (JsonNode item : arrayNode) {
        if (item.has(fieldName)) {
          String value = item.get(fieldName).asText();
          if (value != null && !value.trim().isEmpty()) {
            result.add(value);
          }
        }
      }
    }
    return result;
  }

  private List<String> extractStringArray(JsonNode arrayNode) {
    List<String> result = new ArrayList<>();
    if (arrayNode != null && arrayNode.isArray()) {
      for (JsonNode item : arrayNode) {
        String value = item.asText();
        if (value != null && !value.trim().isEmpty()) {
          result.add(value);
        }
      }
    }
    return result;
  }

  private String createPromptForActivity(ActivityObject activity) {
    return String.format(
        """
        Analyze this fitness activity and provide detailed recommendations in the following EXACT JSON format:
        {
          "analysis": {
            "overall": "Overall analysis here",
            "pace": "Pace analysis here",
            "heartRate": "Heart rate analysis here",
            "caloriesBurned": "Calories analysis here"
          },
          "improvements": [
            {
              "area": "Area name",
              "recommendation": "Detailed recommendation"
            }
          ],
          "suggestions": [
            {
              "workout": "Workout name",
              "description": "Detailed workout description"
            }
          ],
          "safety": [
            "Safety point 1",
            "Safety point 2"
          ]
        }

        Analyze this activity:
        Activity Type: %s
        Duration: %d minutes
        Calories Burned: %d
        Additional Metrics: %s

        Provide detailed analysis focusing on performance, improvements, next workout suggestions, and safety guidelines.
        Ensure the response follows the EXACT JSON format shown above.
        """,
        activity.getType().name(),
        activity.getDuration(),
        activity.getCaloriesBurned(),
        activity.getAdditionalMetrics());
  }
}
