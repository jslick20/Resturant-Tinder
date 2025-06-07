import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;

const DB_FILE = './data.json';

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: {}, tokens: {}, sessions: {}, counter: 1 };
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDB();
let sessionCounter = db.counter || 1;

function auth(req, res, next) {
  const token = req.header('Authorization');
  const userId = db.tokens[token];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
}

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
// ----- Authentication -----
app.post('/login', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  db.users[userId] = db.users[userId] || { friends: [] };
  let token = Object.keys(db.tokens).find(t => db.tokens[t] === userId);
  if (!token) {
    token = Math.random().toString(36).slice(2, 10);
    db.tokens[token] = userId;
  }
  saveDB();
  res.json({ token });
});

app.post('/friends/add', auth, (req, res) => {
  const { friendId } = req.body;
  const userId = req.userId;
  if (!friendId) {
    return res.status(400).json({ error: 'Missing friendId' });
  db.users[userId] = db.users[userId] || { friends: [] };
  db.users[friendId] = db.users[friendId] || { friends: [] };
  if (!db.users[userId].friends.includes(friendId)) db.users[userId].friends.push(friendId);
  if (!db.users[friendId].friends.includes(userId)) db.users[friendId].friends.push(userId);
  saveDB();
app.get('/friends/:userId', auth, (req, res) => {
  if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
  const list = db.users[userId]?.friends || [];
app.post('/sessions', auth, async (req, res) => {
  const { participants = [], lat, lng, radius, cuisine = '' } = req.body;
  const host = req.userId;
  if (!lat || !lng) {
  db.sessions[id] = {
  db.counter = sessionCounter;
  saveDB();
app.post('/sessions/:id/swipe', auth, (req, res) => {
  const { restaurantId, like } = req.body;
  const userId = req.userId;
  const session = db.sessions[id];
  if (!session || !restaurantId) {
  saveDB();
    res.json(sorted);
 main
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
