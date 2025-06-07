# Server

Simple Express server that queries Google Places to return top three restaurants for a given cuisine and radius.

## Usage

1. Install dependencies with `npm install`.
2. Create a `.env` file containing your `GOOGLE_PLACES_KEY`.
3. Start the server using `node index.js`.

The API endpoint `/restaurants` expects `lat`, `lng`, `radius`, and optional `cuisine` query parameters.

### Additional Endpoints

- `POST /friends/add` — Add two users as friends. Body should contain `userId` and `friendId`.
- `GET /friends/:userId` — Retrieve a user's friend list.
- `POST /sessions` — Create a new swiping session. Body includes `host`, optional `participants`, `lat`, `lng`, and cuisine info. Returns a session ID and top restaurants.
- `POST /sessions/:id/swipe` — Record a user's swipe. Responds with `{ match: true }` when everyone likes the same restaurant.
