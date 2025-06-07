let restaurants = [];
let current = 0;

function requireLogin() {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  document.getElementById('user').textContent = `Logged in as ${user}`;
  return user;
}

async function loadRestaurants() {
  const params = new URLSearchParams({
    lat: 40.730610, // example coordinates (NYC)
    lng: -73.935242,
    radius: 5000
  });
  try {
    const res = await fetch(`/restaurants?${params}`);
    if (!res.ok) throw new Error('request failed');
    restaurants = await res.json();
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
