# SplitEasy

A clean, mobile-first Progressive Web App (PWA) for splitting group expenses, a free take on Splitwise. Create a group, add expenses, and see who owes whom.

**Live demo:** https://spliteasy-mf4jn3kth-divyansh271s-projects.vercel.app

## Features

- Sign up and log in with email, password and a display name
- Create a group, or join one using an invite code
- View the member list of each group
- Add expenses and split them between group members
- Automatic balance calculation: see who owes whom
- Settle up between members
- Installable on Android and iOS home screens (PWA)

## Tech Stack

- **Frontend:** <!-- TODO: add your framework, e.g. React + Vite. Check package.json -->
- **Backend / Database / Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Hosting:** Vercel

## Run Locally

```bash
git clone https://github.com/Divyansh271/<repo-name>.git
cd <repo-name>
npm install
```

Create a `.env` file in the project root with your own Supabase credentials:

```
# TODO: match the variable names used in your code
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

Then run the SQL schema in your Supabase project's SQL editor, and start the app:

```bash
npm run dev
```

## How It Works

- Users are authenticated through Supabase Auth.
- Groups, members, expenses and settlements are stored in PostgreSQL tables on Supabase.
- Balances are calculated from the recorded expenses and settlements.

## Author

Divyansh Tyagi, B.Tech Software Engineering, Delhi Technological University

GitHub: [Divyansh271](https://github.com/Divyansh271)
