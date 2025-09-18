# AI Service

> A microservice that provides AI-powered fitness activity analysis and recommendations using Google's Gemini API and
> RabbitMQ.

## Features

- **Asynchronous Processing**: Listens to a RabbitMQ queue for fitness activities, ensuring non-blocking operations for
  upstream services.
- **AI-Powered Analysis**: Calls the Google Gemini API to generate in-depth analysis, workout suggestions, and safety
  tips based on activity data.
- **Resilient by Design**: Implements a robust retry mechanism with exponential backoff to handle transient API failures
  gracefully.
- **Scalable Architecture**: Built as a modular microservice for high scalability and maintainability.

## Getting Started

### Prerequisites

- Java 17+ & Maven
- MongoDB instance running
- RabbitMQ server running
- Access to the Google Gemini API, which may require a **VPN connection** depending on your geographical location.

### Running Locally

1. Ensure your local MongoDB and RabbitMQ servers are running.
2. If required, connect to a VPN to ensure access to the Gemini API.
3. Update your IDE's run configuration to include the following environment variables:

| Variable         | Description                                          |
|:-----------------|:-----------------------------------------------------|
| `GEMINI_API_KEY` | Your personal API key for the Google Gemini API.     |
| `GEMINI_API_URL` | The endpoint URL for the Gemini model you are using. |

## Architecture & Processing Flow

The AI Service is designed to work asynchronously, decoupling it from the services that produce activity data.

1. The **Activity Service** tracks a new user activity and publishes it as a message to a RabbitMQ exchange.
2. The message is routed to the `activity.queue`.
3. The **AI Service**'s `ActivityMessageListener` consumes the message from the queue.
4. The service constructs a detailed prompt and calls the **Google Gemini API** for analysis.
5. The AI-generated JSON response is parsed and saved as a `Recommendation` object in the AI Service's MongoDB database.

## Error Handling and Retry Mechanism

Due to potential network issues (especially with a VPN) and API cost considerations, a sophisticated retry mechanism is
implemented using Spring Retry.

The flow for a single message is as follows:

1. **Message Arrival**: The `processActivity()` listener method is invoked.
2. **Attempt 1 (Immediate)**: The `generateRecommendation()` method is called.
3. **Attempt 2 (1s Delay)**: If the first attempt fails, the method is retried after a 1-second delay.
4. **Attempt 3 (2s Delay)**: If the second attempt fails, the method is retried after a 2-second delay.
5. **Final Failure**: If the third attempt fails, the `@Recover` method is invoked, which logs the final error and
   throws a custom `RecommendationGenerationException`.
6. **Rejection**: This exception is caught in the listener, which then throws an `AmqpRejectAndDontRequeueException`.
   This tells RabbitMQ to discard the message permanently, preventing an infinite loop of failed retries.

> **Important**: In the current setup, a message that fails all three retry attempts is **deleted forever** and will not
> be re-processed, even after a server restart. This prevents failed messages from consuming API quotas indefinitely.