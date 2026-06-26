// PrinsoMart Delivery Partner App
const API = '/api';
let state = {
  token: localStorage.getItem('pmp_token') || null,
  user: JSON.parse(localStorage.getItem('pmp_user') || 'null'),
  view: 'available',
  online: localStorage.getItem('pmp_online') === '1'
};

const $ = s => document.querySelector(s);
const save = () => {
  if (state.token) localStorage.setItem('pmp_token', state.token);
  if (state.user) localStorage.setItem('pmp_user', JSON.stringify(state.user));
  localStorage.setItem('pmp_online', state.online ? '1' : '0');
};
const toast = m => {
  const t = $('#toast'); t.textContent = m; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
};
const fmt = n => '₹' + Number(n).toFixed(0);

async function api(p, opts={}) {
  const h = { 'Content-Type': 'application/json' };
  if (state.token) h.Authorization = 'Bearer ' + state.token;
  const r = await fetch(API + p, { ...opts, headers: { ...h, ...(opts.headers||{}) } });
  if (!r.ok) { const e = await r.json().catch(()=>({error:'err'})); throw new Error(e.error || 'err'); }
  return r.json();
}

function render() {
  const app = $('#app');
  if (!state.user) return app.innerHTML = renderAuth();
  let body = '';
  if (state.view === 'available') body = renderAvailable();
  else if (state.view === 'mine') body = renderMine();
  else if (state.view === 'earnings') body = renderEarnings();
  else if (state.view === 'profile') body = renderProfile();
  app.innerHTML = renderTop() + body + renderBottom();
}

function renderTop() {
  return `<div class="topbar">
    <div>
      <div class="logo">🛵 Partner</div>
      <div class="tag">PrinsoMart Delivery</div>
    </div>
    <div class="right">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff;cursor:pointer">
        <input type="checkbox" ${state.online?'checked':''} onchange="toggleOnline(this.checked)" style="width:16px;height:16px">
        ${state.online?'ONLINE':'OFFLINE'}
      </label>
    </div>
  </div>`;
}

function renderBottom() {
  const v = state.view;
  return `<div class="bottom-nav">
    <div class="item ${v==='available'?'active':''}" onclick="go('available')"><div class="e">📥</div>New</div>
    <div class="item ${v==='mine'?'active':''}" onclick="go('mine')"><div class="e">📦</div>My Orders</div>
    <div class="item ${v==='earnings'?'active':''}" onclick="go('earnings')"><div class="e">💰</div>Earnings</div>
    <div class="item ${v==='profile'?'active':''}" onclick="go('profile')"><div class="e">👤</div>Profile</div>
  </div>`;
}

function renderAvailable() {
  return `<div class="section">
    <h2>Available Orders</h2>
    <div id="list">Loading...</div>
  </div>`;
}
async function loadAvailable() {
  try {
    if (!state.online) { $('#list').innerHTML = '<div class="empty"><div class="e">😴</div>Go Online to see orders</div>'; return; }
    const list = await api('/partner/orders/available');
    if (!list.length) { $('#list').innerHTML = '<div class="empty"><div class="e">⏳</div>No orders right now</div>'; return; }
    $('#list').innerHTML = list.map(o => `
      <div class="order-card">
        <div class="order-head">
          <div><b>Order #${o.id}</b><div style="font-size:11px;color:#888">${new Date(o.created_at).toLocaleTimeString()}</div></div>
          <div class="status-pill s-${o.status}">${fmt(o.total)}</div>
        </div>
        <div style="font-size:13px;margin:6px 0"><b>📍 ${o.name}</b> (${o.phone})</div>
        <div style="font-size:12px;color:#666;margin-bottom:8px">${o.address}</div>
        <button class="btn" onclick="acceptOrder(${o.id})">Accept Order</button>
      </div>`).join('');
  } catch(e) { toast(e.message); }
}

function renderMine() {
  return `<div class="section">
    <h2>My Orders</h2>
    <div id="list2">Loading...</div>
  </div>`;
}
async function loadMine() {
  try {
    const list = await api('/partner/orders/mine');
    if (!list.length) { $('#list2').innerHTML = '<div class="empty"><div class="e">📦</div>No orders yet</div>'; return; }
    $('#list2').innerHTML = list.map(o => {
      const items = JSON.parse(o.items_json);
      const next = nextStatus(o.status);
      return `<div class="order-card">
        <div class="order-head">
          <div><b>Order #${o.id}</b><div style="font-size:11px;color:#888">${new Date(o.created_at).toLocaleString()}</div></div>
          <div class="status-pill s-${o.status}">${o.status.replace(/_/g,' ')}</div>
        </div>
        <div style="font-size:13px"><b>📍 ${o.name}</b> (<a href="tel:${o.phone}">${o.phone}</a>)</div>
        <div style="font-size:12px;color:#666;margin:4px 0">${o.address}</div>
        <div style="font-size:12px;color:#666;margin:4px 0">${items.length} items • ${fmt(o.total)} ${o.payment==='cod'?'(COD - Collect cash)':'(Paid)'}</div>
        ${next ? `<button class="btn" onclick="updateStatus(${o.id},'${next.key}')">${next.label}</button>` : ''}
      </div>`;
    }).join('');
  } catch(e) { toast(e.message); }
}

