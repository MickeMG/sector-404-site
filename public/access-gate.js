(() => {
  const allowedUsers = [
    'micke',
    'mickemg',
    'noodle',
    'kim',
    'darko',
    'rachell',
    'julian',
  ];

  const normalize = (value) => value.trim().toLowerCase().replace(/^@+/, '');
  const storageKey = 'sector404_access_user';
  try {
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  } catch (_) {}

  document.documentElement.classList.add('access-locked');

  const gate = document.createElement('section');
  gate.className = 'access-gate';
  gate.setAttribute('aria-label', 'Sector 404 access gate');
  gate.innerHTML = `
    <div class="access-gate__panel">
      <p class="access-gate__kicker">RPI DENIAL LAYER // UNAUTHORIZED MIRROR</p>
      <h1>SECTOR 404</h1>
      <p class="access-gate__copy">This access point is not public yet. Identify yourself to continue.</p>
      <form class="access-gate__form" autocomplete="off">
        <label for="sector-access-name">Username</label>
        <div class="access-gate__row">
          <input id="sector-access-name" name="username" type="text" inputmode="text" autocomplete="off" spellcheck="false" autofocus />
          <button type="submit">Enter</button>
        </div>
        <p class="access-gate__error" role="status" aria-live="polite"></p>
      </form>
      <p class="access-gate__trace">TRACE STATUS: WAITING FOR KNOWN SIGNAL</p>
    </div>
  `;

  document.body.appendChild(gate);

  const form = gate.querySelector('form');
  const input = gate.querySelector('input');
  const error = gate.querySelector('.access-gate__error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = normalize(input.value);

    if (allowedUsers.includes(username)) {
      if (window.sector404PlayBootAudio) window.sector404PlayBootAudio();
      if (window.sector404StartJulianArchive) window.sector404StartJulianArchive();
      try {
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
      } catch (_) {}
      document.documentElement.classList.remove('access-locked');
      document.documentElement.classList.add('access-granted');
      document.dispatchEvent(new CustomEvent('sector404:access-granted', { detail: { username } }));
      gate.classList.add('access-gate--opening');
      setTimeout(() => gate.remove(), 420);
      return;
    }

    error.textContent = 'ACCESS DENIED // SIGNAL NOT FOUND';
    gate.classList.remove('access-gate--denied');
    void gate.offsetWidth;
    gate.classList.add('access-gate--denied');
    input.select();
  });
})();
