## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Each route (`/activities`, `/teams`, `/leaderboard`, `/workouts`) fetches through the shared API client and renders four states: loading (`role="status"`), a meaningful empty state, an error (`role="alert"`), and the data list.
- Logic tier decision: Express routes stay thin and delegate to services. Input is validated before it reaches Mongoose, and malformed IDs or missing fields return deliberate 4xx responses (400/404), never a 500.
- Data tier decision: Mongoose models keep references for user and team. Points and `occurredAt` are computed on create. The seed script supplies users, teams, and activities.
- Activity tracking approach: `POST /api/activities` validates `userId` and `teamId` as ObjectIds, checks that both documents exist, then stores `user`, `team`, `type`, `minutes`, computed `points`, and `occurredAt`.
- Team management approach: `POST /api/teams` rejects a missing `name` with 400 and keeps the submitted `name` and `mascot`.
- Leaderboard approach: Aggregate activity points per team, sort descending, and return `teamName`, `totalPoints`, and a 1-based `rank`.
- Workout suggestions approach: Look up the user by email (404 if none), read recent activity, and return suggestions whose first item has a matching `focus` and a `reason`.

Implementation order: data tier first, then API routes, then frontend states per route, then both builds.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`. A failure means a model or seed rule is missing.
- API command: `npm run test:api --prefix octofit-tracker/backend`. A failure means a route does not meet the API contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend`. Baseline: 15 of 15 tests fail because every route still shows "Implementation pending".
- Backend build command: `npm run build --prefix octofit-tracker/backend`. A failure means a TypeScript error.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`. A failure means a TypeScript or bundling error.