package com.fitness.ai_service.controller;

import com.fitness.ai_service.model.Recommendation;
import com.fitness.ai_service.service.RecommendationService;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
@AllArgsConstructor
public class RecommendationController {
  private final RecommendationService recommendationService;

  @GetMapping("/geUserRecommendations/{userId}")
  public ResponseEntity<?> getUserRecommendations(@PathVariable String userId) {

    List<Recommendation> recommendations = recommendationService.getUserRecommendations(userId);

    if (recommendations.isEmpty()) {
      return ResponseEntity.ok(
          Map.of(
              "message",
              "No recommendations found for this user",
              "userId",
              userId,
              "recommendations",
              List.of()));
    }

    return ResponseEntity.ok(recommendations);
  }

  @GetMapping("/getActivityRecommendations/{activityId}")
  public ResponseEntity<?> getActivityRecommendation(@PathVariable String activityId) {
    Recommendation recommendation = recommendationService.getActivityRecommendations(activityId);
    if (recommendation == null) {
      return ResponseEntity.ok(
          Map.of(
              "error", "Not Found",
              "message", "No recommendations found for this activity",
              "activityId", activityId));
    }
    return ResponseEntity.ok(recommendation);
  }
}
