(() => {
  const STORAGE_KEY = 'sector404_player_state';
  const PLAYER_SELECTOR = '[data-sector-player]';
  const playlistUrlFrom = (root) => root?.dataset.playlistUrl || '/assets/audio/julian/playlist.json';

  const state = window.__sector404Player || (window.__sector404Player = {
    audio: new Audio(),
    audio: new Audio(),
    tracks: [],
    index: 0,
    isPlaying: false,
    isReady: false,
    wantsAutoplay: false,
    root: null,
    els: {},
    playlistUrl: '',
  });

  state.audio.preload = 'metadata';
  state.audio.loop = false;

  const filenameFrom = (src = '') => {
    try {
      const url = new URL(src, window.location.href);
      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' ');
    } catch (_) {
      return String(src).split('/').pop()?.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
    }
  };

  const resolveSrc = (src) => {
    try { return new URL(src, window.location.href).href; }
    catch (_) { return src; }
  };

  const normalizeTracks = (payload) => {
    const raw = Array.isArray(payload) ? payload : payload?.tracks;
    return (Array.isArray(raw) ? raw : [])
      .map((track) => typeof track === 'string' ? { src: track } : track)
      .filter((track) => track?.src)
      .map((track) => ({
        title: track.title || filenameFrom(track.src),
        src: track.src,
      }));
  };

  const save = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        index: state.index,
        time: state.audio.currentTime || 0,
        muted: state.audio.muted,
        isPlaying: state.isPlaying,
      }));
    } catch (_) {}
  };

  const restore = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      if (Number.isFinite(stored.index)) state.index = Math.max(0, stored.index);
      if (typeof stored.muted === 'boolean') state.audio.muted = stored.muted;
      if (Number.isFinite(stored.time)) state.audio.dataset.restoreTime = String(stored.time);
      if (stored.isPlaying) state.audio.dataset.restorePlaying = 'true';
    } catch (_) {}
  };

  const setDisabled = (disabled) => {
    const { root, prev, play, next, mute } = state.els;
    [prev, play, next, mute].forEach((button) => {
      if (button) button.disabled = disabled;
    });
    root?.classList.toggle('is-empty', disabled);
  };

  const setStatus = (value) => {
    if (state.els.status) state.els.status.textContent = value;
  };

  const current = () => state.tracks[state.index];

  const render = () => {
    const { root, title, play, mute } = state.els;
    const track = current();
    if (!root || !title || !play || !mute) return;

    if (!track) {
      title.textContent = 'AWAITING JULIAN MP3';
      setStatus('JULIAN_AUDIO // NO SIGNAL');
      play.textContent = '▶';
      play.setAttribute('aria-label', 'Play Julian track');
      play.title = 'Play Julian track';
      mute.textContent = state.audio.muted ? '◎' : '◉';
      mute.setAttribute('aria-label', state.audio.muted ? 'Unmute Julian audio' : 'Mute Julian audio');
      mute.title = state.audio.muted ? 'Unmute Julian audio' : 'Mute Julian audio';
      setDisabled(true);
      return;
    }

    setDisabled(false);
    title.textContent = track.title || filenameFrom(track.src) || 'UNTITLED SIGNAL';
    setStatus(`JULIAN_AUDIO // ${String(state.index + 1).padStart(2, '0')}/${String(state.tracks.length).padStart(2, '0')}`);
    play.textContent = state.isPlaying ? '■' : '▶';
    play.setAttribute('aria-label', state.isPlaying ? 'Stop Julian track' : 'Play Julian track');
    play.title = state.isPlaying ? 'Stop Julian track' : 'Play Julian track';
    mute.textContent = state.audio.muted ? '◎' : '◉';
    mute.setAttribute('aria-label', state.audio.muted ? 'Unmute Julian audio' : 'Mute Julian audio');
    mute.title = state.audio.muted ? 'Unmute Julian audio' : 'Mute Julian audio';
    root.dataset.track = String(state.index + 1);
    save();
  };

  const loadTrack = (nextIndex, autoplay = false, restoreTime = null) => {
    if (!state.tracks.length) return;
    state.index = (nextIndex + state.tracks.length) % state.tracks.length;
    const track = current();
    const src = resolveSrc(track.src);

    if (state.audio.src !== src) {
      state.audio.src = src;
      state.audio.load();
    }

    if (Number.isFinite(restoreTime) && restoreTime > 0) {
      const applyRestore = () => {
        try { state.audio.currentTime = restoreTime; } catch (_) {}
        state.audio.removeEventListener('loadedmetadata', applyRestore);
      };
      if (state.audio.readyState >= 1) applyRestore();
      else state.audio.addEventListener('loadedmetadata', applyRestore);
    }

    state.isPlaying = false;
    render();
    if (autoplay) start();
  };

  const start = async () => {
    const track = current();
    if (!track) return;
    state.wantsAutoplay = true;
    if (!state.audio.src) loadTrack(state.index, false);

    try {
      await state.audio.play();
      state.isPlaying = true;
      render();
    } catch (_) {
      state.isPlaying = false;
      setStatus('JULIAN_AUDIO // CLICK PLAY TO ARM');
      render();
    }
  };

  const armFromAccess = () => {
    state.wantsAutoplay = true;
    state.index = 0;
    try { state.audio.currentTime = 0; } catch (_) {}
    if (state.tracks.length) loadTrack(0, true, 0);
  };

  window.sector404StartJulianArchive = armFromAccess;

  const stop = () => {
    state.wantsAutoplay = false;
    state.audio.pause();
    state.audio.currentTime = 0;
    state.isPlaying = false;
    render();
  };

  const bindRoot = () => {
    const root = document.querySelector(PLAYER_SELECTOR);
    if (!root) return false;

    state.root = root;
    state.els = {
      root,
      title: root.querySelector('[data-player-title]'),
      status: root.querySelector('[data-player-status]'),
      prev: root.querySelector('[data-player-prev]'),
      play: root.querySelector('[data-player-play]'),
      next: root.querySelector('[data-player-next]'),
      mute: root.querySelector('[data-player-mute]'),
    };
    state.playlistUrl = playlistUrlFrom(root);

    state.els.play?.addEventListener('click', () => {
      if (!state.tracks.length) return;
      if (state.isPlaying) stop();
      else start();
    });
    state.els.prev?.addEventListener('click', () => loadTrack(state.index - 1, state.isPlaying || state.wantsAutoplay));
    state.els.next?.addEventListener('click', () => loadTrack(state.index + 1, state.isPlaying || state.wantsAutoplay));
    state.els.mute?.addEventListener('click', () => {
      state.audio.muted = !state.audio.muted;
      render();
    });

    setDisabled(!state.tracks.length);
    render();
    return true;
  };

  const loadPlaylist = async () => {
    const url = state.playlistUrl || playlistUrlFrom(document.querySelector(PLAYER_SELECTOR));
    const response = await fetch(url, { cache: 'no-store' });
    const payload = response.ok ? await response.json() : { tracks: [] };
    state.tracks = normalizeTracks(payload);
    state.index = Math.min(state.index, Math.max(0, state.tracks.length - 1));
    state.isReady = true;

    const restoreTime = parseFloat(state.audio.dataset.restoreTime || '0');
    const restorePlaying = state.audio.dataset.restorePlaying === 'true';
    delete state.audio.dataset.restoreTime;
    delete state.audio.dataset.restorePlaying;
    loadTrack(state.index, false, restoreTime);
    if (restorePlaying) setStatus('JULIAN_AUDIO // PLAY TO RESUME');
    if (state.wantsAutoplay) loadTrack(0, true, 0);
  };

  const softNavigate = async (url, push = true) => {
    const target = new URL(url, window.location.href);
    if (target.origin !== window.location.origin) return false;
    if (!target.pathname.endsWith('/') && !target.pathname.includes('.')) target.pathname += '/';

    try {
      document.documentElement.classList.add('sector-navigating');
      const response = await fetch(target.href, { headers: { 'X-Sector-Navigation': 'soft' } });
      if (!response.ok) return false;
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const incomingMain = doc.querySelector('main');
      const currentMain = document.querySelector('main');
      if (!incomingMain || !currentMain) return false;

      currentMain.innerHTML = incomingMain.innerHTML;
      document.title = doc.title || document.title;
      const description = doc.querySelector('meta[name="description"]')?.content;
      if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      if (push) history.pushState({ sectorSoftNav: true }, '', target.href);
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.dispatchEvent(new CustomEvent('sector404:page-swapped', { detail: { url: target.href } }));
      return true;
    } catch (_) {
      return false;
    } finally {
      document.documentElement.classList.remove('sector-navigating');
    }
  };

  const shouldSoftNavigate = (event, anchor) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.hash && url.pathname === window.location.pathname) return false;
    return true;
  };

  document.addEventListener('click', async (event) => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || !shouldSoftNavigate(event, anchor)) return;
    event.preventDefault();
    const ok = await softNavigate(anchor.href, true);
    if (!ok) window.location.href = anchor.href;
  });

  window.addEventListener('popstate', () => {
    softNavigate(window.location.href, false).then((ok) => {
      if (!ok) window.location.reload();
    });
  });

  state.audio.addEventListener('ended', () => loadTrack(state.index + 1, state.wantsAutoplay || state.isPlaying));
  document.addEventListener('sector404:access-granted', armFromAccess);
  state.audio.addEventListener('play', () => { state.isPlaying = true; render(); });
  state.audio.addEventListener('pause', () => { state.isPlaying = false; render(); });
  state.audio.addEventListener('timeupdate', save);
  state.audio.addEventListener('volumechange', render);

  restore();
  if (!bindRoot()) return;
  loadPlaylist().catch(() => {
    state.tracks = [];
    state.isReady = true;
    render();
  });
})();
