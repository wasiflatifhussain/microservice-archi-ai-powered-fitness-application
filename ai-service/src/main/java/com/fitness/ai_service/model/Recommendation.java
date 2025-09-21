package com.fitness.ai_service.model;

import com.fitness.ai_service.dto.ActivityObjectType;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recommendations")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Recommendation {
  @Id private String id;
  private String activityId;
  private String keycloakId;
  private ActivityObjectType type;
  private String recommendation;
  private List<String> improvements;
  private List<String> suggestions;
  private List<String> safety;

  @CreatedDate private LocalDateTime createdAt;

  @LastModifiedDate private LocalDateTime updatedAt;
}
