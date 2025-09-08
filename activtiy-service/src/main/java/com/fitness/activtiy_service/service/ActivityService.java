package com.fitness.activtiy_service.service;

import com.fitness.activtiy_service.dto.ActivityRequest;
import com.fitness.activtiy_service.dto.ActivityResponse;
import com.fitness.activtiy_service.model.Activity;
import com.fitness.activtiy_service.port.UserServiceClient;
import com.fitness.activtiy_service.repository.ActivityRepository;
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
    Boolean userExists = userServiceClient.validateUser(activityRequest.getUserId()).block();
    if (userExists == null || !userExists) {
      throw new IllegalArgumentException(
          "User does not exist with ID: " + activityRequest.getUserId());
    }
    log.info("User validated: " + activityRequest.getUserId());

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

    return mapToActivityResponse(savedActivity);
  }

  public ActivityResponse getActivityById(String activityId) {
    Activity activity =
        activityRepository
            .findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
    return mapToActivityResponse(activity);
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
    Boolean userExists = userServiceClient.validateUser(userId).block();
    if (userExists == null || !userExists) {
      throw new IllegalArgumentException("User does not exist with ID: " + userId);
    }
    List<Activity> activities = activityRepository.findByUserId(userId);
    if (activities.isEmpty()) {
      throw new IllegalArgumentException("No activities found for user: " + userId);
    }
    return activities.stream().map(this::mapToActivityResponse).collect(Collectors.toList());
  }
}
