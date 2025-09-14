package com.fitness.ai_service.service;

import com.fitness.ai_service.dto.ActivityObject;
import com.fitness.ai_service.exception.RecommendationGenerationException;
import com.fitness.ai_service.model.Recommendation;
import com.fitness.ai_service.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityMessageListener {

  private final AICallerService aiCallerService;
  private final RecommendationRepository recommendationRepository;

  @RabbitListener(queues = "activity.queue")
  public void processActivity(ActivityObject activity) {
    try {
      log.info("Received activity for processing={}", activity);
      Recommendation recommendation = aiCallerService.generateRecommendation(activity);
      log.info(
          "Successfully processed activity={} with recommendation={}",
          activity.getId(),
          recommendation);

      recommendationRepository.save(recommendation);
      log.info("Saved recommendation for activity={} to database", activity.getId());
    } catch (RecommendationGenerationException e) {
      log.error(
          "Failed to process activity={} after all retries={}", activity.getId(), e.getMessage());
      // Prevents infinite loops
      throw new AmqpRejectAndDontRequeueException(
          "Failed to process activity after all retries", e);

    } catch (Exception e) {
      log.error("Unexpected error processing activity={}: {}", activity.getId(), e.getMessage());
      // Stop requeue for unexpected errors either
      throw new AmqpRejectAndDontRequeueException("Unexpected error processing activity", e);
    }
  }
}
