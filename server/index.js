import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;

// simple in-memory store for friends and sessions
const users = {}; // userId -> Set of friendIds
const sessions = {}; // sessionId -> { users: [], restaurants: [], swipes: {} }
let sessionCounter = 1;

async function fetchTopRestaurants({ lat, lng, radius = 5000, cuisine = '' }) {
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const params = {
    key: GOOGLE_KEY,
    location: `${lat},${lng}`,
    radius,
    type: 'restaurant',
    keyword: cuisine
  };
  const { data } = await axios.get(url, { params });
  return (data.results || [])
    .filter(r => r.rating)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

// Basic endpoint to fetch top 3 restaurants for a cuisine within radius
app.get('/restaurants', async (req, res) => {
  const { lat, lng, radius = 5000, cuisine = '' } = req.query;
  if (!GOOGLE_KEY || !lat || !lng) {
    return res.status(400).json({ error: 'Missing parameters or API key' });
  }

  try {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = {
      key: GOOGLE_KEY,
      location: `${lat},${lng}`,
      radius,
      type: 'restaurant',
      keyword: cuisine
    };
    const { data } = await axios.get(url, { params });
    const sorted = (data.results || [])
      .filter(r => r.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// ----- Friends -----
app.post('/friends/add', (req, res) => {
  const { userId, friendId } = req.body;
  if (!userId || !friendId) {
    return res.status(400).json({ error: 'Missing userId or friendId' });
  }
  users[userId] = users[userId] || new Set();
  users[friendId] = users[friendId] || new Set();
  users[userId].add(friendId);
  users[friendId].add(userId);
  res.json({ ok: true });
});

app.get('/friends/:userId', (req, res) => {
  const { userId } = req.params;
  const list = Array.from(users[userId] || []);
  res.json({ friends: list });
});

// ----- Sessions -----
app.post('/sessions', async (req, res) => {
  const { host, participants = [], lat, lng, radius, cuisine = '' } = req.body;
  if (!host || !lat || !lng) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = `s${sessionCounter++}`;
  const restaurants = await fetchTopRestaurants({ lat, lng, radius, cuisine });
  sessions[id] = {
    users: [host, ...participants],
    restaurants,
    swipes: {}
  };
  res.json({ id, restaurants });
});

app.post('/sessions/:id/swipe', (req, res) => {
  const { id } = req.params;
  const { userId, restaurantId, like } = req.body;
  const session = sessions[id];
  if (!session || !userId || !restaurantId) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  session.swipes[userId] = session.swipes[userId] || {};
  session.swipes[userId][restaurantId] = like;

  // check for match
  const allLiked = session.users.every(u => session.swipes[u] && session.swipes[u][restaurantId]);
  const match = allLiked && like;
  res.json({ match });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
