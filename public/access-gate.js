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
    <div class="access-gate__rpi-frame" aria-hidden="true">
      <div class="access-gate__systembar">
        <span>RACHELL POST INDUSTRIES // AUTHORIZED TERMINAL</span>
        <span>PUBLIC NODE: DENIED</span>
        <span>SESSION: MONITORED</span>
      </div>
      <div class="access-gate__sigil">
        <video class="access-gate__video" autoplay muted loop playsinline preload="auto">
          <source src="/assets/video/sector-404-symbol.mp4" type="video/mp4" />
        </video>
        <img class="access-gate__wordmark" src="/assets/image/sector-404-access-wordmark.jpg" alt="" />
      </div>
      <div class="access-gate__official">
        <span>RPI SECURE ACCESS NODE</span>
        <span>ARCHIVE CLASS: RESTRICTED</span>
        <span>INTEGRITY: COMPROMISED</span>
      </div>
    </div>
    <div class="access-gate__panel">
      <p class="access-gate__kicker">JULIAN INJECTION // UNREGISTERED PORTAL</p>
      <p class="access-gate__warning">OFFICIAL TERMINAL OVERRIDE DETECTED — A FOREIGN ROUTE HAS BEEN WRITTEN THROUGH THE RPI WALL.</p>
      <form class="access-gate__form" autocomplete="off">
        <label for="sector-access-name">ENTER FOUND SIGNAL</label>
        <div class="access-gate__row">
          <input id="sector-access-name" name="username" type="text" inputmode="text" autocomplete="off" spellcheck="false" autofocus placeholder="KNOWN SIGNAL" />
          <button type="submit">BREACH</button>
        </div>
        <p class="access-gate__error" role="status" aria-live="polite"></p>
      </form>
      <p class="access-gate__trace">TRACE STATUS: OFFICIAL CHANNEL SPOOFED // JULIAN HANDSHAKE LISTENING</p>
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
