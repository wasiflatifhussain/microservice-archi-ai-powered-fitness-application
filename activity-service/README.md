# Activity Service

The Activity Service is a microservice responsible for managing user activities within an application. It provides
functionalities to create, read, update, and delete activities, as well as to track user engagement.
The service is built using a layered architecture to separate concerns and improve maintainability.

## Architecture

The Activity Service follows a layered architecture consisting of the following layers:

1. **Controller Layer**: Handles incoming HTTP requests and routes them to the appropriate service methods
2. **Service Layer**: Contains the business logic for managing activities
3. **Repository Layer**: Interacts with the database to perform CRUD operations on activity data
4. **Model Layer**: Defines the data structures used in the application
5. **Configuration Layer**: Manages application configuration and environment settings
7. **Client Layer**: Provides client interfaces and implementations for external service interactions
8. **Dto Layer**: Contains Data Transfer Objects for transferring data between layers

## Rabbit MQ Integration

Uses Rabbit MQ to store the created activities in a queue for further processing