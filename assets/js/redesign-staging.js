document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const primaryNav = document.querySelector('#primary-nav');
  const dropdowns = {
    'Start Here': [['I have a Bible question', '/studies/'], ['I want to study a passage', '/studies/bible-passage-studies/'], ['I want to read a book', '/books/'], ['I need something to teach', '/teaching/'], ['I am looking for fiction', '/fiction/']],
    Studies: [['Browse all studies', '/studies/'], ['Bible Passage Studies', '/studies/bible-passage-studies/'], ['Resource Clusters', '/studies/resource-clusters/'], ['Articles', '/studies/articles/'], ['Topics and Glossary', '/topics-glossary/']],
    Books: [['Browse all books', '/books/'], ['Free ebook library', '/books/#free-ebooks-heading'], ['Commentaries', '/commentaries'], ['The Where To trilogy', '/trilogy'], ['Children and Families', '/books/children-and-families/']],
    Fiction: [['Fiction Library', '/fiction/'], ['Daughter of Jezebel', '/daughter-of-jezebel']],
    Teaching: [['Teaching Library', '/teaching/'], ['Adult courses', '/teaching/#courses'], ['Youth studies', '/teaching/youth/found/'], ['Children and families', '/books/children-and-families/']],
    About: [['About Fireproof Studies', '/about/'], ['How to use the library', '/how-to-use.html'], ['Contact', '/contact.html']]
  };

  const closeDropdowns = (except) => {
    document.querySelectorAll('.nav-item.is-open').forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      const toggle = item.querySelector('.submenu-toggle');
      toggle?.setAttribute('aria-expanded', 'false');
      if (toggle) toggle.setAttribute('aria-label', toggle.getAttribute('aria-label').replace('Hide', 'Show'));
    });
  };

  if (primaryNav && !primaryNav.dataset.enhanced) {
    primaryNav.dataset.enhanced = 'true';
    [...primaryNav.children].forEach((link, index) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const label = link.textContent.trim();
      const items = dropdowns[label];
      if (!items) return;

      const item = document.createElement('div');
      const submenuId = `nav-submenu-${index}`;
      item.className = 'nav-item';
      link.before(item);
      item.append(link);

      const toggle = document.createElement('button');
      toggle.className = 'submenu-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', submenuId);
      toggle.setAttribute('aria-label', `Show ${label} links`);
      toggle.innerHTML = '<span aria-hidden="true">▾</span>';

      const submenu = document.createElement('div');
      submenu.className = 'submenu';
      submenu.id = submenuId;
      items.forEach(([text, href]) => {
        const child = document.createElement('a');
        child.href = href;
        child.textContent = text;
        submenu.append(child);
      });
      item.append(toggle, submenu);

      const setOpen = (open) => {
        closeDropdowns(open ? item : null);
        item.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} ${label} links`);
      };
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setOpen(true);
          submenu.querySelector('a')?.focus();
        }
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          toggle.focus();
        }
      });
    });
  }

  if (menuButton && primaryNav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      primaryNav.classList.toggle('is-open', open);
      if (!open) closeDropdowns();
    });
  }
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-item')) closeDropdowns();
  });

  const form = document.querySelector('#global-search');
  const input = document.querySelector('#q');
  const results = document.querySelector('#search-results');
  if (!form || !input || !results) return;
  let index = [];
  const initialQuery = new URLSearchParams(location.search).get('q');
  fetch('/search-index.json').then((response) => response.json()).then((data) => {
    index = data;
    if (initialQuery) { input.value = initialQuery; run(); }
  }).catch(() => {});
  const run = () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) { results.innerHTML = '<p>Enter at least two characters to search.</p>'; return; }
    const types = [...document.querySelectorAll('.filter-box input:checked')].map((element) => element.value.toLowerCase());
    const found = index.filter((entry) => (entry.title + ' ' + entry.description + ' ' + entry.url + ' ' + entry.type).toLowerCase().includes(query) && types.some((type) => entry.type.toLowerCase().includes(type) || type === 'studies' && /study|article|passage|cluster|glossary/i.test(entry.type))).slice(0, 40);
    results.innerHTML = found.length ? found.map((entry) => `<a class="search-result" href="${entry.url}"><span class="tag">${entry.type}</span><h2>${entry.title || entry.url}</h2><p>${entry.description || entry.url}</p></a>`).join('') : '<p>No matching pages found. Try a broader term.</p>';
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); run(); });
  input.addEventListener('input', run);
  document.querySelectorAll('.filter-box input').forEach((element) => element.addEventListener('change', run));
});
