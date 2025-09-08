package com.fitness.activtiy_service.service;

import com.fitness.activtiy_service.dto.ActivityRequest;
import com.fitness.activtiy_service.dto.ActivityResponse;
import com.fitness.activtiy_service.model.Activity;
import com.fitness.activtiy_service.repository.ActivityRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ActivityService {
  private ActivityRepository activityRepository;

  public ActivityResponse trackActivity(ActivityRequest activityRequest) {
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
    List<Activity> activities = activityRepository.findByUserId(userId);
    if (activities.isEmpty()) {
      throw new IllegalArgumentException("No activities found for user: " + userId);
    }
    return activities.stream().map(this::mapToActivityResponse).collect(Collectors.toList());
  }
}
