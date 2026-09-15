// ============================================================
// Spire General Dealers — Product catalog + cart engine
// NOTE: Prices and products below are PLACEHOLDER data for layout
// purposes. Swap PRODUCTS with real names/prices when ready.
// ============================================================

const PRODUCTS = [
  { id:'p01', name:'A4 Copy Paper (Ream)', category:'Office Supplies', price:120, unit:'per ream', desc:'80gsm bright white paper, 500 sheets per ream.', img:'stationery.jpg' },
  { id:'p02', name:'Assorted Ballpoint Pens (Pack of 10)', category:'Office Supplies', price:45, unit:'per pack', desc:'Smooth-writing blue and black pens for everyday office use.', img:'office-supplies.jpg' },
  { id:'p03', name:'Lever Arch File', category:'Office Supplies', price:35, unit:'each', desc:'Durable box file for long-term document storage.', img:'stationery.jpg' },
  { id:'p04', name:'Executive Notebook A5', category:'Office Supplies', price:60, unit:'each', desc:'Hardcover ruled notebook, 200 pages.', img:'office-supplies.jpg' },

  { id:'p05', name:'Ergonomic Mesh Office Chair', category:'Furniture', price:1450, unit:'each', desc:'Breathable mesh back with lumbar support and adjustable height.', img:'furniture-1.jpg' },
  { id:'p06', name:'Executive Leather Chair', category:'Furniture', price:2600, unit:'each', desc:'High-back leather seating for offices and boardrooms.', img:'sd.jpg' },
  { id:'p07', name:'L-Shaped Office Desk', category:'Furniture', price:3200, unit:'each', desc:'Corner workstation with built-in storage drawers.', img:'furniture-1.jpg' },

  { id:'p08', name:'HP 680 Ink Cartridge (Black)', category:'Electronics', price:280, unit:'each', desc:'Genuine HP ink cartridge, compatible with DeskJet printers.' },
  { id:'p09', name:'Lenovo Wireless Mouse', category:'Electronics', price:150, unit:'each', desc:'Compact wireless mouse with USB receiver.' },
  { id:'p10', name:'JBL Bluetooth Speaker', category:'Electronics', price:650, unit:'each', desc:'Portable speaker with rich bass and 10-hour battery life.',img:'jbl.jpg' },
  { id:'p11', name:'Samsung 32" LED TV', category:'Electronics', price:2800, unit:'each', desc:'HD-ready LED television for offices and reception areas.' },

  { id:'p12', name:'500W Portable Power Station', category:'Solar & Power', price:4500, unit:'each', desc:'Rechargeable power station for outages and off-grid sites.' },
  { id:'p13', name:'Solar Panel 100W', category:'Solar & Power', price:1800, unit:'each', desc:'Monocrystalline panel for home and site power backup.' },
  { id:'p14', name:'Inverter 1000VA', category:'Solar & Power', price:2200, unit:'each', desc:'Pure sine wave inverter for household and office backup.' },

  { id:'p15', name:'Ceiling Board', category:'Construction', price:180, unit:'per sheet', desc:'Standard gypsum ceiling board, 1200 x 600mm.' },
  { id:'p16', name:'PVC Pipe 1" (3m)', category:'Construction', price:75, unit:'each', desc:'Durable PVC piping for plumbing installations.' },
  { id:'p17', name:'Interior Paint 20L', category:'Construction', price:650, unit:'per tin', desc:'Premium interior wall paint, washable finish.' },
];

const BUSINESS_PHONE = '260972577075'; // WhatsApp number, international format, no +
const BUSINESS_EMAIL = 'spiregeneraldealers@gmail.com';

// In-memory cart (resets on page reload — intentional, no browser storage used)
let cart = [];

function getCart(){ return cart; }

function findCartItem(id){ return cart.find(i => i.id === id); }

function addToCart(id, qty){
  qty = Math.max(1, parseInt(qty, 10) || 1);
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = findCartItem(id);
  if (existing) { existing.qty += qty; }
  else { cart.push({ id, qty }); }
  renderCartDrawer();
  updateCartBadge();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  renderCartDrawer();
  updateCartBadge();
}

