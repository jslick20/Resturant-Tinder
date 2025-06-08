import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import querystring from 'querystring';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this!',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve static client files
app.use(express.static(path.join(__dirname, '..', 'client'), { index: false }));

const PORT = process.env.PORT || 3000;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;
if (!GOOGLE_KEY) {
  console.error('⚠️ Please set GOOGLE_PLACES_KEY in .env');
  process.exit(1);
}

// User persistence
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
let userList = [];
if (fs.existsSync(USERS_FILE)) {
  try { userList = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { userList = []; }
}
function saveUsers() {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(userList, null, 2), 'utf8');
}

// In-memory sessions
const sessions = {};
let sessionCounter = 1;

// Fetch restaurants and details
async function fetchTopRestaurants({ lat, lng, radius = 5000, cuisine = '', maxResults = 20 }) {
  const nearbyRes = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
    params: { key: GOOGLE_KEY, location: `${lat},${lng}`, radius, type: 'restaurant', keyword: cuisine }
  });
  const top = (nearbyRes.data.results || [])
    .filter(r => typeof r.rating === 'number')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, maxResults);

  return Promise.all(top.map(async r => {
    try {
      const detRes = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          key: GOOGLE_KEY,
          place_id: r.place_id,
          fields: [
            'place_id','name','formatted_address','rating','user_ratings_total',
            'opening_hours','types','website','photos','geometry','reviews'
          ].join(',')
        }
      });
      const d = detRes.data.result;
      return {
        place_id: d.place_id,
        name: d.name,
        address: d.formatted_address,
        rating: d.rating,
        user_ratings_total: d.user_ratings_total,
        open_now: d.opening_hours?.open_now,
        types: d.types || [],
        website: d.website || null,
        photos: d.photos || [],
        location: d.geometry.location,
        reviews: (d.reviews || []).slice(0,3).map(rv => ({
          author: rv.author_name,
          text: rv.text,
          rating: rv.rating
        }))
      };
    } catch {
      return {
        place_id: r.place_id,
        name: r.name,
        address: r.vicinity,
        rating: r.rating,
        user_ratings_total: r.user_ratings_total || 0,
        open_now: r.opening_hours?.open_now || false,
        types: r.types || [],
        website: null,
        photos: [],
        location: r.geometry.location,
        reviews: []
      };
    }
  }));
}

// Proxy Geocoding
app.get('/api/geocode', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });
  try {
    const geo = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: GOOGLE_KEY }
    });
    res.json(geo.data);
  } catch {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// Proxy Photo
app.get('/api/photo', (req, res) => {
  const { photoreference, maxwidth = 200 } = req.query;
  if (!photoreference) return res.status(400).send('photoreference required');
  const qs = querystring.stringify({ photoreference, maxwidth, key: GOOGLE_KEY });
  res.redirect(`https://maps.googleapis.com/maps/api/place/photo?${qs}`);
});

// --- Authentication Routes ---

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '..', 'client', 'login.html'));
});

app.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '..', 'client', 'signup.html'));
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (userList.some(u => u.email === email)) return res.redirect('/?error=exists');
  userList.push({ username, email, password }); saveUsers();
  req.session.user = { username, email };
  req.session.showTutorial = true;
  res.redirect('/dashboard');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = userList.find(u => u.email === email && u.password === password);
  if (!user) return res.redirect('/?error=invalid');
  req.session.user = { username: user.username, email };
  req.session.showTutorial = false;
  res.redirect('/dashboard');
});

app.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const tutorialPage = path.join(__dirname, '..', 'client', 'dashboard_tutorial.html');
  const dashPage     = path.join(__dirname, '..', 'client', 'dashboard.html');
  if (req.session.showTutorial) {
    req.session.showTutorial = false;
    return res.sendFile(tutorialPage);
  }
  res.sendFile(dashPage);
});

// Current user API
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ username: req.session.user.username });
});

// Restaurants endpoint
app.get('/restaurants', async (req, res) => {
  const { lat, lng, radius, cuisine } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat & lng required' });
  try {
    const list = await fetchTopRestaurants({ lat, lng, radius, cuisine });
    res.json(list);
  } catch {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Friends (stubbed)
app.post('/friends/add', (req, res) => res.json({ ok: true }));
app.get('/friends/:userId', (req, res) => res.json({ friends: [] }));

// Sessions
app.post('/sessions', async (req, res) => {
  const { host, participants = [], lat, lng, cuisine } = req.body;
  if (!host || !lat || !lng) return res.status(400).json({ error: 'host, lat, lng required' });
  const id = `s${sessionCounter++}`;
  const restaurants = await fetchTopRestaurants({ lat, lng, cuisine });
  sessions[id] = { users: [host, ...participants], restaurants, swipes: {}, pointer: 0 };
  res.json({ sessionId: id, restaurants });
});

app.post('/sessions/:id/swipe', (req, res) => {
  const { id } = req.params;
  const { userId, restaurantId, like } = req.body;
  const sess = sessions[id];
  if (!sess) return res.status(404).json({ error: 'session not found' });
  const resto = sess.restaurants[sess.pointer];
  sess.swipes[userId] ||= {};
  sess.swipes[userId][resto.place_id] = like;
  const match = like && sess.users.every(u => sess.swipes[u]?.[resto.place_id]);
  if (match) return res.json({ match: true, restaurant: resto });
  sess.pointer++;
  res.json({ match: false, restaurant: sess.restaurants[sess.pointer] || null });
});

// Launch server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
