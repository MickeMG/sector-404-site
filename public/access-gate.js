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
    <div class="access-gate__sigil" aria-hidden="true">
      <video class="access-gate__video" autoplay muted loop playsinline preload="auto">
        <source src="/assets/video/sector-404-symbol.mp4" type="video/mp4" />
      </video>
      <img class="access-gate__wordmark" src="/assets/image/sector-404-access-wordmark.jpg" alt="" />
    </div>
    <div class="access-gate__panel">
      <p class="access-gate__kicker">UNAUTHORIZED MIRROR</p>
      <form class="access-gate__form" autocomplete="off">
        <label for="sector-access-name">IDENTIFY SIGNAL</label>
        <div class="access-gate__row">
          <input id="sector-access-name" name="username" type="text" inputmode="text" autocomplete="off" spellcheck="false" autofocus />
          <button type="submit">ENTER</button>
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
