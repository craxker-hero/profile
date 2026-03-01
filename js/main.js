
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  document.getElementById('prog').style.width = Math.min(p, 100) + '%';
}, { passive: true });

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on');
    e.target.querySelectorAll('.skill-fill').forEach(b => {
      b.style.width = (b.dataset.w || 0) + '%';
    });
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
window.__portfolioObserver = obs;