function nextStatus(s) {
  if (s === 'accepted') return { key:'packed', label:'Mark as Packed' };
  if (s === 'packed') return { key:'out_for_delivery', label:'Start Delivery 🛵' };
  if (s === 'out_for_delivery') return { key:'delivered', label:'Mark as Delivered ✅' };
  return null;
}

function renderEarnings() {
  return `<div class="section">
    <h2>Earnings</h2>
    <div id="earn">Loading...</div>
  </div>`;
}
async function loadEarnings() {
  try {
    const e = await api('/partner/earnings');
    $('#earn').innerHTML = `
      <div class="stats" style="grid-template-columns:1fr 1fr">
        <div class="stat"><div class="l">Today Earnings</div><div class="v">${fmt(e.today_earnings)}</div></div>
        <div class="stat"><div class="l">Today Deliveries</div><div class="v">${e.today_count}</div></div>
        <div class="stat"><div class="l">Total Earnings</div><div class="v">${fmt(e.total_earnings)}</div></div>
        <div class="stat"><div class="l">Total Deliveries</div><div class="v">${e.total_deliveries}</div></div>
      </div>
      <div style="margin-top:14px;text-align:center;color:#888;font-size:12px">₹20 per delivery</div>`;
  } catch(e) { toast(e.message); }
}

function renderProfile() {
  return `<div class="section">
    <h2>Profile</h2>
    <div class="form">
      <div style="text-align:center;font-size:50px">🛵</div>
      <div style="text-align:center;font-weight:700;font-size:18px;margin-top:6px">${state.user.name}</div>
      <div style="text-align:center;color:#888;font-size:13px">${state.user.phone||''}</div>
      <div style="text-align:center;color:#888;font-size:12px;margin-top:4px">Status: ${state.user.status}</div>
    </div>
    <button class="btn outline" style="margin-top:14px" onclick="logout()">Logout</button>
    <div style="margin-top:14px;text-align:center;font-size:12px;color:#888">
      Customer App: <a href="/" style="color:#0c831f;font-weight:700">Click Here</a>
    </div>
  </div>`;
}

function renderAuth() {
  const mode = state._authMode || 'login';
  return `<div class="topbar"><div class="logo">🛵 PrinsoMart Partner</div></div>
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>${mode==='login'?'Partner Login':'Become a Partner'}</h1>
      <div class="sub">${mode==='login'?'Login to start delivering':'Signup requires admin approval'}</div>
      <div class="tabs">
        <button class="${mode==='login'?'on':''}" onclick="state._authMode='login';render()">Login</button>
        <button class="${mode==='signup'?'on':''}" onclick="state._authMode='signup';render()">Sign Up</button>
      </div>
      ${mode==='signup'?'<label>Full Name</label><input id="a_name">':''}
      <label>Phone</label>
      <input id="a_phone" inputmode="numeric" maxlength="10">
      <label>Password</label>
      <input id="a_pass" type="password">
      <button class="btn" onclick="doAuth()">${mode==='login'?'Login':'Sign Up'}</button>
      <div style="margin-top:12px;text-align:center;font-size:12px;color:#888">
        Demo: <b>9000000000</b> / <b>partner@123</b>
      </div>
      <div style="margin-top:8px;text-align:center;font-size:12px;color:#888">
        Customer? <a href="/" style="color:#0c831f;font-weight:700">Customer App</a>
      </div>
    </div>
  </div>`;
}

function go(v) {
  state.view = v; render();
  if (v === 'available') setTimeout(loadAvailable, 50);
  if (v === 'mine') setTimeout(loadMine, 50);
  if (v === 'earnings') setTimeout(loadEarnings, 50);
}

async function doAuth() {
  const mode = state._authMode || 'login';
  const phone = $('#a_phone').value.trim();
  const password = $('#a_pass').value;
  const name = mode==='signup' ? $('#a_name').value.trim() : '';
  if (!phone || !password || (mode==='signup' && !name)) return toast('Fill all fields');
  try {
    const r = await api(`/auth/${mode}`, { method:'POST', body: JSON.stringify({ name, phone, password, role: 'partner' }) });
    if (mode === 'signup') {
      toast('Signup successful! Wait for admin approval');
      state._authMode = 'login'; render(); return;
    }
    state.token = r.token; state.user = r.user; save();
    state.view = 'available'; render(); setTimeout(loadAvailable, 50);
  } catch(e) { toast(e.message); }
}

function toggleOnline(v) { state.online = v; save(); render(); if (state.view==='available') loadAvailable(); }
async function acceptOrder(id) {
  try { await api('/partner/orders/'+id+'/accept', { method:'POST' }); toast('Order accepted'); loadAvailable(); }
  catch(e) { toast(e.message); }
}
async function updateStatus(id, status) {
  try { await api('/partner/orders/'+id+'/status', { method:'POST', body: JSON.stringify({status}) }); toast('Updated'); loadMine(); }
  catch(e) { toast(e.message); }
}
function logout() {
  state.token=null; state.user=null;
  localStorage.removeItem('pmp_token'); localStorage.removeItem('pmp_user');
  render();
}

// auto-refresh available every 15s
setInterval(() => { if (state.user && state.view==='available' && state.online) loadAvailable(); }, 15000);

render();
if (state.user && state.view==='available') setTimeout(loadAvailable, 50);
