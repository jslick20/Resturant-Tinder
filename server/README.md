# Server

Simple Express server that queries Google Places to return top three restaurants for a given cuisine and radius.

## Usage

1. Install dependencies with `npm install`.
2. Create a `.env` file containing your `GOOGLE_PLACES_KEY`.
3. Start the server using `node index.js`.

The API endpoint `/restaurants` expects `lat`, `lng`, `radius`, and optional `cuisine` query parameters.
