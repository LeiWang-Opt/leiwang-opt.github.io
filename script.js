/* Mobile menu, publication search and reliable active-section navigation. */
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('primary-nav');
  if (menuButton && menu) {
    const closeMenu = () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    };
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  const search = document.getElementById('paper-search');
  const items = [...document.querySelectorAll('.pub-item')];
  const status = document.getElementById('search-status');
  const empty = document.getElementById('search-empty');
  if (search && items.length) {
    const filter = () => {
      const q = search.value.trim().toLocaleLowerCase();
      let count = 0;
      items.forEach(item => {
        const visible = !q || (item.dataset.search || '').includes(q);
        item.hidden = !visible;
        if (visible) count++;
      });
      if (status) status.textContent = `${count} ${count === 1 ? 'work' : 'works'}`;
      if (empty) empty.hidden = count !== 0;
    };
    search.addEventListener('input', filter);
    filter();
  }

  const year = document.getElementById('footer-year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Choose the section occupying the reading position near the top of the
  // viewport, rather than only the IntersectionObserver entries that changed.
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.primary-nav a, .section-nav a')];
  if (!sections.length || !links.length) return;

  const setActive = id => {
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  let pendingId = null;
  let pendingTimer = null;

  const updateActive = () => {
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 77;
    const readingLine = headerHeight + 35;
    let activeId = sections[0].id;

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) {
        activeId = section.id;
      } else {
        break;
      }
    }

    // The last section may be too short to scroll up to the reading line.
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
    if (atBottom) activeId = sections[sections.length - 1].id;

    // During a smooth anchor jump, keep the clicked tab selected until its
    // section reaches the scroll target. Otherwise earlier sections flash.
    if (pendingId) {
      const target = document.getElementById(pendingId);
      const cssOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 106;
      const reached = target && Math.abs(target.getBoundingClientRect().top - cssOffset) < 24;
      const reachedBottom = atBottom && pendingId === sections[sections.length - 1].id;
      if (reached || reachedBottom) {
        pendingId = null;
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = null;
      } else {
        setActive(pendingId);
        return;
      }
    }
    setActive(activeId);
  };

  let framePending = false;
  const scheduleUpdate = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(() => {
      framePending = false;
      updateActive();
    });
  };

  // Show the clicked item immediately. Scrolling then keeps the highlight in
  // sync, including when navigating with the browser Back/Forward buttons.
  const cancelPending = () => {
    pendingId = null;
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = null;
  };

  links.forEach(link => link.addEventListener('click', () => {
    const id = link.getAttribute('href')?.slice(1);
    if (!id || !sections.some(section => section.id === id)) return;
    cancelPending();
    pendingId = id;
    setActive(id);
    pendingTimer = setTimeout(() => {
      pendingId = null;
      pendingTimer = null;
      scheduleUpdate();
    }, 2500);
  }));
  window.addEventListener('wheel', () => { cancelPending(); scheduleUpdate(); }, { passive: true });
  window.addEventListener('touchstart', cancelPending, { passive: true });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  scheduleUpdate();
})();
