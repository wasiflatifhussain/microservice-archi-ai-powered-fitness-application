# Activity Service

> A microservice responsible for tracking user fitness activities, validating user existence, and publishing activity
> data to a RabbitMQ exchange for asynchronous processing.

## Features

- **Activity Tracking**: Provides endpoints to create, retrieve, and manage user fitness activities.
- **User Validation**: Communicates with the `user-service` to ensure that activities are tracked for valid users only.
- **Asynchronous Publishing**: Publishes newly created activities to a RabbitMQ exchange, decoupling it from downstream
  services like the `ai-service`.
- **Layered Architecture**: Organized into distinct layers (Controller, Service, Repository, etc.) for improved
  maintainability and separation of concerns.

## Getting Started

### Prerequisites

- Java 17+ & Maven
- MongoDB instance running
- RabbitMQ server running

### Running Locally

1. Ensure your local MongoDB and RabbitMQ servers are running.
2. Run the service from your IDE.

## Architecture & Processing Flow

The Activity Service acts as the primary entry point for activity-related data.

1. A client sends a request to the `/api/activities/track` endpoint to record a new fitness activity.
2. The `ActivityService` first communicates with the **User Service** via a REST client to validate the user ID.
3. If the user is valid, the activity is saved to the service's MongoDB database.
4. After saving, the new activity object is published as a message to a **RabbitMQ exchange**.
5. Downstream services, such as the **AI Service**, can then consume this message for further processing (e.g.,
   generating recommendations) without directly coupling to the Activity Service.

This asynchronous flow ensures that the activity tracking process is fast and resilient, as it does not need to wait for
AI analysis to complete.