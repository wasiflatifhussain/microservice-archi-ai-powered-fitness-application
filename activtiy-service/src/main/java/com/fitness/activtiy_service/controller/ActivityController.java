package com.fitness.activtiy_service.controller;

import com.fitness.activtiy_service.dto.ActivityRequest;
import com.fitness.activtiy_service.dto.ActivityResponse;
import com.fitness.activtiy_service.service.ActivityService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {

  private ActivityService activityService;

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
      @RequestHeader("X-User-Id") String userId) {
    return ResponseEntity.ok(activityService.getActivitiesByUserId(userId));
  }
}
