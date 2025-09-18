# AI-Powered Microservice Fitness Application

> A comprehensive fitness application built on a microservices architecture, featuring AI-powered activity analysis,
> centralized configuration, and secure authentication with Keycloak.

## Features

- **Microservices Architecture**: Each core functionality is a separate service, ensuring scalability and
  maintainability.
- **AI-Powered Recommendations**: Utilizes Google's Gemini API to provide users with detailed analysis and
  recommendations for their fitness activities.
- **Centralized Configuration**: Uses Spring Cloud Config Server to manage configurations for all services in one place.
- **Service Discovery**: Employs Eureka Server for dynamic service registration and discovery.
- **Secure Authentication**: Integrates Keycloak for robust, token-based authentication and authorization using OAuth
  2.0 with PKCE.
- **Asynchronous Processing**: Leverages RabbitMQ for message queuing, enabling resilient and non-blocking communication
  between services.
- **Single Entry Point**: Features a Spring Cloud Gateway to act as a single, unified entry point for all client
  requests.

## Architecture Overview

The application follows a standard microservices pattern. Client requests are routed through the **API Gateway**, which
handles authentication and forwards traffic to the appropriate downstream service. Services are registered with the *
*Eureka Server** for discovery, and their configurations are managed by the **Config Server**.

<img width="1050" height="531" alt="Application Architecture Diagram" src="https://github.com/user-attachments/assets/ed0cd9de-00b1-4b6d-845d-19da84cda52e" />

## Services

| Service              | Description                                                                                   |
|:---------------------|:----------------------------------------------------------------------------------------------|
| **User Service**     | Manages user profiles and registration, syncing user data with Keycloak.                      |
| **Activity Service** | Tracks user fitness activities (e.g., runs, workouts) and publishes them to RabbitMQ.         |
| **AI Service**       | Consumes activity data from RabbitMQ and uses the Gemini API to generate recommendations.     |
| **API Gateway**      | The single entry point for all incoming requests. Handles routing and security.               |
| **Config Server**    | Provides centralized configuration management for all microservices.                          |
| **Eureka Server**    | Handles service registration and discovery, allowing services to find each other dynamically. |

## Tech Stack

| Category              | Technology                                     |
|:----------------------|:-----------------------------------------------|
| **Backend**           | Spring Boot, Spring Cloud                      |
| **Frontend**          | React (or any other modern frontend framework) |
| **Service Discovery** | Spring Cloud Netflix Eureka                    |
| **API Gateway**       | Spring Cloud Gateway                           |
| **Authentication**    | Keycloak (OAuth 2.0 with PKCE)                 |
| **Messaging**         | RabbitMQ (Spring AMQP)                         |
| **Database**          | PostgreSQL / MongoDB                           |
| **AI Provider**       | Google Gemini API                              |
| **Configuration**     | Spring Cloud Config Server                     |

## Development Setup

### Authentication Flow

The application uses Keycloak to manage identity and access, following a standard and secure pattern:

1. **Registration**: A new user signs up via the public `/api/users/register` endpoint. The `user-service` acts as an
   admin client to create the user in both its own database and in Keycloak. The user's password is **only** stored
   securely in Keycloak.
2. **Login**: An existing user logs in. The frontend application uses the **OAuth 2.0 Authorization Code with PKCE flow
   **. It redirects the user to Keycloak's login page. After a successful login, Keycloak provides a JWT access token to
   the frontend.
3. **Authenticated Requests**: The frontend includes the JWT in the `Authorization` header for all subsequent requests
   to protected API endpoints. The API Gateway validates the token before forwarding the request to the appropriate
   downstream service.

### Making Authorized Calls with Postman

To test secured endpoints, you need to obtain a JWT from Keycloak by simulating the login flow.

1. **Configure OAuth 2.0 in Postman**:
    - In the `Authorization` tab of a request, set the **Type** to `OAuth 2.0`.
    - **Token Name**: `keycloak_access_token` (or any name you prefer).
    - **Grant Type**: `Authorization Code (With PKCE)`.
    - **Callback URL**: The URL of your frontend client (e.g., `http://localhost:5173`).
    - **Auth URL**: Find this in your Keycloak realm settings under `Endpoints` > `OpenID Endpoint Configuration` >
      `authorization_endpoint`.
    - **Access Token URL**: Find this in the same configuration > `token_endpoint`.
    - **Client ID**: The ID of your **public** frontend client in Keycloak (e.g., `oauth2-pkce-client`).
    - **Client Secret**: Leave this blank for a public client.
    - **Code Challenge Method**: `SHA-256`.

2. **Get a New Access Token**:
    - Click `Get New Access Token`. A browser window will open.
    - Log in with the credentials of a user you created during registration.
    - After successful login, Postman will receive the token.

3. **Use the Token**:
    - You can now use this token to make authorized calls to your microservices via the API Gateway. Postman will
      automatically include it in the `Authorization` header.

---

### Additional Screenshots & Diagrams

*Note: The following diagrams illustrate various configurations and dependencies within the project.*

<img width="1294" height="650" alt="Screenshot 2025-09-06 at 11 17 29 PM" src="https://github.com/user-attachments/assets/0b06f0f3-77be-4a53-9720-5ea1ccacd8e5" />
<img width="1289" height="643" alt="Screenshot 2025-09-07 at 7 40 32 PM" src="https://github.com/user-attachments/assets/164b576f-70f5-4049-ba03-8d32e62812e5" />
<img width="1290" height="645" alt="Screenshot 2025-09-08 at 10 41 51 PM" src="https://github.com/user-attachments/assets/56048c9a-290e-4af4-938d-9dd71c7642f2" />
<img width="1294" height="645" alt="Screenshot 2025-09-13 at 7 18 40_PM" src="https://github.com/user-attachments/assets/5052bada-563d-4e96-a158-10268f1dab4a" />