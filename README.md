# Restaurant Tinder

A simple prototype for a group-based restaurant selection app inspired by Tinder-style swiping. Users can create sessions with friends, swipe through restaurant options, and match on where to eat.

## Features

- **Group Sessions**: Invite friends to swipe together. Everyone in the session must swipe on each restaurant.
- **Location Search**: Users set a location and distance radius. The backend queries Google Places for restaurants within this radius.
- **Top Rated**: For each cuisine or food genre, only the top three restaurants (based on Google ratings) are returned.
- **Swipe to Match**: When all participants swipe "like" on the same restaurant, everyone is notified of the match.
- **Friends List**: Add friends so you can quickly create new swiping sessions.
- **Sessions API**: Backend endpoints to manage friends and create swiping sessions.

## Project Structure

```
server/   # Node.js + Express backend
client/   # Front‑end app (React or React Native)
```

### Backend (`server`)

The server exposes an API endpoint `/restaurants` that accepts query parameters for latitude, longitude, radius, and cuisine type. It uses the Google Places API to fetch restaurants and returns the three with the highest ratings.

### Front‑end (`client`)

A lightweight HTML/JavaScript interface is included in `client/index.html`. It fetches restaurants from the server and lets you like or skip each option. Start by opening `client/login.html` in your browser; after entering a user name you will be taken to the swiping interface.

## Getting Started

1. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file in `server/` with your Google Places API key:
   ```
   GOOGLE_PLACES_KEY=your_api_key_here
   ```
3. Start the server:
   ```bash
   node index.js
   ```
4. The front‑end can be implemented with your choice of framework (React, React Native, etc.).

### API Overview

- `GET /restaurants` - Fetch top restaurants for a location.
- `POST /friends/add` - Add two users as friends.
- `GET /friends/:userId` - Get a user's friends.
- `POST /sessions` - Start a session and retrieve restaurants.
- `POST /sessions/:id/swipe` - Submit a swipe; returns a match flag when all participants like the same place.

This is a minimal starting point. Feel free to extend it with user accounts, persistent storage, and real‑time updates.
