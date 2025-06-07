let restaurants = [];
let current = 0;
let sessionId = null;

function requireLogin() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (!user || !token) {
    window.location.href = 'login.html';
    return null;
  }
  document.getElementById('user').textContent = `Logged in as ${user}`;
  return { user, token };
}

async function loadRestaurants() {
  const params = new URLSearchParams({
    lat: 40.730610, // example coordinates (NYC)
    lng: -73.935242,
    radius: 5000
  });
  try {
    const login = requireLogin();
    if (!login) return;
    const start = await fetch('/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': login.token
      },
      body: JSON.stringify({ lat: 40.730610, lng: -73.935242, radius: 5000 })
    });
    if (!start.ok) throw new Error('session failed');
    const data = await start.json();
    sessionId = data.id;
    restaurants = data.restaurants;
    current = 0;
    showRestaurant();
  } catch (err) {
    document.getElementById('card').textContent = 'Failed to load restaurants';
  }
}

function showRestaurant() {
  const card = document.getElementById('card');
  if (current >= restaurants.length) {
    card.textContent = 'No more restaurants';
    return;
  }
  const r = restaurants[current];
  card.innerHTML = `<h3>${r.name}</h3><p>${r.vicinity || ''}</p><p>Rating: ${r.rating}</p>`;
}

    if (sessionId && restaurants[current]) {
      const token = localStorage.getItem('token');
      fetch(`/sessions/${sessionId}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ restaurantId: restaurants[current].place_id, like: dir === 'right' })
      }).catch(()=>{});
    }
 wxho8g-codex/create-tinder-style-food-swiping-app
function swipe(dir) {
  const card = document.getElementById('card');
  card.classList.add(dir === 'right' ? 'swipe-right' : 'swipe-left');
  card.addEventListener('transitionend', () => {
    card.className = 'card';
    current++;
    showRestaurant();
  }, { once: true });
}

document.getElementById('like').onclick = () => swipe('right');
document.getElementById('skip').onclick = () => swipe('left');
=======
document.getElementById('like').onclick = () => {
  current++;
  showRestaurant();
};

document.getElementById('skip').onclick = () => {
  current++;
  showRestaurant();
};
 main

document.addEventListener('DOMContentLoaded', () => {
  if (requireLogin()) {
    loadRestaurants();
  }
});
