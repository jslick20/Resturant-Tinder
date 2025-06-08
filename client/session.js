// client/session.js

// Haversine to compute miles
function getDistanceMi(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI/180;
  const R = 6371e3;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2)**2 +
            Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c / 1609.34).toFixed(1);
}

document.addEventListener('DOMContentLoaded', async () => {
  const participantsSelect = document.getElementById('participants');
  const addressInput       = document.getElementById('addressSearch');
  const locateBtn          = document.getElementById('locate-btn');
  const latInput           = document.getElementById('lat');
  const lngInput           = document.getElementById('lng');
  const distInput          = document.getElementById('distanceMiles');
  const statusFilter       = document.getElementById('statusFilter');
  const cuisineInput       = document.getElementById('cuisine');
  const setupForm          = document.getElementById('setup-form');

  const sessionSetup  = document.getElementById('session-setup');
  const swipeDeck     = document.getElementById('swipe-deck');
  const cardContainer = document.getElementById('card-container');
  const likeBtn       = document.getElementById('like-btn');
  const passBtn       = document.getElementById('pass-btn');
  const progressText  = document.getElementById('progress');
  const matchModal    = document.getElementById('match-modal');
  const matchedInfo   = document.getElementById('matched-info');
  const directionsLink= document.getElementById('directions-link');
  const closeModal    = document.getElementById('close-modal');

  // 1) Who am I?
  const me = await fetch('/api/me').then(r => r.json()).catch(_ => null);
  if (!me) return window.location.href = '/';
  const userId = me.username;

  // 2) Load friends
  const friends = await fetch(`/friends/${encodeURIComponent(userId)}`)
    .then(r => r.json())
    .catch(_ => ({ friends: [] }));
  friends.friends.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f; opt.textContent = f;
    participantsSelect.appendChild(opt);
  });

  // 3) Geolocation
  locateBtn.addEventListener('click', () => {
    locateBtn.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(pos => {
      latInput.value = pos.coords.latitude;
      lngInput.value = pos.coords.longitude;
      locateBtn.textContent = '📍 Use My Location';
    }, () => {
      alert('Could not get location');
      locateBtn.textContent = '📍 Use My Location';
    });
  });

  // Session state
  let sessionId, restaurants = [], pointer = 0;
  let userLat, userLng;

  // 4) Start Session (with geocoding if address entered)
  setupForm.addEventListener('submit', async e => {
    e.preventDefault();

    // determine lat/lng
    if (addressInput.value.trim()) {
      const GEOCODE_KEY = 'YOUR_GOOGLE_PLACES_KEY';
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${
          encodeURIComponent(addressInput.value)
        }&key=${GEOCODE_KEY}`
      ).then(r => r.json());
      if (!geoRes.results.length) {
        return alert('Address not found');
      }
      userLat = geoRes.results[0].geometry.location.lat;
      userLng = geoRes.results[0].geometry.location.lng;
    } else if (latInput.value && lngInput.value) {
      userLat = parseFloat(latInput.value);
      userLng = parseFloat(lngInput.value);
    } else {
      return alert('Please enter an address or click Use My Location.');
    }

    const miles  = parseFloat(distInput.value);
    const radius = Math.round(miles * 1609.34);
    const status = statusFilter.value;           // all|open|closed
    const participants = Array
      .from(participantsSelect.selectedOptions)
      .map(o => o.value);
    const cuisine = cuisineInput.value.trim();

    // create session
    const res = await fetch('/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: userId,
        participants,
        lat: userLat,
        lng: userLng,
        radius,
        cuisine
      })
    });
    const data = await res.json();
    sessionId   = data.sessionId;
    restaurants = Array.isArray(data.restaurants)
      ? data.restaurants
      : (data.restaurant ? [data.restaurant] : []);

    // filter by open/closed
    if (status === 'open')   restaurants = restaurants.filter(r => r.open_now);
    if (status === 'closed') restaurants = restaurants.filter(r => !r.open_now);

    pointer = 0;
    sessionSetup.classList.add('hidden');
    swipeDeck.classList.remove('hidden');
    renderCard();
  });

  // 5) Swipe actions
  likeBtn.addEventListener('click', () => handleSwipe(true));
  passBtn.addEventListener('click', () => handleSwipe(false));

  async function handleSwipe(like) {
    if (pointer >= restaurants.length) return;
    const r = restaurants[pointer];
    const result = await fetch(`/sessions/${sessionId}/swipe`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId, restaurantId: r.place_id, like })
    }).then(r => r.json());

    if (result.match) return showMatch(result.restaurant);
    pointer++;
    if (pointer < restaurants.length) renderCard();
    else {
      alert('No more options—back to dashboard.');
      window.location.href = '/dashboard';
    }
  }

  // 6) Render a card
  function renderCard() {
    if (!restaurants.length) {
      cardContainer.innerHTML = `
        <p style="padding:1rem; text-align:center;">
          No restaurants match your filters.<br>
          Try changing distance or status.
        </p>`;
      return;
    }
    const r = restaurants[pointer];
    const dist = getDistanceMi(userLat, userLng, r.location.lat, r.location.lng);
    const badges = (r.types||[]).slice(0,3)
      .map(t => `<span class="badge">${t.replace('_',' ')}</span>`)
      .join(' ');
    const photos = (r.photos||[]).slice(0,3)
      .map(p => `<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${p.photo_reference}&key=YOUR_GOOGLE_PLACES_KEY" alt="Photo">`)
      .join('');

    cardContainer.innerHTML = `
      <div class="card">
        <div>
          <h3>${r.name}</h3>
          ${badges}
          <p class="info">⭐ ${r.rating} (${r.user_ratings_total}) • ${dist} mi • ${r.open_now ? 'Open' : 'Closed'}</p>
          <p>${r.address}</p>
          <div class="photos">${photos}</div>
        </div>
        <div>
          <button class="menu-btn">${r.website ? 'View Menu' : 'Search'}</button>
          <div class="reviews-container">
            <button class="toggle-reviews">Show Reviews</button>
            <div class="reviews">
              ${(r.reviews||[]).map(rv =>
                `<blockquote>"${rv.text}" — <em>${rv.author}</em> (${rv.rating})</blockquote>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    progressText.textContent = `Option ${pointer+1} of ${restaurants.length}`;

    document.querySelector('.menu-btn').onclick = () => {
      const url = r.website
        ? r.website
        : `https://www.google.com/search?q=${encodeURIComponent(r.name + ' ' + r.address)}`;
      window.open(url, '_blank');
    };
    document.querySelector('.toggle-reviews').onclick = () => {
      document.querySelector('.reviews').classList.toggle('open');
    };
  }

  // 7) Show match
  function showMatch(r) {
    matchedInfo.innerHTML = `
      <h4>${r.name}</h4>
      <p>${r.address}</p>
      <p>${getDistanceMi(userLat,userLng,r.location.lat,r.location.lng)} mi</p>
    `;
    directionsLink.href = `https://maps.google.com/?q=${encodeURIComponent(r.name+' '+r.address)}`;
    matchModal.classList.remove('hidden');
  }
  closeModal.addEventListener('click', () => {
    matchModal.classList.add('hidden');
    window.location.href = '/dashboard';
  });
});
