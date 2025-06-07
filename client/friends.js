function requireLogin() {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

async function loadFriends(user) {
  const res = await fetch(`/friends/${encodeURIComponent(user)}`);
  const data = await res.json();
  const list = document.getElementById('list');
  list.innerHTML = '';
  for (const f of data.friends || []) {
    const li = document.createElement('li');
    li.textContent = f;
    list.appendChild(li);
  }
}

document.getElementById('add').onclick = async () => {
  const user = requireLogin();
  if (!user) return;
  const friendId = document.getElementById('friend-id').value.trim();
  if (!friendId) return;
  const res = await fetch('/friends/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user, friendId })
  });
  if (res.ok) {
    document.getElementById('status').textContent = 'Friend added';
    loadFriends(user);
  } else {
    document.getElementById('status').textContent = 'Error adding friend';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (user) loadFriends(user);
});
