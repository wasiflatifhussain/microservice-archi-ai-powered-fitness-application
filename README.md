# microservice-archi-ai-powered-fitness-application

## HIGHLIGHTS

- Fully Featured Fitness App on Microservices Arch.
- AI Integration in Microservices
- Step by step easy to follow guide

## TECH STACK

- Spring Boot + React Frontend
- Eureka Server (Spring Cloud Netflix)
- Spring Cloud Gateway
- Keycloak
- RabbitMQ (Spring AMQP)
- PostgreSQL / MySQL
- Google Gemini API
- Spring Cloud Config Server

## To make authorized calls from Postman

- Go to Authorization tab in the Postman request
- Select OAuth 2.0 as the type
- Token Name: access_token
- Grant Type: Authorization Code (With PKCE)
- Callback URL: http://localhost:5173
- To find Auth URL and Access Token URL:  
  Navigate to the Keycloak realm -> Realm Settings -> go bottom to Endpoints -> click on OpenID Endpoint
  Configuration  
  Auth URL: authorization_endpoint link
  Access Token URL: token_endpoint link
- Client ID: Go to Clients in Keycloak -> select your client (e.g., fitness-frontend) -> copy Client ID
- Go to Users and create a User and credentials (password)
- Come back to Postman and click on Get New Access Token
- A browser window will open, login with the user you created in Keycloak
- Now you can use this token to make authorized calls to your microservices
- Watch this video: https://www.youtube.com/watch?v=_FdKTSFnWeg&t=83s&ab_channel=EmbarkX%7CLearnProgramming from 07:06:
  00 to 07:12:00

<img width="1050" height="531" alt="Screenshot 2025-09-06 at 10 48 21 PM" src="https://github.com/user-attachments/assets/ed0cd9de-00b1-4b6d-845d-19da84cda52e" />
Note: For below next two screenshots, also need Eureka Discovery Client, Eureka Management, and Spring Cloud included [check pom.xml]
<img width="1294" height="650" alt="Screenshot 2025-09-06 at 11 17 29 PM" src="https://github.com/user-attachments/assets/0b06f0f3-77be-4a53-9720-5ea1ccacd8e5" />
<img width="1289" height="643" alt="Screenshot 2025-09-07 at 7 40 32 PM" src="https://github.com/user-attachments/assets/164b576f-70f5-4049-ba03-8d32e62812e5" />
<img width="1290" height="645" alt="Screenshot 2025-09-08 at 10 41 51 PM" src="https://github.com/user-attachments/assets/56048c9a-290e-4af4-938d-9dd71c7642f2" />
<img width="1294" height="645" alt="Screenshot 2025-09-13 at 7 18 40 PM" src="https://github.com/user-attachments/assets/5052bada-563d-4e96-a158-10268f1dab4a" />


