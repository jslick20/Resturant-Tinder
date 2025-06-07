function requireLogin() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (!user || !token) {
    window.location.href = 'login.html';
    return null;
  }
  return { user, token };
}

async function loadFriends(login) {
  const res = await fetch(`/friends/${encodeURIComponent(login.user)}`, {
    headers: { 'Authorization': login.token }
  });
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
  const login = requireLogin();
  if (!login) return;
  const friendId = document.getElementById('friend-id').value.trim();
  if (!friendId) return;
  const res = await fetch('/friends/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': login.token },
    body: JSON.stringify({ friendId })
  });
  if (res.ok) {
    document.getElementById('status').textContent = 'Friend added';
    loadFriends(login);
  } else {
    document.getElementById('status').textContent = 'Error adding friend';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const login = requireLogin();
  if (login) loadFriends(login);
});
