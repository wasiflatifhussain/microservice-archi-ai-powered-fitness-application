package com.fitness.activtiy_service.dto;

import com.fitness.activtiy_service.model.ActivityType;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityResponse {
  private String id;
  private String userId;
  private ActivityType type;
  private Integer duration;
  private Integer caloriesBurned;
  private LocalDateTime startTime;
  private Map<String, Object> additionalMetrics;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
