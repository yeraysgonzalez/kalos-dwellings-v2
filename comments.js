(() => {
  const STORAGE_KEY = 'kalos-v2-comments';
  const AUTHOR_KEY = 'kalos-v2-comment-author';

  const ICON_PENCIL = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.2 5.2 18.8 9.8M4 20l1.2-5.4L16.6 3.2a2.1 2.1 0 0 1 3 0l1.2 1.2a2.1 2.1 0 0 1 0 3L8.4 19.8 4 20Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M12.8 6.6 17.4 11.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const ICON_LIST = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7h11M8 12h11M8 17h11M5 7h.01M5 12h.01M5 17h.01" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/></svg>`;

  let placing = false;
  let panelOpen = false;
  let toolsOpen = false;
  let openId = null;
  let draft = null;

  const state = {
    root: null,
    layer: null,
    fab: null,
    badge: null,
    banner: null,
    panel: null,
    backdrop: null,
    list: null,
  };

  function uid() {
    return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function pageFile() {
    const file = (location.pathname.split('/').pop() || 'index.html');
    return file.endsWith('.html') ? file : 'index.html';
  }

  function pageKey() {
    const file = pageFile();
    const p = new URLSearchParams(location.search);
    const keep = ['step', 'property', 'saved'];
    const q = keep.filter((k) => p.get(k)).map((k) => `${k}=${p.get(k)}`).join('&');
    return q ? `${file}?${q}` : file;
  }

  function pageLabel(key = pageKey()) {
    const [file, query = ''] = key.split('?');
    const p = new URLSearchParams(query);
    if (file === 'index.html') return 'Homepage';
    if (file === 'property-management.html') return 'Property Management';
    if (file === 'booking.html') {
      const step = p.get('step') || 'results';
      const property = p.get('property');
      if (p.get('saved') === '1') return 'Favorites';
      if (step === 'detail' && property) return `Property · ${property}`;
      if (step === 'history') return 'Recently viewed';
      return 'Book Now · Search';
    }
    return key;
  }

  function loadComments() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function saveComments(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function getAuthor() {
    return (localStorage.getItem(AUTHOR_KEY) || '').trim();
  }

  function setAuthor(name) {
    localStorage.setItem(AUTHOR_KEY, name.trim());
  }

  function docSize() {
    const el = document.documentElement;
    const body = document.body;
    return {
      w: Math.max(el.scrollWidth, body.scrollWidth, el.clientWidth),
      h: Math.max(el.scrollHeight, body.scrollHeight, el.clientHeight),
    };
  }

  function ensureRoot() {
    if (state.root) return;

    document.body.classList.add('kc-annotate-root');

    // Layer lives on the document (not fixed UI) so pins scroll with the page
    const layer = document.createElement('div');
    layer.className = 'kc-layer';
    layer.setAttribute('data-kc-layer', '');
    layer.hidden = true;
    document.body.appendChild(layer);

    const root = document.createElement('div');
    root.className = 'kc-root';
    root.innerHTML = `
      <div class="kc-backdrop" data-kc-backdrop hidden></div>
      <aside class="kc-panel" data-kc-panel aria-hidden="true">
        <div class="kc-panel-head">
          <div class="kc-panel-head-copy">
            <h2>Review comments</h2>
            <label>
              <span class="sr-only">Pages with comments</span>
              <select class="kc-page-select" data-kc-page-select aria-label="Pages with comments"></select>
            </label>
          </div>
          <button type="button" class="kc-close" data-kc-close-panel aria-label="Close panel">×</button>
        </div>
        <div class="kc-panel-list" data-kc-list></div>
      </aside>
      <div class="kc-dock">
        <button type="button" class="kc-tab" data-kc-tab aria-expanded="false" aria-controls="kcTools">
          Comment mode
        </button>
        <div class="kc-tools" id="kcTools" data-kc-tools hidden>
          <div class="kc-banner" data-kc-banner hidden>
            <strong>Comment mode</strong>
            Click anywhere on the page to drop a pin. Press Esc to exit.
          </div>
          <div class="kc-fab-row">
            <button type="button" class="kc-fab-side" data-kc-open-panel aria-label="Open comments panel" title="Review comments">${ICON_LIST}</button>
            <button type="button" class="kc-fab" data-kc-toggle aria-label="Add a comment" title="Add a comment">
              ${ICON_PENCIL}
              <span class="kc-badge" data-kc-badge hidden>0</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    state.root = root;
    state.layer = layer;
    state.backdrop = root.querySelector('[data-kc-backdrop]');
    state.panel = root.querySelector('[data-kc-panel]');
    state.list = root.querySelector('[data-kc-list]');
    state.fab = root.querySelector('[data-kc-toggle]');
    state.panelBtn = root.querySelector('[data-kc-open-panel]');
    state.badge = root.querySelector('[data-kc-badge]');
    state.banner = root.querySelector('[data-kc-banner]');
    state.tab = root.querySelector('[data-kc-tab]');
    state.tools = root.querySelector('[data-kc-tools]');
    state.pageSelect = root.querySelector('[data-kc-page-select]');

    state.tab.addEventListener('click', () => setToolsOpen(!toolsOpen));
    state.fab.addEventListener('click', () => setPlacing(!placing));
    state.panelBtn.addEventListener('click', () => setPanel(true));
    root.querySelector('[data-kc-close-panel]').addEventListener('click', () => setPanel(false));
    state.backdrop.addEventListener('click', () => setPanel(false));
    state.layer.addEventListener('click', onLayerClick);
    state.pageSelect.addEventListener('change', onPageSelectChange);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (draft) cancelDraft();
        else if (openId) { openId = null; render(); }
        else if (placing) setPlacing(false);
        else if (panelOpen) setPanel(false);
        else if (toolsOpen) setToolsOpen(false);
      }
    });
  }

  function setToolsOpen(on, opts = {}) {
    toolsOpen = on;
    state.tools.hidden = !on;
    state.tab.classList.toggle('is-open', on);
    state.tab.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (!on) {
      if (placing) {
        placing = false;
        document.body.classList.remove('kc-placing');
        state.fab.classList.remove('is-on');
        state.banner.hidden = true;
        draft = null;
      }
      if (panelOpen) {
        panelOpen = false;
        state.panel.classList.remove('is-open');
        state.panel.setAttribute('aria-hidden', 'true');
        state.backdrop.classList.remove('is-open');
        state.backdrop.hidden = true;
        state.panelBtn.classList.remove('is-on');
      }
      openId = null;
      render();
      return;
    }
    // Opening Comment mode: pencil is active by default unless restoring the review panel
    if (opts.panel) {
      setPanel(true);
      return;
    }
    setPlacing(true);
  }

  function setPlacing(on) {
    placing = on;
    document.body.classList.toggle('kc-placing', placing);
    state.fab.classList.toggle('is-on', placing);
    state.banner.hidden = !placing;
    if (placing) {
      openId = null;
      if (panelOpen) {
        panelOpen = false;
        state.panel.classList.remove('is-open');
        state.panel.setAttribute('aria-hidden', 'true');
        state.backdrop.classList.remove('is-open');
        state.backdrop.hidden = true;
        state.panelBtn.classList.remove('is-on');
      }
      // Name is collected in the composer — avoid blocking prompt() so clicks work immediately
    } else {
      draft = null;
    }
    render();
  }

  function setPanel(on) {
    panelOpen = on;
    state.panel.classList.toggle('is-open', on);
    state.panel.setAttribute('aria-hidden', on ? 'false' : 'true');
    state.backdrop.classList.toggle('is-open', on);
    state.backdrop.hidden = !on;
    state.panelBtn.classList.toggle('is-on', on);
    if (on) {
      placing = false;
      document.body.classList.remove('kc-placing');
      state.fab.classList.remove('is-on');
      state.banner.hidden = true;
      cancelDraft();
      renderPanel();
    }
    render();
  }

  function pageComments(key = pageKey()) {
    return loadComments()
      .filter((c) => c.page === key)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function pagesWithComments() {
    const map = new Map();
    loadComments().forEach((c) => {
      if (!map.has(c.page)) {
        map.set(c.page, {
          page: c.page,
          title: c.pageTitle || pageLabel(c.page),
          count: 0,
        });
      }
      map.get(c.page).count += 1;
    });
    const current = pageKey();
    if (!map.has(current)) {
      map.set(current, { page: current, title: pageLabel(current), count: 0 });
    }
    return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
  }

  function onPageSelectChange(e) {
    const next = e.target.value;
    if (!next || next === pageKey()) return;
    sessionStorage.setItem('kalos-v2-restore', JSON.stringify({ tools: true, panel: true }));
    location.href = next;
  }

  function renderPageSelect() {
    if (!state.pageSelect) return;
    const current = pageKey();
    const pages = pagesWithComments();
    state.pageSelect.innerHTML = pages.map((p) => (
      `<option value="${escapeHtml(p.page)}" ${p.page === current ? 'selected' : ''}>${escapeHtml(p.title)} (${p.count})</option>`
    )).join('');
  }

  function updateLayerSize() {
    const { w, h } = docSize();
    state.layer.style.width = `${w}px`;
    state.layer.style.height = `${h}px`;
  }

  function onLayerClick(e) {
    if (!placing) return;
    if (e.target.closest('.kc-pin, .kc-bubble, .kc-composer')) return;
    updateLayerSize();
    const rect = state.layer.getBoundingClientRect();
    const layerW = state.layer.offsetWidth || rect.width;
    const layerH = state.layer.offsetHeight || rect.height;
    if (!layerW || !layerH) return;
    // Coordinates relative to the document-sized layer (scrolls with the page)
    const x = ((e.clientX - rect.left) / layerW) * 100;
    const y = ((e.clientY - rect.top) / layerH) * 100;
    draft = {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
    openId = null;
    render();
  }

  function cancelDraft() {
    draft = null;
    render();
  }

  function saveDraft(text, author) {
    const body = text.trim();
    if (!body) return;
    const name = (author || getAuthor() || 'Reviewer').trim();
    setAuthor(name);
    const list = loadComments();
    list.push({
      id: uid(),
      page: pageKey(),
      pageTitle: pageLabel(),
      x: draft.x,
      y: draft.y,
      text: body,
      author: name,
      createdAt: new Date().toISOString(),
      resolved: false,
    });
    saveComments(list);
    draft = null;
    placing = true;
    render();
  }

  function updateComment(id, patch) {
    const list = loadComments().map((c) => (c.id === id ? { ...c, ...patch } : c));
    saveComments(list);
    render();
  }

  function deleteComment(id) {
    saveComments(loadComments().filter((c) => c.id !== id));
    if (openId === id) openId = null;
    render();
  }

  function formatTime(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      });
    } catch {
      return '';
    }
  }

  function renderBadge() {
    const n = pageComments().length;
    state.badge.hidden = n === 0;
    state.badge.textContent = String(n);
  }

  function renderPanel() {
    renderPageSelect();
    const items = pageComments();
    if (!items.length) {
      state.list.innerHTML = `<div class="kc-empty">No comments on this page yet. Use the pencil to leave one, or pick another page above.</div>`;
      return;
    }
    state.list.innerHTML = items.map((c) => `
      <button type="button" class="kc-item ${c.id === openId ? 'is-active' : ''} ${c.resolved ? 'is-resolved' : ''}" data-kc-jump="${c.id}">
        <div class="kc-item-top"><span>${escapeHtml(c.author)}</span><span>${formatTime(c.createdAt)}</span></div>
        <strong>${escapeHtml(c.text)}</strong>
      </button>
    `).join('');
    state.list.querySelectorAll('[data-kc-jump]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-kc-jump');
        openId = id;
        setPanel(false);
        render();
        scrollToPin(id);
      });
    });
  }

  function scrollToPin(id) {
    const pin = state.layer.querySelector(`[data-kc-pin="${id}"]`);
    if (!pin) return;
    pin.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tipBelow(xPct, yPct) {
    updateLayerSize();
    const rect = state.layer.getBoundingClientRect();
    const layerH = state.layer.offsetHeight || rect.height || 1;
    const pinScreenY = rect.top + (yPct / 100) * layerH;
    // If the pin is near the top of the viewport, open the tooltip below
    return pinScreenY < 240;
  }

  function renderPins() {
    const visible = placing || panelOpen || !!openId || !!draft;
    state.layer.hidden = !visible;
    state.layer.classList.toggle('kc-layer-active', placing);
    updateLayerSize();

    const comments = pageComments();
    let html = comments.map((c, i) => `
      <button type="button" class="kc-pin ${c.id === openId ? 'is-open' : ''} ${c.resolved ? 'is-resolved' : ''}"
        data-kc-pin="${c.id}" style="left:${c.x}%;top:${c.y}%" aria-label="Comment ${i + 1}">
        <span>${i + 1}</span>
      </button>
    `).join('');

    if (openId) {
      const c = comments.find((x) => x.id === openId);
      if (c) {
        const below = tipBelow(c.x, c.y) ? ' kc-below' : '';
        html += `
          <div class="kc-bubble${below}" style="left:${c.x}%;top:${c.y}%" data-kc-bubble>
            <div class="kc-bubble-meta">
              <strong>${escapeHtml(c.author)}</strong>
              <time>${formatTime(c.createdAt)}</time>
            </div>
            <p class="kc-bubble-body">${escapeHtml(c.text)}</p>
            <div class="kc-bubble-actions">
              <button type="button" class="kc-btn" data-kc-resolve>${c.resolved ? 'Unresolve' : 'Resolve'}</button>
              <button type="button" class="kc-btn danger" data-kc-delete>Delete</button>
              <button type="button" class="kc-btn ghost" data-kc-close-bubble>Close</button>
            </div>
          </div>
        `;
      }
    }

    if (draft) {
      const below = tipBelow(draft.x, draft.y) ? ' kc-below' : '';
      html += `
        <button type="button" class="kc-pin is-open" style="left:${draft.x}%;top:${draft.y}%" tabindex="-1" aria-hidden="true"><span>+</span></button>
        <form class="kc-composer${below}" style="left:${draft.x}%;top:${draft.y}%" data-kc-composer>
          <h3>New comment</h3>
          <label for="kcAuthor">Name</label>
          <input id="kcAuthor" name="author" type="text" value="${escapeHtml(getAuthor())}" placeholder="Your name" required>
          <label for="kcText">Comment</label>
          <textarea id="kcText" name="text" placeholder="What should we look at here?" required></textarea>
          <div class="kc-composer-actions">
            <button type="button" class="kc-btn ghost" data-kc-cancel>Cancel</button>
            <button type="submit" class="kc-btn primary">Save</button>
          </div>
        </form>
      `;
    }

    state.layer.innerHTML = html;

    state.layer.querySelectorAll('[data-kc-pin]').forEach((pin) => {
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = pin.getAttribute('data-kc-pin');
        openId = openId === id ? null : id;
        draft = null;
        render();
      });
    });

    const bubble = state.layer.querySelector('[data-kc-bubble]');
    if (bubble) {
      bubble.addEventListener('click', (e) => e.stopPropagation());
      bubble.querySelector('[data-kc-close-bubble]')?.addEventListener('click', () => { openId = null; render(); });
      bubble.querySelector('[data-kc-resolve]')?.addEventListener('click', () => {
        const c = pageComments().find((x) => x.id === openId);
        if (c) updateComment(c.id, { resolved: !c.resolved });
      });
      bubble.querySelector('[data-kc-delete]')?.addEventListener('click', () => {
        if (window.confirm('Delete this comment?')) deleteComment(openId);
      });
    }

    const form = state.layer.querySelector('[data-kc-composer]');
    if (form) {
      form.addEventListener('click', (e) => e.stopPropagation());
      form.querySelector('[data-kc-cancel]')?.addEventListener('click', cancelDraft);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        saveDraft(String(fd.get('text') || ''), String(fd.get('author') || ''));
      });
      form.querySelector('textarea')?.focus();
    }
  }

  function render() {
    ensureRoot();
    renderBadge();
    renderPins();
    if (panelOpen) renderPanel();
  }

  function patchHistory() {
    ['pushState', 'replaceState'].forEach((method) => {
      const original = history[method];
      history[method] = function patched(...args) {
        const result = original.apply(this, args);
        queueMicrotask(() => {
          openId = null;
          draft = null;
          render();
        });
        return result;
      };
    });
    window.addEventListener('popstate', () => {
      openId = null;
      draft = null;
      render();
    });
  }

  function boot() {
    if (window.__kalosCommentsBooted) return;
    window.__kalosCommentsBooted = true;
    ensureRoot();
    patchHistory();
    render();

    try {
      const raw = sessionStorage.getItem('kalos-v2-restore');
      if (raw) {
        sessionStorage.removeItem('kalos-v2-restore');
        const data = JSON.parse(raw);
        if (data.tools && data.panel) setToolsOpen(true, { panel: true });
        else if (data.tools) setToolsOpen(true);
      }
    } catch {
      sessionStorage.removeItem('kalos-v2-restore');
    }

    const pending = sessionStorage.getItem('kalos-v2-open-comment');
    if (pending) {
      sessionStorage.removeItem('kalos-v2-open-comment');
      openId = pending;
      render();
      setTimeout(() => scrollToPin(pending), 120);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 120);
    });

    // Keep layer height in sync with late-loading content (avoid attributes —
    // updating layer style must not re-trigger the observer).
    let layerSyncQueued = false;
    const syncLayer = () => {
      if (!state.layer || state.layer.hidden || layerSyncQueued) return;
      layerSyncQueued = true;
      requestAnimationFrame(() => {
        layerSyncQueued = false;
        updateLayerSize();
      });
    };
    const mo = new MutationObserver(syncLayer);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', syncLayer);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
