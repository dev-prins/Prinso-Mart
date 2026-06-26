// PrinsoMart Customer App
const API = '/api';
let state = {
  token: localStorage.getItem('pm_token') || null,
  user: JSON.parse(localStorage.getItem('pm_user') || 'null'),
  cart: JSON.parse(localStorage.getItem('pm_cart') || '{}'),
  products: [], categories: [], settings: {},
  view: 'home', category: null, search: ''
};

const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const save = () => {
  localStorage.setItem('pm_cart', JSON.stringify(state.cart));
  if (state.token) localStorage.setItem('pm_token', state.token);
  if (state.user) localStorage.setItem('pm_user', JSON.stringify(state.user));
};
const toast = (m) => {
  const t = $('#toast'); t.textContent = m; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
};
const fmt = (n) => '₹' + Number(n).toFixed(0);

async function api(p, opts={}) {
  const h = { 'Content-Type': 'application/json' };
  if (state.token) h.Authorization = 'Bearer ' + state.token;
  const r = await fetch(API + p, { ...opts, headers: { ...h, ...(opts.headers||{}) } });
  if (!r.ok) {
    const e = await r.json().catch(() => ({error:'error'}));
    throw new Error(e.error || 'error');
  }
  return r.json();
}

async function loadInit() {
  try {
    const [cats, prods, settings] = await Promise.all([
      api('/categories'), api('/products'), api('/settings')
    ]);
    state.categories = cats; state.products = prods; state.settings = settings;
  } catch (e) { console.error(e); }
}

// ---------- RENDER ----------
function render() {
  const app = $('#app');
  if (state.view === 'login') return app.innerHTML = renderAuth();
  let body = '';
  if (state.view === 'home') body = renderHome();
  else if (state.view === 'categories') body = renderCategories();
  else if (state.view === 'cart') body = renderCart();
  else if (state.view === 'orders') body = renderOrders();
  else if (state.view === 'profile') body = renderProfile();
  else if (state.view === 'checkout') body = renderCheckout();
  else if (state.view === 'order') body = renderOrderDetail();
  app.innerHTML = renderTop() + body + renderBottom() + renderCartBar();
  bindEvents();
}

function renderTop() {
  const s = state.settings;
  return `
  <div class="topbar">
    <div>
      <div class="logo">${s.app_name || 'PrinsoMart'}</div>
      <div class="tag">${s.tagline || 'Pure Veg, Pure Trust'}</div>
    </div>
    <div class="right">
      <button class="icon-btn" onclick="go('profile')" title="Profile">👤</button>
    </div>
  </div>
  <div class="delivery-strip">
    <div>
      <div class="min">⚡ Delivery in ${s.delivery_eta || '30 min'}</div>
      <div class="addr">📍 Umaria, MP - 484661</div>
    </div>
  </div>
  <div class="search-wrap">
    <div class="search">
      <span>🔍</span>
      <input id="searchBox" placeholder="Search 'tomato', 'milk', 'atta'..." value="${state.search}">
    </div>
  </div>`;
}

function renderBottom() {
  const v = state.view;
  return `<div class="bottom-nav">
    <div class="item ${v==='home'?'active':''}" onclick="go('home')"><div class="e">🏠</div>Home</div>
    <div class="item ${v==='categories'?'active':''}" onclick="go('categories')"><div class="e">📂</div>Categories</div>
    <div class="item ${v==='orders'?'active':''}" onclick="go('orders')"><div class="e">📦</div>Orders</div>
    <div class="item ${v==='profile'?'active':''}" onclick="go('profile')"><div class="e">👤</div>Profile</div>
  </div>`;
}

function cartCount() { return Object.values(state.cart).reduce((a,b)=>a+b,0); }
function cartTotal() {
  let t = 0;
  for (const [id, qty] of Object.entries(state.cart)) {
    const p = state.products.find(x => x.id == id);
    if (p) t += Number(p.price) * qty;
  }
  return t;
}
function renderCartBar() {
  const c = cartCount(); if (!c || state.view === 'cart' || state.view === 'checkout') return '';
  return `<div class="cart-bar" onclick="go('cart')">
    <div>${c} item${c>1?'s':''} • ${fmt(cartTotal())}</div>
    <div>View Cart →</div>
  </div>`;
}

