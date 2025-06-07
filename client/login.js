document.getElementById('login').onclick = async () => {
  if (!name) {
    document.getElementById('error').textContent = 'Please enter your name';
    return;
  }
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: name })
    });
    if (!res.ok) throw new Error('login failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
  } catch (err) {
    document.getElementById('error').textContent = 'Login failed';
    localStorage.setItem('user', name);
    window.location.href = 'index.html';
 wxho8g-codex/create-tinder-style-food-swiping-app
  } else {
    document.getElementById('error').textContent = 'Please enter your name';
  }
};

document.getElementById('username').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') document.getElementById('login').click();
});
=======
  }
};
 main
