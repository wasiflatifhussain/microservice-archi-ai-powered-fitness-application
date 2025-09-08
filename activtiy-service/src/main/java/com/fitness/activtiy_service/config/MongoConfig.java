package com.fitness.activtiy_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

// Configuration class to enable MongoDB auditing features like automatic population of createdAt
// and updatedAt fields
@Configuration
@EnableMongoAuditing
public class MongoConfig {}