function renderHome() {
  let html = `<div class="section">
    <div class="banner">
      <div style="flex:1">
        <div class="big">Pure Veg Grocery</div>
        <div class="sub">Free delivery above ${fmt(state.settings.free_delivery_above||199)}</div>
      </div>
      <div class="emo">🥬</div>
    </div>
  </div>`;
  html += `<div class="section"><h2>Shop by Category</h2><div class="cats">`;
  for (const c of state.categories.slice(0,8)) {
    html += `<div class="cat" onclick="goCat(${c.id})"><div class="e">${c.icon||'🛒'}</div><div class="n">${c.name}</div></div>`;
  }
  html += `</div></div>`;
  // Popular products
  html += `<div class="section"><h2>Bestsellers</h2><div class="prods">`;
  for (const p of state.products.slice(0,8)) html += prodCard(p);
  html += `</div></div>`;
  // All products
  html += `<div class="section"><h2>All Products</h2><div class="prods">`;
  for (const p of state.products.slice(8)) html += prodCard(p);
  html += `</div></div>`;
  return html;
}

function renderCategories() {
  let html = `<div class="section"><h2>All Categories</h2><div class="cats" style="grid-template-columns:repeat(3,1fr)">`;
  for (const c of state.categories) {
    html += `<div class="cat" onclick="goCat(${c.id})"><div class="e" style="font-size:34px">${c.icon||'🛒'}</div><div class="n">${c.name}</div></div>`;
  }
  html += `</div></div>`;
  if (state.category) {
    const cat = state.categories.find(c => c.id == state.category);
    const items = state.products.filter(p => p.category_id == state.category);
    html += `<div class="section"><h2>${cat?cat.name:''} (${items.length})</h2><div class="prods">`;
    for (const p of items) html += prodCard(p);
    html += `</div></div>`;
  }
  return html;
}

function prodCard(p) {
  const qty = state.cart[p.id] || 0;
  const off = p.mrp > p.price ? Math.round((1 - p.price/p.mrp)*100) : 0;
  return `<div class="prod">
    ${off?`<div class="off">${off}% OFF</div>`:''}
    <div class="img">${p.image||'🛒'}</div>
    <div class="name">${p.name}</div>
    <div class="w">${p.weight||''}</div>
    <div class="row">
      <div><span class="price">${fmt(p.price)}</span>${off?`<span class="mrp">${fmt(p.mrp)}</span>`:''}</div>
      ${qty ? `<div class="qty">
        <button onclick="addCart(${p.id},-1)">−</button>
        <span>${qty}</span>
        <button onclick="addCart(${p.id},1)">+</button>
      </div>` : `<button class="add-btn" onclick="addCart(${p.id},1)">ADD</button>`}
    </div>
  </div>`;
}

function renderCart() {
  const items = Object.entries(state.cart).map(([id,qty]) => {
    const p = state.products.find(x => x.id == id); return p ? {...p, qty} : null;
  }).filter(Boolean);
  if (!items.length) return `<div class="empty"><div class="e">🛒</div><div>Cart is empty</div><br><button class="btn" style="max-width:200px;margin:0 auto" onclick="go('home')">Start Shopping</button></div>`;
  let html = `<div class="section"><h2>My Cart (${items.length})</h2>`;
  for (const it of items) {
    html += `<div class="cart-item">
      <div class="i">${it.image||'🛒'}</div>
      <div class="info">
        <div class="n">${it.name}</div>
        <div class="w">${it.weight||''}</div>
        <div class="p">${fmt(it.price)} × ${it.qty} = ${fmt(it.price*it.qty)}</div>
      </div>
      <div class="qty">
        <button onclick="addCart(${it.id},-1)">−</button>
        <span>${it.qty}</span>
        <button onclick="addCart(${it.id},1)">+</button>
      </div>
    </div>`;
  }
  const sub = cartTotal();
  const free = Number(state.settings.free_delivery_above || 199);
  const dc = sub >= free ? 0 : Number(state.settings.delivery_charge || 20);
  const min = Number(state.settings.min_order || 99);
  html += `<div class="bill">
    <div class="bill-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
    <div class="bill-row"><span>Delivery Charge ${dc===0?'(Free!)':''}</span><span>${fmt(dc)}</span></div>
    <div class="bill-row total"><span>To Pay</span><span>${fmt(sub+dc)}</span></div>
  </div>`;
  if (sub < min) html += `<div style="color:#c00;text-align:center;margin-top:10px;font-size:13px">Min order ${fmt(min)} • Add ${fmt(min-sub)} more</div>`;
  html += `<button class="btn" ${sub<min?'disabled':''} onclick="go('checkout')">Proceed to Checkout →</button>`;
  html += `</div>`;
  return html;
}

