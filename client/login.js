document.getElementById('login').onclick = () => {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('user', name);
    window.location.href = 'index.html';
  }
};
