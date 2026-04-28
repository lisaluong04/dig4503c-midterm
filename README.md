# Eeveelution Popularity Tracker

## Project Plan

My midterm project will allow users to choose who their favorite Pokemon eeveelution is and write a comment about them. As more users submit their thoughts, there will be a live tracker that displays the top three most popular eeveelutions.

## Features

- User login function
- Allow user to create/edit/delete a submission
- Search or filter for a certain eeveelution
- Sort submissions by popularity
- Allow user to "like" other user's submissions
- Display live popularity tracker
- Settings allows users to set profile picture and display name

## Techstack

- Built using Claude Code in VSCode with HTML and TypeScript
- GitHub for version control
- Deployed using Netlify
- Neon for database

## Instructions for running locally

### Environment Variable

Create a `.env` file in the project root (it's already in `.gitignore` so it won't be committed):

```
NETLIFY_DATABASE_URL=postgresql://user:password@host:5432/dbname
```

This is the connection string for your Neon/Postgres database. You can find it in the Netlify dashboard under **Site configuration → Environment variables**, or directly from your database provider.

### Running migrations

After cloning and running `npm install`, run:

```bash
npm run db:migrate
```

This applies any pending migrations from the `migrations/` folder to the database. It needs to be run once on first setup and again any time the schema changes.

### Full local setup sequence

```bash
npm install
# add your .env with NETLIFY_DATABASE_URL
npm run db:migrate
netlify dev
```

## Wk 12 Updates

- Add settings page
- Allow user to change profile picture and display name
- Create two columns on review.html to separate tracker and filters from posts

## Wk 15 Updates

- Added features to settings page
- Allow user to change password and delete account
- Display all users that liked the post
- Left column scrolls with the review.html page
- Mobile responsive