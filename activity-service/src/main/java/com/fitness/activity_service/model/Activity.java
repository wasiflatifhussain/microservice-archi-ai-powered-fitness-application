package com.fitness.activity_service.model;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "activities")
@Data
@Builder
// @AllArgsConstructor  // no need; use AllArgs in obj who need constructor replacement
public class Activity {
  @Id private String id;
  private String userId;
  private ActivityType type;
  private Integer duration;
  private Integer caloriesBurned;
  private LocalDateTime startTime;

  @Field("metrics")
  private Map<String, Object> additionalMetrics;

  @CreatedDate private LocalDateTime createdAt;
  @LastModifiedDate private LocalDateTime updatedAt;
}
