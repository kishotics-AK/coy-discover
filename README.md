
# Coy Discover

A mobile-first, swipe-based discovery experience built as part of a software engineering internship assignment.

Coy Discover allows users to explore profiles, express interest through swipe gestures, and view matches when two users like each other.

## Features

- Mobile-first, responsive interface
- Discover, Home, and Matches tabs
- 30 mock profiles with photos and personal details
- Swipe right to Like and left to Pass
- Alternative Like and Pass buttons
- Smooth swipe animations and visual feedback
- Mutual match detection
- Animated match celebration
- Persistent swipe history using SQLite
- Previously swiped profiles are excluded from the feed
- Incoming likes remain private until a mutual match
- Empty, loading, and error states

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Motion for React
- Axios
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite

### Testing
- Vitest
- Supertest

## Project Structure

```text
coy-discover/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── routes/
│   │   ├── lib/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── tests/
│   └── package.json
├── PART_A.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/coy-discover.git
cd coy-discover
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure the database

Create a `.env` file inside `server/`:

```env
DATABASE_URL="file:./dev.db"
PORT=5000
```

Initialize the SQLite database:

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start the backend

```bash
npm run dev
```

The backend runs at:

http://localhost:5000

### 5. Install and start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open:

http://localhost:5173

The Vite development server proxies API requests to the backend.

## API Endpoints

### GET /feed

Returns profiles the demo user has not already swiped on.

Example response:

```json
{
  "success": true,
  "count": 30,
  "profiles": []
}
```

The `profiles` array contains the available profile objects.

### POST /swipe

Records a Like or Pass action.

Request:

```json
{
  "targetUserId": 2,
  "action": "LIKE"
}
```

Possible responses:

- `201` — Swipe recorded
- `400` — Invalid request
- `404` — Profile not found
- `409` — Profile already swiped
- `500` — Server error

A successful response includes `isMatch`. When the action creates a mutual match, the response also includes `matchedProfile`.

### GET /matches

Returns profiles with mutual Like relationships.

Example response:

```json
{
  "success": true,
  "count": 0,
  "matches": []
}
```

### GET /health

Returns the backend health status.

## Matching Logic

A match is created only when:

1. The demo user likes another profile.
2. That profile has already liked the demo user.

A one-sided Like does not create a match.

Passing a profile does not create a match.

Incoming likes are not exposed in the discovery feed.

## Testing

The backend uses Vitest and Supertest for API integration testing.

From the `server` directory:

```bash
npx vitest run
```

Latest verified result:

```text
Test Files  1 passed (1)
Tests       14 passed (14)
```

The integration tests use a separate SQLite database to avoid modifying development data.

## Build Verification

Frontend production build:

```bash
cd client
npm run build
```

Backend TypeScript validation:

```bash
cd server
npx tsc --noEmit
```

Both checks completed successfully during development.

## Responsive Design

The interface has been manually tested using browser device emulation, including:

- iPhone 16
- iPhone 16 Pro Max
- iPhone SE
- Pixel 7
- Pixel 9
- Tablet
- iPad Mini

## Part A — Product Improvement Proposals

See [PART_A.md](./PART_A.md) for two proposed Coy product improvements:

1. Privacy-Preserving Non-User Opt-Out
2. Automatic Slot Recovery

## Notes

- The project uses a single demo user rather than a full authentication system.
- Profiles and incoming likes are preloaded using the seed script.
- Profile photographs are mock assets for demonstration purposes.
- This is a standalone internship assignment prototype, not an official Coy application.
