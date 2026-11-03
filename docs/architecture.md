# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: React 19 with Vite and React Router. Each route (`/activities`, `/teams`, `/leaderboard`, `/workouts`) fetches through the shared API client (`client.ts`) and renders four states: loading (`role="status"`), a meaningful empty state, an error (`role="alert"`), and the data list.
- Logic tier decision: Express and TypeScript routes stay thin and delegate to services. Input is validated before it reaches Mongoose, and malformed IDs or missing fields return deliberate 4xx responses (400/404), never a 500.
- Data tier decision: Mongoose models keep references for user and team in MongoDB. Required fields and defaults are added to the schemas while preserving the passing seed behavior. Points and `occurredAt` are computed on create.
- Activity tracking approach: `POST /api/activities` validates `userId` and `teamId` as ObjectIds, checks that both documents exist, then stores `user`, `team`, `type`, `minutes`, computed `points`, and `occurredAt`. `GET` lists activities.
- Team management approach: `POST /api/teams` rejects a missing `name` with 400 and keeps the submitted `name` and `mascot`. `GET` lists teams with members.
- Leaderboard approach: Aggregate activity points per team, sort descending, and return `teamName`, `totalPoints`, and a 1-based `rank`.
- Workout suggestions approach: Look up the user by email (404 if none), read recent activity, and return suggestions whose first item has a matching `focus` and a `reason`.
- Implementation order: data tier first, then logic tier (activities, teams, leaderboard, workouts), then presentation tier, then verification with focused tests and both builds.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`. A failure means a model or seed rule is missing.
- API command: `npm run test:api --prefix octofit-tracker/backend`. A failure means a route does not meet the API contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend`. Baseline: 15 of 15 tests fail because every route still shows "Implementation pending". The root-level `npm test` is invalid because there is no root `package.json`.
- Backend build command: `npm run build --prefix octofit-tracker/backend`. A failure means a TypeScript error.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`. A failure means a TypeScript or bundling error.