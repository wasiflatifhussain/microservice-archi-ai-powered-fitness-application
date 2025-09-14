package com.fitness.ai_service.dto;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.Data;

@Data
public class ActivityObject {
  private String id;
  private String userId;
  private Integer duration;
  private Integer caloriesBurned;
  private LocalDateTime startTime;
  private Map<String, Object> additionalMetrics;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
