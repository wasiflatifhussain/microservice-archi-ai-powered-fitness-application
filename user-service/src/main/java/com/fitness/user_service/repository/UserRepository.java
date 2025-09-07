package com.fitness.user_service.repository;

import com.fitness.user_service.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {

  boolean existsByEmail(
      @NotBlank(message = "Email is required") @Email(message = "Email should be valid")
          String email);
}
