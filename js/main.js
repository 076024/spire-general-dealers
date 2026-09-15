// Shared nav toggle for all pages
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Update cart count badge on every page load
  updateCartBadge();
});

// ---- Cart badge (shared header element, all pages) ----
function updateCartBadge(){
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const cart = window.SpireCart ? window.SpireCart.getCart() : [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}
