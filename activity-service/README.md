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

Uses Rabbit MQ to store the created activities in a queue for further processing.
When an activity is created, it is sent to a Rabbit MQ queue. As soon as the activity is in the queue, AI Service
listens to the queue, and gets the activity. Then, it calls the Gemini API to get a response based on the activity.
Finally, the response is stored in the database.

Process Flow:
Activity Service: /api/activities/track -> Rabbit MQ Queue -> AI Service: listens to the queue -> fetches new entry ->
calls Gemini API -> processes response -> Database