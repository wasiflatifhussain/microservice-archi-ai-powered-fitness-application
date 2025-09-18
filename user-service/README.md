# User Service

> A microservice responsible for managing user registration and profiles, acting as the bridge between the application
> and the Keycloak identity server.

## Features

- **User Registration**: Provides a public endpoint for new users to register.
- **Keycloak Integration**: Uses the Keycloak Admin Client to programmatically create and synchronize user accounts with
  the Keycloak identity server.
- **Secure Credential Handling**: Ensures that user passwords are **only** stored securely in Keycloak and are never
  saved in the service's own database.
- **Profile Management**: Offers endpoints to retrieve user profile information.
- **Database Persistence**: Stores user profile data (excluding sensitive credentials) in a PostgreSQL database.

## Getting Started

### Prerequisites

- Java 17+ & Maven
- PostgreSQL database running
- A running Keycloak instance

### Running Locally

1. Ensure your local PostgreSQL and Keycloak servers are running.
2. Configure a confidential client in Keycloak with `service accounts` enabled and the `manage-users` role assigned.
3. Update your IDE's run configuration to include the following environment variable:

| Variable        | Description                                              |
|:----------------|:---------------------------------------------------------|
| `CLIENT_SECRET` | The client secret for your confidential Keycloak client. |

4. Run the service from your IDE.

## Architecture & Registration Flow

The User Service is central to the application's identity management strategy.

1. A new user sends their details to the public `/api/users/register` endpoint.
2. The `UserService` receives the request and uses the **Keycloak Admin Client** to create a new user in Keycloak. This
   is a secure, backend-to-backend administrative action.
3. Keycloak returns a unique `keycloakId` for the new user.
4. The `UserService` saves the user's profile information (email, name, and the `keycloakId`) to its own PostgreSQL
   database. The user's password is **never** stored locally.
5. If the database save fails, a rollback operation is triggered to delete the newly created user from Keycloak,
   preventing data inconsistency.

This architecture correctly separates the concerns of user profile management (handled by the User Service) and secure
credential storage and authentication (handled by Keycloak).
