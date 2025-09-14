package com.fitness.activity_service.service;

import com.fitness.activity_service.client.user.UserServiceClient;
import com.fitness.activity_service.dto.ActivityRequest;
import com.fitness.activity_service.dto.ActivityResponse;
import com.fitness.activity_service.model.Activity;
import com.fitness.activity_service.repository.ActivityRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {
  private final ActivityRepository activityRepository;
  private final UserServiceClient
      userServiceClient; // use interface rather than adapter impl - adapter called auto by Spring
  private final RabbitTemplate rabbitTemplate;

  @Value("${rabbitmq.exchange.name}")
  private String exchange;

  @Value("${rabbitmq.routing.key}")
  private String routingKey;

  public ActivityResponse trackActivity(ActivityRequest activityRequest) {
    log.info("trackActivity called for userId={}", activityRequest.getUserId());
    try {
      Boolean userExists = userServiceClient.validateUser(activityRequest.getUserId()).block();
      if (userExists == null || !userExists) {
        log.error("User validation failed for userId={}", activityRequest.getUserId());
        return null;
      }
      log.info("User validated successfully for userId={}", activityRequest.getUserId());

      Activity activity =
          Activity.builder()
              .userId(activityRequest.getUserId())
              .type(activityRequest.getActivityType())
              .duration(activityRequest.getDuration())
              .caloriesBurned(activityRequest.getCaloriesBurned())
              .startTime(activityRequest.getStartTime())
              .additionalMetrics(activityRequest.getAdditionalMetrics())
              .build();
      Activity savedActivity = activityRepository.save(activity);
      log.info("Activity saved successfully with activityId={}", savedActivity.getId());

      // publish to RabbitMQ for AI Processing
      try {
        rabbitTemplate.convertAndSend(exchange, routingKey, savedActivity);
        log.info("Published activity to RabbitMQ for activityId={}", savedActivity.getId());
      } catch (Exception e) {
        log.error(
            "Failed to publish activity to RabbitMQ for activityId={}", savedActivity.getId(), e);
      }
      return mapToActivityResponse(savedActivity);
    } catch (Exception e) {
      log.error(
          "Error occurred while tracking activity for userId={}", activityRequest.getUserId(), e);
      throw e;
    }
  }

  public ActivityResponse getActivityById(String activityId) {
    log.info("getActivityById called for activityId={}", activityId);
    try {
      Activity activity = activityRepository.findById(activityId).orElse(null);
      if (activity == null) {
        log.warn("Activity not found for activityId={}", activityId);
        return null;
      }
      log.info("Activity found successfully for activityId={}", activityId);
      return mapToActivityResponse(activity);
    } catch (Exception e) {
      log.error("Database error while fetching activity for activityId={}", activityId, e);
      throw e;
    }
  }

  public List<ActivityResponse> getActivitiesByUserId(String userId) {
    log.info("getActivitiesByUserId called for userId={}", userId);
    try {
      Boolean userExists = userServiceClient.validateUser(userId).block();
      if (userExists == null || !userExists) {
        log.warn("User validation failed for userId={}", userId);
        return null; // Return null for invalid user
      }
      log.info("User validated successfully for userId={}", userId);

      List<Activity> activities = activityRepository.findByUserId(userId);
      if (activities.isEmpty()) {
        log.warn("No activities found for userId={}", userId);
        return List.of();
      }

      log.info("Found {} activities for userId={}", activities.size(), userId);
      return activities.stream().map(this::mapToActivityResponse).collect(Collectors.toList());
    } catch (Exception e) {
      log.error("System error while getting activities for userId={}", userId, e);
      throw e;
    }
  }

  private ActivityResponse mapToActivityResponse(Activity activity) {
    return ActivityResponse.builder()
        .id(activity.getId())
        .userId(activity.getUserId())
        .type(activity.getType())
        .duration(activity.getDuration())
        .caloriesBurned(activity.getCaloriesBurned())
        .startTime(activity.getStartTime())
        .additionalMetrics(activity.getAdditionalMetrics())
        .createdAt(activity.getCreatedAt())
        .updatedAt(activity.getUpdatedAt())
        .build();
  }
}
