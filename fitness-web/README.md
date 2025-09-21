# Fitness Web (Frontend)

Short summary

- React + TypeScript single-page app for a microservice-based fitness tracker.
- Auth via Keycloak (OIDC). Backend (activity-service) persists activities and publishes new activities to RabbitMQ. ai-service consumes RabbitMQ messages, generates recommendations (Gemini), saves them. Frontend displays activities and AI recommendations.

## Prerequisites

- Keycloak instance configured for this app
- activity-service, ai-service, recommendation-service, and RabbitMQ running
- Node 18+, pnpm/npm/yarn
- .env / Vite env variable: VITE_API_BASE_URL (default: http://localhost:8080)

## How to run (frontend)

1. Install dependencies:
   - npm install
2. Start dev server:
   - npm run dev
3. Ensure backend services and Keycloak are accessible and CORS configured.

## High-level architecture (frontend ↔ backend ↔ rabbitmq ↔ ai-service)

1. User logs in via Keycloak (Authorization Code + PKCE in SPA).
2. Frontend receives tokens from Keycloak and stores auth state in Redux.
3. When user tracks an activity, frontend POSTs the activity to the activity-service with:
   - Authorization: Bearer <access_token>
4. activity-service stores activity (Mongo), and publishes an event to RabbitMQ.
5. ai-service consumes RabbitMQ events, calls Gemini API (or configured LLM), produces a Recommendation document and persists it.
6. Frontend fetches activities and recommendations from the backend and shows them. Recommendations are eventually consistent (may appear slightly later). API calls use:
   - Authorization: Bearer <access_token>
   - X-Keycloak-Id: <user-keycloak-id> (header used by backend to tie activity to user)

## Auth flow details

- Login: Keycloak handles user authentication. Frontend uses the keycloak wrapper (features/auth/keycloak.ts) to initialize, login, logout and ensure tokens are valid.
- Register: Frontend calls backend registration endpoint in backend; backend creates user in Keycloak (server-side) and performs any server-side provisioning.
- The user then has to Login to store token in frontend. Note: In the future, I intend to incorportate a token retrieval system on register to avoid the need for user to login after a registration.
- Redux: authSlice stores auth state (isAuthenticated, user info). store.ts wires slices and calls setStoreDispatch(...) so Keycloak events can dispatch actions to Redux (keeps Redux in sync with Keycloak).
- keycloakId: Derived from Keycloak token (sub field). Frontend passes this as X-Keycloak-Id in requests that require it (getUserActivities). Backend expects this header for user-scoped endpoints.

## APIs used by frontend

- GET /api/activities/getUserActivities
  - Header: X-Keycloak-Id: {keycloakId}
  - Returns list of user's activities
- GET /api/recommendations/getUserRecommendations/{keycloakId}
  - Returns recommendations for user's activities
- POST /api/activities/track
  - Body: activity payload
  - Authorization: Bearer <token>
  - Backend returns saved activity

## Frontend data flow and synchronization

- Single source of truth for activity list: useActivities hook.
  - useActivities fetches activities and recommendations once on mount.
  - It combines recommendations with activities for quick lookup.
  - If any activity is missing a recommendation, the hook starts a polling interval (60s) to re-fetch and pick up recommendations when ai-service finishes processing.
- UI components:
  - Home.tsx holds const activitiesData = useActivities() and passes activitiesData to ActivityList and passes activitiesData.refreshActivities to ActivityForm via prop onActivityAdded.
  - ActivityForm calls onActivityAdded() after a successful POST so the parent hook refreshes the shared list.
  - ActivityList renders activities and shows badges (AI Ready / Processing) and short AI insight when available.
  - ActivityDetails reads the activity from the same shared activitiesData (no duplicate hook instances) and shows full recommendation details.
- Polling rules:
  - Polling only runs when there are activities marked with recommendationStatus === 'loading'.
  - Poll interval is conservative (60s) to avoid backend overload.
  - The hook debounces repeated fetches and avoids overlapping requests.

## Files of interest (frontend)

- src/hooks/useActivities.ts — central data hook for activities and recommendations, polling logic.
- src/components/ActivityForm.tsx — form that creates activities, calls onActivityAdded to refresh the shared list.
- src/components/ActivityList.tsx — list UI, uses activitiesData passed from parent.
- src/pages/ActivityDetails.tsx — UI for activity details + recommendations; reads from shared activities data.
- src/features/auth/keycloak.ts — Keycloak wrapper (init, login, refresh, helper getCurrentKeycloakId).
- src/features/auth/authSlice.ts — Redux auth slice.
- src/app/store.ts — Redux store and setStoreDispatch integration.
- src/utils/api.ts — fetch utilities (authenticated requests and X-Keycloak-Id helper).
