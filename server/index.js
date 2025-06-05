import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
