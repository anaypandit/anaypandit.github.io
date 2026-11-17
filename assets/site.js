// Navigation remains fully functional without JavaScript.
// Reflect the section being read when the viewport has room for the navigation.
(() => {
  const sections = [...document.querySelectorAll('section[id]')];
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('nav a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
})();
