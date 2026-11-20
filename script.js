/* Progressive enhancements: mobile menu, active sections, paper search. */
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('primary-nav');
  if (menuButton && menu) {
    const closeMenu = () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); };
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
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

  if ('IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('main section[id]')];
    const links = [...document.querySelectorAll('.section-nav a, .primary-nav a')];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const id = visible[0].target.id;
      links.forEach(link => {
        const active = link.getAttribute('href') === '#'+id;
        link.classList.toggle('active',active);
        if (active) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-95px 0px -48% 0px',threshold:[0,0.1,0.3]});
    sections.forEach(section => observer.observe(section));
  }
})();
