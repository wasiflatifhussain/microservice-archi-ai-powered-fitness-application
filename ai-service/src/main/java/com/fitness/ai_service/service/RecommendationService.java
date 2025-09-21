package com.fitness.ai_service.service;

import com.fitness.ai_service.model.Recommendation;
import com.fitness.ai_service.repository.RecommendationRepository;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class RecommendationService {
  private final RecommendationRepository recommendationRepository;

  public List<Recommendation> getUserRecommendations(String keycloakId) {
    log.info("getUserRecommendations called for keycloakId={}", keycloakId);
    try {
      List<Recommendation> recommendations = recommendationRepository.findByKeycloakId(keycloakId);
      log.info(
          "Found {} recommendations for keycloakId={}",
          recommendations != null ? recommendations.size() : 0,
          keycloakId);
      return recommendations != null ? recommendations : List.of();
    } catch (Exception e) {
      log.error("Database error while fetching recommendations for keycloakId={}", keycloakId, e);
      throw new RuntimeException("Failed to fetch recommendations due to system error", e);
    }
  }

  public Recommendation getActivityRecommendations(String activityId) {
    log.info("getActivityRecommendations called for activityId={}", activityId);
    try {
      Recommendation recommendation =
          recommendationRepository.findByActivityId(activityId).orElse(null);
      if (recommendation != null) {
        log.info("Found recommendation for activityId={}", activityId);
        return recommendation;
      }
      return null;
    } catch (Exception e) {
      log.error("Database error while fetching recommendations for activityId={}", activityId, e);
      throw new RuntimeException("Failed to fetch activity recommendations due to system error", e);
    }
  }
}