function setQty(id, qty){
  const item = findCartItem(id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  renderCartDrawer();
  updateCartBadge();
}

function cartSubtotal(){
  return cart.reduce((sum, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function formatK(n){
  return 'K' + n.toLocaleString('en-ZM', { minimumFractionDigits: 0 });
}

// ---------- Rendering: product grid ----------
function renderProductGrid(filterCategory){
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const list = filterCategory && filterCategory !== 'All'
    ? PRODUCTS.filter(p => p.category === filterCategory)
    : PRODUCTS;

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb">${p.img ? `<img src="assets/img/${p.img}" alt="${p.name}">` : p.category}</div>
      <div class="product-body">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">${formatK(p.price)} <span class="unit">${p.unit}</span></div>
        <div class="qty-row">
          <div class="qty-control">
            <button type="button" aria-label="Decrease quantity" data-action="dec">−</button>
            <input type="text" inputmode="numeric" value="1" aria-label="Quantity" data-qty-input>
            <button type="button" aria-label="Increase quantity" data-action="inc">+</button>
          </div>
        </div>
        <button type="button" class="add-cart-btn" data-add="${p.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);

    const qtyInput = card.querySelector('[data-qty-input]');
    card.querySelector('[data-action="dec"]').addEventListener('click', () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    });
    card.querySelector('[data-action="inc"]').addEventListener('click', () => {
      qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });
    const addBtn = card.querySelector('[data-add]');
    addBtn.addEventListener('click', () => {
      addToCart(p.id, qtyInput.value);
      addBtn.textContent = 'Added ✓';
      addBtn.classList.add('added');
      setTimeout(() => { addBtn.textContent = 'Add to Cart'; addBtn.classList.remove('added'); }, 1100);
      openCartDrawer(false);
    });
  });
}

// ---------- Rendering: cart drawer ----------
function renderCartDrawer(){
  const itemsWrap = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  if (!itemsWrap) return;

  if (cart.length === 0){
    itemsWrap.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Add products to get a quote sent over.</div>';
    if (subtotalEl) subtotalEl.textContent = formatK(0);
    return;
  }

  itemsWrap.innerHTML = '';
  cart.forEach(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="ci-thumb">${p.img ? `<img src="assets/img/${p.img}" alt="${p.name}">` : ''}</div>
      <div class="ci-info">
        <div class="ci-name">${p.name}</div>
        <div class="ci-meta">
          <span>${item.qty} × ${formatK(p.price)}</span>
          <button class="ci-remove" data-remove="${p.id}">Remove</button>
        </div>
      </div>
    `;
    itemsWrap.appendChild(row);
    row.querySelector('[data-remove]').addEventListener('click', () => removeFromCart(p.id));
  });

  if (subtotalEl) subtotalEl.textContent = formatK(cartSubtotal());
}

// ---------- Drawer open/close ----------
function openCartDrawer(toggle = true){
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (!overlay || !drawer) return;
  overlay.classList.add('open');
  drawer.classList.add('open');
}
function closeCartDrawer(){
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (!overlay || !drawer) return;
  overlay.classList.remove('open');
  drawer.classList.remove('open');
}

// ---------- Order text builder ----------
function buildOrderText(extra){
  if (cart.length === 0) return 'No items in cart yet.';
  let lines = ['Order from Spire General Dealers website:', ''];
  cart.forEach(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return;
    lines.push(`• ${p.name} — Qty ${item.qty} — ${formatK(p.price * item.qty)}`);
  });
  lines.push('', `Subtotal: ${formatK(cartSubtotal())}`);
  if (extra && extra.name) lines.push('', `Name: ${extra.name}`);
  if (extra && extra.phone) lines.push(`Phone: ${extra.phone}`);
  if (extra && extra.note) lines.push(`Note: ${extra.note}`);
  return lines.join('\n');
}

function sendViaWhatsApp(){
  const text = encodeURIComponent(buildOrderText());
  window.open(`https://wa.me/${BUSINESS_PHONE}?text=${text}`, '_blank');
}

function sendViaEmail(){
  const subject = encodeURIComponent('New order — Spire General Dealers website');
  const body = encodeURIComponent(buildOrderText());
  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
}

function showToast(msg){
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// ---------- Direct message modal ----------
function openDirectModal(){
  const modal = document.getElementById('directModal');
  if (modal) modal.classList.add('open');
}
function closeDirectModal(){
  const modal = document.getElementById('directModal');
  if (modal) modal.classList.remove('open');
}
function submitDirectMessage(e){
  e.preventDefault();
  const name = document.getElementById('dmName').value.trim();
  const phone = document.getElementById('dmPhone').value.trim();
  const note = document.getElementById('dmNote').value.trim();
  // No backend is connected yet, so this routes to email in the background
  // while presenting a simple "leave your details" form to the customer.
  const subject = encodeURIComponent('New order (direct message) — Spire General Dealers website');
  const body = encodeURIComponent(buildOrderText({ name, phone, note }));
  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  closeDirectModal();
  showToast('Message prepared — check your email app to finish sending.');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderProductGrid('All');
  renderCartDrawer();

  const cartBtn = document.getElementById('cartToggle');
  if (cartBtn) cartBtn.addEventListener('click', () => openCartDrawer());
  const cartClose = document.getElementById('cartCloseBtn');
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  const overlay = document.getElementById('cartOverlay');
  if (overlay) overlay.addEventListener('click', closeCartDrawer);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProductGrid(btn.dataset.category);
    });
  });

  const waBtn = document.getElementById('sendWhatsApp');
  if (waBtn) waBtn.addEventListener('click', sendViaWhatsApp);
  const emailBtn = document.getElementById('sendEmail');
  if (emailBtn) emailBtn.addEventListener('click', sendViaEmail);
  const directBtn = document.getElementById('sendDirect');
  if (directBtn) directBtn.addEventListener('click', openDirectModal);

  const dmForm = document.getElementById('directForm');
  if (dmForm) dmForm.addEventListener('submit', submitDirectMessage);
  const dmClose = document.getElementById('directModalClose');
  if (dmClose) dmClose.addEventListener('click', closeDirectModal);
  const dmOverlay = document.getElementById('directModal');
  if (dmOverlay) dmOverlay.addEventListener('click', (e) => { if (e.target === dmOverlay) closeDirectModal(); });
});

// Expose for main.js badge updater
window.SpireCart = { getCart };
