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

          // Extract JSON from markdown code blocks
          String jsonContent = extractJsonFromMarkdown(textContent);

          JsonNode analysisData = objectMapper.readTree(jsonContent);

          return Recommendation.builder()
              .activityId(activity.getId())
              .userId(activity.getUserId())
              .type(activity.getType())
              .recommendation(analysisData.get("analysis").get("overall").asText())
              .improvements(extractStringList(analysisData.get("improvements"), "recommendation"))
              .suggestions(extractStringList(analysisData.get("suggestions"), "description"))
              .safety(extractStringArray(analysisData.get("safety")))
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

  private List<String> extractStringList(JsonNode arrayNode, String fieldName) {
    List<String> result = new ArrayList<>();
    if (arrayNode != null && arrayNode.isArray()) {
      for (JsonNode item : arrayNode) {
        if (item.has(fieldName)) {
          result.add(item.get(fieldName).asText());
        }
      }
    }
    return result;
  }

  private List<String> extractStringArray(JsonNode arrayNode) {
    List<String> result = new ArrayList<>();
    if (arrayNode != null && arrayNode.isArray()) {
      for (JsonNode item : arrayNode) {
        result.add(item.asText());
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
