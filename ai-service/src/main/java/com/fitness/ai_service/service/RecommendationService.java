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

  public List<Recommendation> getUserRecommendations(String userId) {
    log.info("getUserRecommendations called for userId={}", userId);
    try {
      List<Recommendation> recommendations = recommendationRepository.findByUserId(userId);
      log.info(
          "Found {} recommendations for userId={}",
          recommendations != null ? recommendations.size() : 0,
          userId);
      return recommendations != null ? recommendations : List.of();
    } catch (Exception e) {
      log.error("Database error while fetching recommendations for userId={}", userId, e);
      throw new RuntimeException("Failed to fetch recommendations due to system error", e);
    }
  }

  public Recommendation getActivityRecommendations(String activityId) {
    log.info("getActivityRecommendations called for activityId={}", activityId);
    try {
      return recommendationRepository.findByActivityId(activityId).orElse(null);
    } catch (Exception e) {
      log.error("Database error while fetching recommendations for activityId={}", activityId, e);
      throw new RuntimeException("Failed to fetch activity recommendations due to system error", e);
    }
  }
}