function renderCheckout() {
  if (!state.user) { state.view = 'login'; return renderAuth(); }
  const sub = cartTotal();
  const free = Number(state.settings.free_delivery_above || 199);
  const dc = sub >= free ? 0 : Number(state.settings.delivery_charge || 20);
  return `<div class="section">
    <h2>Checkout</h2>
    <div class="form">
      <label>Name</label>
      <input id="co_name" value="${state.user.name||''}">
      <label>Phone</label>
      <input id="co_phone" value="${state.user.phone||''}">
      <label>Full Address (House no, area, landmark)</label>
      <textarea id="co_address" rows="3" placeholder="Umaria, MP - 484661"></textarea>
      <label>Note for Delivery (optional)</label>
      <input id="co_note" placeholder="e.g. Ring the bell">
      <label>Payment Method</label>
      <select id="co_pay">
        <option value="cod">💵 Cash on Delivery</option>
      </select>
      <div class="bill" style="margin-top:14px">
        <div class="bill-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
        <div class="bill-row"><span>Delivery</span><span>${fmt(dc)}</span></div>
        <div class="bill-row total"><span>Total</span><span>${fmt(sub+dc)}</span></div>
      </div>
      <button class="btn" onclick="placeOrder()">Place Order</button>
    </div>
  </div>`;
}

function renderOrders() {
  if (!state.user) { state.view = 'login'; return renderAuth(); }
  return `<div class="section"><h2>My Orders</h2><div id="ordersList">Loading...</div></div>`;
}
async function loadOrders() {
  try {
    const list = await api('/me/orders');
    const c = $('#ordersList'); if (!c) return;
    if (!list.length) { c.innerHTML = `<div class="empty"><div class="e">📦</div>No orders yet</div>`; return; }
    c.innerHTML = list.map(o => {
      const items = JSON.parse(o.items_json);
      return `<div class="order-card" onclick="openOrder(${o.id})">
        <div class="order-head">
          <div><b>Order #${o.id}</b><div style="font-size:11px;color:#888">${new Date(o.created_at).toLocaleString()}</div></div>
          <div class="status-pill s-${o.status}">${o.status.replace(/_/g,' ')}</div>
        </div>
        <div style="font-size:12px;color:#666">${items.length} items • ${fmt(o.total)}</div>
      </div>`;
    }).join('');
  } catch(e) { toast(e.message); }
}

function renderOrderDetail() {
  return `<div class="section"><h2>Order Details</h2><div id="orderDetail">Loading...</div></div>`;
}
async function loadOrderDetail(id) {
  try {
    const o = await api('/orders/'+id);
    const items = JSON.parse(o.items_json);
    const c = $('#orderDetail');
    c.innerHTML = `
      <div class="order-card">
        <div class="order-head">
          <div><b>Order #${o.id}</b></div>
          <div class="status-pill s-${o.status}">${o.status.replace(/_/g,' ')}</div>
        </div>
        <div style="font-size:12px;color:#666;margin-bottom:8px">${new Date(o.created_at).toLocaleString()}</div>
        ${items.map(i => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>${i.name} × ${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
        <div class="bill" style="margin-top:10px">
          <div class="bill-row"><span>Subtotal</span><span>${fmt(o.subtotal)}</span></div>
          <div class="bill-row"><span>Delivery</span><span>${fmt(o.delivery_charge)}</span></div>
          <div class="bill-row total"><span>Total</span><span>${fmt(o.total)}</span></div>
        </div>
        <div style="margin-top:12px;font-size:13px"><b>📍 Address:</b><br>${o.address}</div>
        ${o.partner_name?`<div style="margin-top:8px;font-size:13px"><b>🛵 Delivery Partner:</b> ${o.partner_name} (${o.partner_phone||''})</div>`:''}
      </div>
      <button class="btn outline" onclick="go('orders')">← Back to Orders</button>`;
  } catch(e) { toast(e.message); }
}

function renderProfile() {
  if (!state.user) { state.view = 'login'; return renderAuth(); }
  return `<div class="section">
    <h2>Profile</h2>
    <div class="form">
      <div style="text-align:center;font-size:50px">👤</div>
      <div style="text-align:center;font-weight:700;font-size:18px;margin-top:6px">${state.user.name}</div>
      <div style="text-align:center;color:#888;font-size:13px">${state.user.phone||''}</div>
    </div>
    <div class="form" style="margin-top:12px">
      <div style="font-weight:700;margin-bottom:8px">📞 Support</div>
      <a href="tel:${state.settings.support_phone||''}">${state.settings.support_phone||''}</a><br>
      <a href="mailto:${state.settings.support_email||''}">${state.settings.support_email||''}</a>
    </div>
    <div class="form" style="margin-top:12px">
      <div style="font-weight:700;margin-bottom:8px">ℹ️ App Info</div>
      <div style="font-size:13px;color:#666">${state.settings.app_name} v1.0</div>
      <div style="font-size:13px;color:#666">${state.settings.tagline}</div>
      <div style="font-size:13px;color:#666;margin-top:8px">Delivery Partner Login: <a href="/partner" style="color:#0c831f;font-weight:700">/partner</a></div>
      <div style="font-size:13px;color:#666">Admin Panel: <a href="/admin" style="color:#0c831f;font-weight:700">/admin</a></div>
    </div>
    <button class="btn outline" style="margin-top:14px" onclick="logout()">Logout</button>
  </div>`;
}

