# 🏃 Runova

*A running coach that turns your race goal into a week-by-week training plan, then tracks how you actually run it.*

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

You tell Runova what you're training for — a 5K, 10K, half marathon, marathon, or a custom goal — how many days a week you can run, and, optionally, your race date, goal time, personal best, and any injury history. It hands that to OpenAI's `gpt-4o` with a running-coach prompt and gets back a structured plan: a progressive block of weeks that follows the 10% rule for mileage increases, mixes easy runs, long runs, tempo, intervals, and recovery/rest days, and tapers into race day.

Plan length is fixed by the goal — 8 weeks for a 5K, 10 for a 10K, 12 for a half, 16 for a marathon, 12 for custom. If you give a race date, the plan counts backward from it so the taper lands on the right day; otherwise it starts today. The model returns JSON (weekly schedules plus an `ai_recommendations` note), and every scheduled workout is also written out as an individual log row so the calendar and the plan stay in sync.

The dashboard shows the current week as a seven-day grid with a progress bar (workouts completed vs. total). Opening a day lets you log what you actually did — distance, duration, effort level (easy through very hard), and notes — or skip it. Distances round to the nearest 0.5 to avoid the model spitting out things like 5.23. Editing a plan's details updates the metadata without regenerating the AI schedule, and deleting a plan leaves your past workout logs intact.

## 📏 Units

Every plan carries its own `distance_unit` (kilometers or miles), seeded from a per-user `unit_preference` on your profile. The AI is told which unit to work in, and the app formats and stores distances accordingly — so a plan built in miles stays in miles even if you later switch your default.

## 🛠️ Stack

Next.js 16 with React 19 and the app router, TypeScript, and Tailwind. Supabase handles Postgres and email auth, with three tables — `profiles`, `training_plans`, and `workout_logs` — each locked down by row-level security so you only ever see your own data. Plans are generated through a small set of API routes (`generate-plan`, `update-plan`, `delete-plan`); date math is handled by date-fns.

A personal project, and a work in progress — the schema arrived in a few passes, which is why the repo carries several migration SQL files alongside the base schema.
