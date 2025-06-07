document.getElementById('login').onclick = () => {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('user', name);
    window.location.href = 'index.html';
  } else {
    document.getElementById('error').textContent = 'Please enter your name';
  }
};

document.getElementById('username').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') document.getElementById('login').click();
});
