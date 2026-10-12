/**
 * RETRO ARCADE ENGINE
 * Handles: View routing, 2-tab filtering (Games & Apps), Live search,
 * Sound triggers, CRT simulation toggles.
 * Built for Roll & Row Retro Arcade - Viswajeet Studio
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. AUDIO & SOUND INITIALIZATION
     ========================================================================== */
  const sfxBtn = document.getElementById('sfxToggle');
  function updateSfxUI() {
    if (!sfxBtn) return;
    const isEnabled = window.retroAudio ? window.retroAudio.enabled : false;
    sfxBtn.innerHTML = isEnabled ? '<span>🔊</span> SFX: ON' : '<span>🔇</span> SFX: OFF';
    sfxBtn.classList.toggle('active', isEnabled);
  }

  if (sfxBtn) {
    updateSfxUI();
    sfxBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        window.retroAudio.toggle();
        updateSfxUI();
      }
    });
  }

  // Bind hover sound to cards & interactive buttons
  document.querySelectorAll('.game-card, .cat-tab, .gadget-btn, .play-action-btn, .return-hub-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.retroAudio) window.retroAudio.playHover();
    });
  });

  /* ==========================================================================
     2. CRT SCANLINE TOGGLE (OFF BY DEFAULT)
     ========================================================================== */
  const crtBtn = document.getElementById('crtToggle');
  const savedCrtEnabled = localStorage.getItem('retro_crt_enabled');
  // Off by default: only enable if user explicitly saved 'true'
  if (savedCrtEnabled === 'true') {
    document.body.classList.remove('crt-disabled');
  } else {
    document.body.classList.add('crt-disabled');
  }

  function updateCrtUI() {
    if (!crtBtn) return;
    const isCrtActive = !document.body.classList.contains('crt-disabled');
    crtBtn.innerHTML = isCrtActive ? '<span>📺</span> CRT: ON' : '<span>📺</span> CRT: OFF';
    crtBtn.classList.toggle('active', isCrtActive);
  }

  if (crtBtn) {
    updateCrtUI();
    crtBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-disabled');
      const isNowActive = !document.body.classList.contains('crt-disabled');
      localStorage.setItem('retro_crt_enabled', isNowActive ? 'true' : 'false');
      if (window.retroAudio) window.retroAudio.playClick();
      updateCrtUI();
    });
  }

  /* ==========================================================================
     3. VIEW SWITCHER (SPA ROUTER)
     ========================================================================== */
  window.gotoView = function(viewName) {
    const views = document.querySelectorAll('.arcade-view');
    const target = document.getElementById('view-' + viewName);

    if (!target) return;

    views.forEach(v => v.classList.remove('active'));
    target.classList.add('active');

    // Scroll to top of view smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sound effect trigger
    if (window.retroAudio) {
      if (viewName === 'hub') {
        window.retroAudio.playClick();
      } else {
        window.retroAudio.playStart();
      }
    }
  };

  // Bind [data-goto] elements
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't intercept direct link clicks inside card
      if (e.target.closest('a') && !e.target.closest('[data-goto]')) return;
      const target = el.getAttribute('data-goto');
      if (target) {
        window.gotoView(target);
      }
    });
  });

  // Return to hub buttons
  document.querySelectorAll('.return-hub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.gotoView('hub');
    });
  });

  /* ==========================================================================
     4. 2-OPTION NAVIGATION (GAMES & APPS) + LIVE SEARCH
     ========================================================================== */
  const searchInput = document.getElementById('arcadeSearch');
  const catTabs = document.querySelectorAll('.cat-tab');
  const cards = document.querySelectorAll('.game-card');
  const emptyState = document.getElementById('noResultsMsg');

  // Default active tab: 'games'
  let currentCategory = 'games';
  let searchQuery = '';

  function filterCards() {
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category') || '';
      const cardTitle = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('p')?.textContent || '').toLowerCase();

      // If user typed search, search in active category (or show matches)
      const matchesCategory = (cardCat === currentCategory);
      const matchesSearch = !searchQuery || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-filter') || 'games';
      if (window.retroAudio) window.retroAudio.playClick();
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterCards();
    });
  }

  // Run initial filter so 'games' shows by default
  filterCards();
});
