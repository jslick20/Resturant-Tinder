 0fomhj-codex/create-tinder-style-food-swiping-app
=======

 main
document.getElementById('login').onclick = () => {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('user', name);
    window.location.href = 'index.html';
 0fomhj-codex/create-tinder-style-food-swiping-app
=======
 wxho8g-codex/create-tinder-style-food-swiping-app
 main
  } else {
    document.getElementById('error').textContent = 'Please enter your name';
  }
};

document.getElementById('username').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') document.getElementById('login').click();
});
 0fomhj-codex/create-tinder-style-food-swiping-app
=======
=======
  }
};
 main
 main
