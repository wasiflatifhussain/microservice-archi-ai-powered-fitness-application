package com.fitness.activity_service.controller;

import com.fitness.activity_service.dto.ActivityRequest;
import com.fitness.activity_service.dto.ActivityResponse;
import com.fitness.activity_service.service.ActivityService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {

  private final ActivityService activityService;

  @GetMapping("/{activityId}")
  public ResponseEntity<ActivityResponse> getActivity(@PathVariable String activityId) {
    return ResponseEntity.ok(activityService.getActivityById(activityId));
  }

  @PostMapping("/track")
  public ResponseEntity<ActivityResponse> trackActivity(
      @RequestBody ActivityRequest activityRequest) {
    return ResponseEntity.ok(activityService.trackActivity(activityRequest));
  }

  @GetMapping("/getUserActivities")
  public ResponseEntity<List<ActivityResponse>> getUserActivities(
      @RequestHeader("X-Keycloak-Id") String keycloakId) {
    return ResponseEntity.ok(activityService.getActivitiesByKeycloakId(keycloakId));
  }
}
