const form = document.getElementById('login-form');
const errorEl = document.getElementById('error');
const btn = document.getElementById('login-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Loggar in…';
  try {
    const res = await fetch('api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    if (res.ok) {
      location.href = 'admin.html';
      return;
    }
    errorEl.textContent = 'Fel användarnamn eller lösenord.';
  } catch (err) {
    errorEl.textContent = 'Kunde inte nå servern.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Logga in';
  }
});
