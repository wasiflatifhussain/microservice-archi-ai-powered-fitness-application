package com.fitness.ai_service.service;

import com.fitness.ai_service.dto.ActivityObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityMessageListener {

  @RabbitListener(queues = "activity.queue")
  public void processActivity(ActivityObject activity) {
    log.info("Received activity for processing={}", activity);
    // Implement AI processing logic here
  }
}
