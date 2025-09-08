package com.fitness.activtiy_service.repository;

import com.fitness.activtiy_service.model.Activity;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
  List<Activity> findByUserId(String userId);
}
