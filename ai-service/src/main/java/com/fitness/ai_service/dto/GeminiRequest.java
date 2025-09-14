package com.fitness.ai_service.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeminiRequest {
  private List<Map<String, Object>> contents;

  public static GeminiRequest fromText(String text) {
    Map<String, Object> part = Map.of("text", text);
    Map<String, Object> content = Map.of("parts", List.of(part));

    return GeminiRequest.builder().contents(List.of(content)).build();
  }
}
