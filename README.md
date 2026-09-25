# Hassan Fitness — React + Firebase

Upgraded fitness app with:

- **Real countdown timer** on every exercise (auto-starts from the exercise target; presets 30/45/60/90s)
- **AI Fitness Coach** (works offline with built-in answers; optional `/api/fitness-ai` for live LLM)
- **3D-style buttons** (Home, Train, AI, Progress, Profile, cards, CTAs)
- **Sign up** with **username**, **phone**, **Gmail**, and **password**
- **Unique usernames** enforced via Firestore `usernames/{usernameLower}`

## Setup

1. Install Node.js (18+).
2. In this folder:

```bash
npm install
npm run dev
```

3. Firebase console:
   - Enable **Email/Password** Authentication
   - Create a **Firestore** database
   - Publish the rules in `firestore.rules`

## Account fields (sign up)

| Field    | Rule                                      |
|----------|-------------------------------------------|
| Username | 3–24 chars, letters/numbers/`_`, unique   |
| Phone    | Required                                  |
| Email    | Gmail or any email (Firebase Auth)        |
| Password | Min 6 characters                          |

User profile is stored at `users/{uid}`.  
Username claims live at `usernames/{lowercaseUsername}`.

## AI coach

- Client calls `POST /api/fitness-ai` with chat messages.
- If that route is missing (local Vite), the app uses a **built-in fitness coach** so questions still work.
- On Vercel, add a serverless function at `api/fitness-ai` that returns `{ answer: "..." }`.

## Deploy (Vercel)

1. Push to GitHub and import the project.
2. No extra env vars required if you keep the config in `src/firebase.js` (or move secrets to `VITE_*` env vars for production).
3. Deploy Firestore rules from the Firebase console.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run preview` — preview production build
