(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setupGlobalFlashlight = () => {
    let light = document.querySelector('[data-global-flashlight]');
    if (!light) {
      light = document.createElement('div');
      light.className = 'global-flashlight';
      light.setAttribute('data-global-flashlight', '');
      light.setAttribute('aria-hidden', 'true');
      document.body.appendChild(light);
    }

    const setPosition = (clientX, clientY) => {
      light.style.setProperty('--flash-x', `${clientX}px`);
      light.style.setProperty('--flash-y', `${clientY}px`);
    };

    setPosition(window.innerWidth * 0.72, window.innerHeight * 0.38);

    let frame = 0;
    let pendingX = window.innerWidth * 0.72;
    let pendingY = window.innerHeight * 0.38;

    const move = (clientX, clientY) => {
      pendingX = clientX;
      pendingY = clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setPosition(pendingX, pendingY);
        frame = 0;
      });
    };

    document.addEventListener('pointermove', (event) => move(event.clientX, event.clientY), { passive: true });
    document.addEventListener('pointerdown', (event) => move(event.clientX, event.clientY), { passive: true });
    document.addEventListener('touchmove', (event) => {
      const touch = event.touches && event.touches[0];
      if (touch) move(touch.clientX, touch.clientY);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!frame) setPosition(window.innerWidth * 0.72, window.innerHeight * 0.38);
    }, { passive: true });
  };

  setupGlobalFlashlight();

  const setupBootAudio = () => {
    let audio;
    let used = false;

    const source = (() => {
      const script = document.querySelector('script[src$="home-breach.js"]');
      const scriptUrl = script?.getAttribute('src') || '/home-breach.js';
      try {
        return new URL('assets/audio/sector-404-boot.mp3', new URL(scriptUrl, window.location.href)).href;
      } catch (_) {
        return '/assets/audio/sector-404-boot.mp3';
      }
    })();

    const ensure = () => {
      if (!audio) {
        audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = 0.95;
      }
      return audio;
    };

    return () => {
      if (used) return;
      used = true;
      try {
        const a = ensure();
        a.currentTime = 0;
        const playPromise = a.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
      } catch (_) {}
    };
  };

  const playBootAudio = setupBootAudio();
  window.sector404PlayBootAudio = () => {
    try { playBootAudio(); } catch (_) {}
  };

  const root = document.querySelector('[data-breach-home]');
  if (!root) return;

  const boot = root.querySelector('[data-breach-boot]');
  const bootLines = Array.from(root.querySelectorAll('[data-breach-line]'));
  const enter = root.querySelector('[data-breach-enter]');
  const cursor = root.querySelector('[data-breach-cursor]');
  const readout = root.querySelector('[data-breach-readout]');
  const routes = Array.from(document.querySelectorAll('[data-breach-route]'));

  const messages = [
    'route anomaly confirmed',
    'camera feed contradicts floor plan',
    'rpi denial layer unstable',
    'biometric residue found in corridor',
    'three public doors exposed',
    'do not trust the clean version',
  ];

  const setLine = (line, text, delay) => {
    window.setTimeout(() => {
      line.textContent = text;
      line.classList.add('is-visible');
    }, delay);
  };

  let bootStarted = false;
  const finishBoot = () => {
    boot?.classList.add('is-done');
    document.documentElement.classList.remove('sector-login-sequence');
    document.documentElement.classList.add('sector-archive-reveal');
    window.setTimeout(() => document.documentElement.classList.remove('sector-archive-reveal'), 1900);
    document.dispatchEvent(new CustomEvent('sector404:boot-complete'));
  };

  const startBoot = () => {
    if (bootStarted || !boot) return;
    bootStarted = true;
    document.documentElement.classList.add('sector-login-sequence');

    if (reduceMotion) {
      boot.remove();
      finishBoot();
      return;
    }

    playBootAudio();
    boot.classList.add('is-running', 'is-syncing');
    const texts = [
      'syncing dead carrier...',
      'signal contact unstable...',
      'handshake slipping...',
      'booting unauthorized mirror...',
      'decrypting recovered manifest...',
      'access leak stabilized.',
    ];
    bootLines.forEach((line) => {
      line.textContent = '';
      line.classList.remove('is-visible');
    });
    bootLines.forEach((line, index) => setLine(line, texts[index] || 'signal recovered', 220 + index * 360));
    window.setTimeout(() => boot.classList.remove('is-syncing'), 1850);
    window.setTimeout(() => boot.classList.add('is-glitching'), 3300);
    window.setTimeout(() => boot.classList.add('is-blackout'), 3950);
    window.setTimeout(finishBoot, 5050);
  };

  const afterAccess = (callback) => {
    if (document.documentElement.classList.contains('access-granted')) {
      callback();
      return;
    }
    document.addEventListener('sector404:access-granted', callback, { once: true });
  };

  afterAccess(startBoot);

  let messageIndex = 0;
  const updateReadout = (text) => {
    if (!readout) return;
    readout.textContent = text;
    readout.classList.remove('is-glitching');
    void readout.offsetWidth;
    readout.classList.add('is-glitching');
  };

  const ticker = window.setInterval(() => {
    updateReadout(messages[messageIndex % messages.length]);
    messageIndex += 1;
  }, 2300);

  routes.forEach((route) => {
    route.addEventListener('mouseenter', () => updateReadout(route.dataset.breachRoute || 'route selected'));
    route.addEventListener('focusin', () => updateReadout(route.dataset.breachRoute || 'route selected'));
  });

  const moveCursor = (event) => {
    if (!cursor || reduceMotion) return;
    const rect = root.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    cursor.style.setProperty('--mx', `${x}%`);
    cursor.style.setProperty('--my', `${y}%`);
  };

  root.addEventListener('pointermove', moveCursor, { passive: true });
  root.addEventListener('pointerleave', () => {
    if (!cursor) return;
    cursor.style.setProperty('--mx', '72%');
    cursor.style.setProperty('--my', '38%');
  });

  if (enter) {
    enter.addEventListener('click', (event) => {
      event.preventDefault();
      root.classList.add('breach-home--entered');
      window.setTimeout(() => {
        document.querySelector('#access-routes-title')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }, reduceMotion ? 0 : 360);
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(ticker);
  }, { once: true });
})();
