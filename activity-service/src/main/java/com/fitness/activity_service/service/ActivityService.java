package com.fitness.activity_service.service;

import com.fitness.activity_service.client.user.UserServiceClient;
import com.fitness.activity_service.dto.ActivityRequest;
import com.fitness.activity_service.dto.ActivityResponse;
import com.fitness.activity_service.model.Activity;
import com.fitness.activity_service.repository.ActivityRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class ActivityService {
  private ActivityRepository activityRepository;
  private UserServiceClient
      userServiceClient; // use interface rather than adapter impl - adapter called auto by Spring

  public ActivityResponse trackActivity(ActivityRequest activityRequest) {
    log.info("trackActivity called for userId={}", activityRequest.getUserId());
    try {
      Boolean userExists = userServiceClient.validateUser(activityRequest.getUserId()).block();
      if (userExists == null || !userExists) {
        log.warn("User validation failed for userId={}", activityRequest.getUserId());
        throw new IllegalArgumentException(
            "User does not exist with ID: " + activityRequest.getUserId());
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
      Activity activity =
          activityRepository
              .findById(activityId)
              .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
      log.info("Activity found successfully for activityId={}", activityId);
      return mapToActivityResponse(activity);
    } catch (RuntimeException e) {
      if (e.getMessage().contains("Activity not found")) {
        log.warn("Activity not found for activityId={}", activityId);
      } else {
        log.error("Error occurred while fetching activity for activityId={}", activityId, e);
      }
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

  public List<ActivityResponse> getActivitiesByUserId(String userId) {
    log.info("getActivitiesByUserId called for userId={}", userId);
    try {
      Boolean userExists = userServiceClient.validateUser(userId).block();
      if (userExists == null || !userExists) {
        log.warn("User validation failed for userId={}", userId);
        throw new IllegalArgumentException("User does not exist with ID: " + userId);
      }
      log.info("User validated successfully for userId={}", userId);

      List<Activity> activities = activityRepository.findByUserId(userId);
      if (activities.isEmpty()) {
        log.warn("No activities found for userId={}", userId);
        throw new IllegalArgumentException("No activities found for user: " + userId);
      }
      log.info("Found {} activities for userId={}", activities.size(), userId);
      return activities.stream().map(this::mapToActivityResponse).collect(Collectors.toList());
    } catch (Exception e) {
      log.error("Error occurred while getting activities for userId={}", userId, e);
      throw e;
    }
  }
}
