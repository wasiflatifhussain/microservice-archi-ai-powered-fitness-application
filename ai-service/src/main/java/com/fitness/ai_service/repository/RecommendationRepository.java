package com.fitness.ai_service.repository;

import com.fitness.ai_service.model.Recommendation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecommendationRepository extends MongoRepository<Recommendation, String> {

  Optional<Recommendation> findByActivityId(String activityId);

  List<Recommendation> findByKeycloakId(String keycloakId);
}
