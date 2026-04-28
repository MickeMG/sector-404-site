(() => {
  const SELECTOR = 'main img[src]:not([src$=".svg"]):not([data-no-inspect])';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let overlay;
  let image;
  let title;
  let meta;
  let status;
  let activeTrigger;
  let titleTimer;

  const filenameFrom = (src) => {
    try {
      const url = new URL(src, window.location.href);
      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || 'recovered-image');
    } catch (_) {
      return String(src).split('/').pop() || 'recovered-image';
    }
  };

  const buildOverlay = () => {
    if (overlay) return overlay;

    overlay = document.createElement('section');
    overlay.className = 'image-inspector';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="image-inspector__shade" data-inspector-close></div>
      <div class="image-inspector__terminal" role="dialog" aria-modal="true" aria-labelledby="image-inspector-title">
        <div class="image-inspector__bar">
          <span class="image-inspector__path" id="image-inspector-title">IMAGE INSPECTOR</span>
          <button class="image-inspector__close" type="button" data-inspector-close aria-label="Close image inspector">ESC</button>
        </div>
        <div class="image-inspector__screen">
          <div class="image-inspector__scan" aria-hidden="true"></div>
          <img class="image-inspector__image" alt="" />
        </div>
        <div class="image-inspector__status">
          <span data-inspector-meta>FILE // UNKNOWN</span>
          <span data-inspector-status>MAGNIFICATION // PASSIVE</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    image = overlay.querySelector('.image-inspector__image');
    title = overlay.querySelector('.image-inspector__path');
    meta = overlay.querySelector('[data-inspector-meta]');
    status = overlay.querySelector('[data-inspector-status]');

    overlay.addEventListener('click', (event) => {
      if (event.target.closest('[data-inspector-close]') || event.target.closest('.image-inspector__image')) close();
    });

    return overlay;
  };

  const describe = (img) => {
    const figure = img.closest('figure');
    const caption = figure?.querySelector('figcaption')?.textContent?.trim().replace(/\s+/g, ' ');
    const frame = figure?.dataset?.frame;
    const alt = img.getAttribute('alt')?.trim();
    const file = filenameFrom(img.currentSrc || img.src);
    return {
      file,
      label: caption || alt || frame || file,
      frame: frame || 'UNREGISTERED_FRAME',
    };
  };

  const typeTitle = (value) => {
    if (!title) return;
    window.clearInterval(titleTimer);
    title.dataset.fullText = value;
    title.textContent = reduceMotion ? value : '';
    title.classList.toggle('is-typing', !reduceMotion);

    if (reduceMotion) return;

    let index = 0;
    titleTimer = window.setInterval(() => {
      index += 1;
      title.textContent = value.slice(0, index);
      if (index >= value.length) {
        window.clearInterval(titleTimer);
        title.classList.remove('is-typing');
      }
    }, 28);
  };

  const open = (img) => {
    if (!img?.src) return;
    buildOverlay();
    activeTrigger = img;
    const info = describe(img);

    typeTitle(`INSPECT // ${info.file}`);
    meta.textContent = `${info.frame} // ${info.label}`;
    status.textContent = 'MAGNIFICATION // ACTIVE // CLICK IMAGE OR ESC TO CLOSE';
    image.src = img.currentSrc || img.src;
    image.alt = img.alt || info.label;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('image-inspector-open');

    if (!reduceMotion) {
      overlay.classList.remove('is-booting');
      void overlay.offsetWidth;
      overlay.classList.add('is-booting');
    }

    overlay.querySelector('.image-inspector__close')?.focus({ preventScroll: true });
  };

  function close() {
    if (!overlay?.classList.contains('is-open')) return;
    window.clearInterval(titleTimer);
    title?.classList.remove('is-typing');
    overlay.classList.remove('is-open', 'is-booting');
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('image-inspector-open');
    const trigger = activeTrigger;
    activeTrigger = null;
    window.setTimeout(() => {
      if (!overlay?.classList.contains('is-open') && image) image.removeAttribute('src');
      trigger?.focus?.({ preventScroll: true });
    }, reduceMotion ? 0 : 180);
  }

  const makeInspectable = (img) => {
    if (!img || img.dataset.inspectReady === 'true') return;
    if (/\.svg(\?|#|$)/i.test(img.getAttribute('src') || '')) return;
    img.dataset.inspectReady = 'true';
    img.classList.add('inspectable-image');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Inspect image: ${describe(img).label}`);

    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(img);
      }
    });
  };

  const scan = (root = document) => root.querySelectorAll(SELECTOR).forEach(makeInspectable);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan(), { once: true });
  } else {
    scan();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(SELECTOR)) makeInspectable(node);
        scan(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