function renderAuth() {
  const mode = state._authMode || 'login';
  return `<div class="topbar"><div class="logo">PrinsoMart</div><div class="tag" style="margin-left:6px">Pure Veg</div></div>
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>${mode==='login'?'Welcome back!':'Create Account'}</h1>
      <div class="sub">Login to order pure-veg grocery</div>
      <div class="tabs">
        <button class="${mode==='login'?'on':''}" onclick="state._authMode='login';render()">Login</button>
        <button class="${mode==='signup'?'on':''}" onclick="state._authMode='signup';render()">Sign Up</button>
      </div>
      ${mode==='signup'?'<label>Name</label><input id="a_name">':''}
      <label>Phone</label>
      <input id="a_phone" inputmode="numeric" maxlength="10" placeholder="10-digit mobile">
      <label>Password</label>
      <input id="a_pass" type="password" placeholder="Min 4 chars">
      <button class="btn" onclick="doAuth()">${mode==='login'?'Login':'Create Account'}</button>
      <div style="text-align:center;margin-top:14px;font-size:12px;color:#888">
        Are you a delivery partner? <a href="/partner" style="color:#0c831f;font-weight:700">Partner Login</a>
      </div>
    </div>
  </div>`;
}

// ---------- ACTIONS ----------
function go(v) { state.view = v; render();
  if (v === 'orders') setTimeout(loadOrders, 50);
}
function goCat(id) { state.category = id; state.view = 'categories'; render(); }
function openOrder(id) { state.view = 'order'; render(); setTimeout(()=>loadOrderDetail(id), 50); }

function addCart(id, delta) {
  const cur = state.cart[id] || 0;
  const next = cur + delta;
  if (next <= 0) delete state.cart[id]; else state.cart[id] = next;
  save(); render();
}

async function doAuth() {
  const mode = state._authMode || 'login';
  const phone = $('#a_phone').value.trim();
  const password = $('#a_pass').value;
  const name = mode==='signup' ? $('#a_name').value.trim() : '';
  if (!phone || !password || (mode==='signup' && !name)) return toast('Fill all fields');
  try {
    const r = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ name, phone, password, role: 'customer' }) });
    state.token = r.token; state.user = r.user; save();
    state.view = 'home'; render(); toast('Welcome!');
  } catch(e) { toast(e.message); }
}

function logout() {
  state.token = null; state.user = null; localStorage.removeItem('pm_token'); localStorage.removeItem('pm_user');
  state.view = 'home'; render();
}

async function placeOrder() {
  const name = $('#co_name').value.trim();
  const phone = $('#co_phone').value.trim();
  const address = $('#co_address').value.trim();
  const note = $('#co_note').value.trim();
  const payment = $('#co_pay').value;
  if (!name || !phone || !address) return toast('Fill all fields');
  const items = Object.entries(state.cart).map(([id,qty]) => ({ id: Number(id), qty }));
  try {
    const r = await api('/orders', { method:'POST', body: JSON.stringify({ items, name, phone, address, note, payment }) });
    state.cart = {}; save();
    toast('Order placed! #' + r.id);
    setTimeout(() => openOrder(r.id), 600);
  } catch(e) { toast(e.message); }
}

function bindEvents() {
  const sb = $('#searchBox');
  if (sb) sb.oninput = (e) => {
    state.search = e.target.value;
    const q = state.search.toLowerCase();
    // simple filter in current view
    if (!q) { render(); return; }
    const filtered = state.products.filter(p => p.name.toLowerCase().includes(q));
    const app = $('#app');
    app.innerHTML = renderTop() + `<div class="section"><h2>Results (${filtered.length})</h2><div class="prods">${filtered.map(prodCard).join('')}</div></div>` + renderBottom() + renderCartBar();
    bindEvents();
    $('#searchBox').value = state.search;
    $('#searchBox').focus();
  };
}

// ---------- INIT ----------
(async () => {
  await loadInit();
  render();
})();
