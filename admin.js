// PrinsoMart Admin Panel
const API = '/api';
let state = {
  token: localStorage.getItem('pma_token') || null,
  user: JSON.parse(localStorage.getItem('pma_user') || 'null'),
  view: 'dashboard',
  data: {}, categories: [], partners: []
};

const $ = s => document.querySelector(s);
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800); };
const fmt = n => '₹' + Number(n||0).toFixed(0);
const save = () => {
  if (state.token) localStorage.setItem('pma_token', state.token);
  if (state.user) localStorage.setItem('pma_user', JSON.stringify(state.user));
};

async function api(p, opts={}) {
  const h = { 'Content-Type':'application/json' };
  if (state.token) h.Authorization = 'Bearer ' + state.token;
  const r = await fetch(API+p, { ...opts, headers: { ...h, ...(opts.headers||{}) } });
  if (!r.ok) { const e = await r.json().catch(()=>({error:'err'})); throw new Error(e.error || 'err'); }
  return r.json();
}

function render() {
  if (!state.user || state.user.role !== 'admin') { $('#app').innerHTML = renderLogin(); return; }
  $('#app').innerHTML = `
  <div class="admin-shell">
    <div class="admin-side" id="side">
      <div class="logo">🛒 PrinsoMart</div>
      <a class="${state.view==='dashboard'?'active':''}" onclick="go('dashboard')">📊 Dashboard</a>
      <a class="${state.view==='orders'?'active':''}" onclick="go('orders')">📦 Orders</a>
      <a class="${state.view==='products'?'active':''}" onclick="go('products')">🛍️ Products</a>
      <a class="${state.view==='categories'?'active':''}" onclick="go('categories')">📂 Categories</a>
      <a class="${state.view==='customers'?'active':''}" onclick="go('customers')">👥 Customers</a>
      <a class="${state.view==='partners'?'active':''}" onclick="go('partners')">🛵 Delivery Partners</a>
      <a class="${state.view==='areas'?'active':''}" onclick="go('areas')">📍 Service Areas</a>
      <a class="${state.view==='settings'?'active':''}" onclick="go('settings')">⚙️ Settings</a>
      <a onclick="logout()" style="margin-top:20px;color:#f87171">🚪 Logout</a>
    </div>
    <div class="admin-main">
      <div class="mob-menu" onclick="$('#side').classList.toggle('open')">☰ Menu</div>
      <div id="content">Loading...</div>
    </div>
  </div>`;
  loadView();
}

async function loadView() {
  try {
    if (state.view === 'dashboard') return loadDashboard();
    if (state.view === 'orders') return loadOrders();
    if (state.view === 'products') return loadProducts();
    if (state.view === 'categories') return loadCategories();
    if (state.view === 'customers') return loadUsers('customer');
    if (state.view === 'partners') return loadUsers('partner');
    if (state.view === 'areas') return loadAreas();
    if (state.view === 'settings') return loadSettings();
  } catch(e) { $('#content').innerHTML = '<div>'+e.message+'</div>'; }
}

async function loadDashboard() {
  const d = await api('/admin/dashboard');
  $('#content').innerHTML = `
    <h1>Dashboard</h1>
    <div class="stats">
      <div class="stat"><div class="l">Today's Orders</div><div class="v">${d.today_orders}</div></div>
      <div class="stat"><div class="l">Today's Revenue</div><div class="v">${fmt(d.today_revenue)}</div></div>
      <div class="stat"><div class="l">Live Orders</div><div class="v">${d.live_orders}</div></div>
      <div class="stat"><div class="l">Customers</div><div class="v">${d.customers}</div></div>
      <div class="stat"><div class="l">Active Partners</div><div class="v">${d.active_partners}</div></div>
      <div class="stat"><div class="l">Pending Partners</div><div class="v">${d.pending_partners}</div></div>
      <div class="stat"><div class="l">Total Products</div><div class="v">${d.products}</div></div>
    </div>
    <h2 style="margin-top:20px">Quick Actions</h2>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="action-btn green" onclick="go('products')">+ Add Product</button>
      <button class="action-btn green" onclick="go('orders')">View Orders</button>
      <button class="action-btn green" onclick="go('partners')">Approve Partners</button>
      <button class="action-btn green" onclick="go('settings')">App Settings</button>
    </div>`;
}

async function loadOrders() {
  const list = await api('/admin/orders');
  const partners = await api('/admin/users?role=partner');
  state.partners = partners.filter(p => p.status==='active');
  $('#content').innerHTML = `
    <h1>Orders (${list.length})</h1>
    <table class="table">
      <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Partner</th><th>Date</th><th>Action</th></tr></thead>
      <tbody>${list.map(o => {
        const items = JSON.parse(o.items_json);
        return `<tr>
          <td><b>#${o.id}</b></td>
          <td>${o.customer_name}<br><small>${o.phone}</small></td>
          <td>${items.length} items</td>
          <td><b>${fmt(o.total)}</b></td>
          <td><span class="status-pill s-${o.status}">${o.status.replace(/_/g,' ')}</span></td>
          <td>${o.partner_name||'<select onchange="assignPartner('+o.id+',this.value)"><option value="">-- assign --</option>'+state.partners.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')+'</select>'}</td>
          <td><small>${new Date(o.created_at).toLocaleString()}</small></td>
          <td>
            <button class="action-btn gray" onclick="viewOrder(${o.id})">View</button>
            ${o.status!=='cancelled'&&o.status!=='delivered'?`<button class="action-btn red" onclick="cancelOrder(${o.id})">Cancel</button>`:''}
          </td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
}
async function assignPartner(id, partner_id) {
  if (!partner_id) return;
  try { await api('/admin/orders/'+id+'/assign', { method:'POST', body: JSON.stringify({partner_id:Number(partner_id)}) }); toast('Assigned'); loadOrders(); }
  catch(e) { toast(e.message); }
}
async function cancelOrder(id) {
  if (!confirm('Cancel order #'+id+'?')) return;
  try { await api('/admin/orders/'+id+'/cancel', { method:'POST' }); toast('Cancelled'); loadOrders(); }
  catch(e) { toast(e.message); }
}
async function viewOrder(id) {
  const o = await api('/orders/'+id);
  const items = JSON.parse(o.items_json);
  showModal(`Order #${o.id}`, `
    <p><b>Customer:</b> ${o.name} • ${o.phone}</p>
    <p><b>Address:</b> ${o.address}</p>
    <p><b>Payment:</b> ${o.payment.toUpperCase()}</p>
    <p><b>Status:</b> <span class="status-pill s-${o.status}">${o.status}</span></p>
    <table class="table" style="margin-top:10px">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${items.map(i=>`<tr><td>${i.name}</td><td>${i.qty}</td><td>${fmt(i.price)}</td><td>${fmt(i.price*i.qty)}</td></tr>`).join('')}</tbody>
    </table>
    <p style="margin-top:10px"><b>Subtotal:</b> ${fmt(o.subtotal)} • <b>Delivery:</b> ${fmt(o.delivery_charge)} • <b>Total:</b> ${fmt(o.total)}</p>
    ${o.note?'<p><b>Note:</b> '+o.note+'</p>':''}
  `);
}

async function loadProducts() {
  const [list, cats] = await Promise.all([api('/admin/products'), api('/categories')]);
  state.categories = cats;
  $('#content').innerHTML = `
    <h1>Products (${list.length}) <button class="action-btn green" style="float:right" onclick="editProduct()">+ Add Product</button></h1>
    <table class="table">
      <thead><tr><th>ID</th><th></th><th>Name</th><th>Category</th><th>Weight</th><th>MRP</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${list.map(p => `<tr>
        <td>${p.id}</td>
        <td style="font-size:24px">${p.image||'🛒'}</td>
        <td>${p.name}</td>
        <td>${p.category_name||'-'}</td>
        <td>${p.weight||'-'}</td>
        <td>${fmt(p.mrp)}</td>
        <td><b>${fmt(p.price)}</b></td>
        <td>${p.stock}</td>
        <td>${p.active?'✅':'❌'}</td>
        <td>
          <button class="action-btn gray" onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
          <button class="action-btn red" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>`;
}
function editProduct(p) {
  p = p || { name:'', category_id:'', weight:'', mrp:0, price:0, stock:0, image:'🛒', description:'', active:1 };
  const opts = state.categories.map(c => `<option value="${c.id}" ${p.category_id==c.id?'selected':''}>${c.name}</option>`).join('');
  showModal(p.id?'Edit Product':'Add Product', `
    <div class="form" style="border:none;padding:0">
      <label>Name</label><input id="p_name" value="${p.name}">
      <label>Category</label><select id="p_cat"><option value="">--</option>${opts}</select>
      <label>Weight (e.g. 1 kg, 500 g)</label><input id="p_w" value="${p.weight||''}">
      <div style="display:flex;gap:8px">
        <div style="flex:1"><label>MRP</label><input id="p_mrp" type="number" value="${p.mrp}"></div>
        <div style="flex:1"><label>Price</label><input id="p_price" type="number" value="${p.price}"></div>
        <div style="flex:1"><label>Stock</label><input id="p_stock" type="number" value="${p.stock}"></div>
      </div>
      <label>Emoji/Image</label><input id="p_img" value="${p.image||'🛒'}">
      <label>Description</label><textarea id="p_desc" rows="2">${p.description||''}</textarea>
      <label><input id="p_act" type="checkbox" ${p.active?'checked':''}> Active</label>
      <button class="btn" onclick="saveProduct(${p.id||'null'})">${p.id?'Update':'Create'}</button>
    </div>`);
}
async function saveProduct(id) {
  const body = {
    name: $('#p_name').value, category_id: Number($('#p_cat').value)||null,
    weight: $('#p_w').value, mrp: Number($('#p_mrp').value), price: Number($('#p_price').value),
    stock: Number($('#p_stock').value), image: $('#p_img').value, description: $('#p_desc').value,
    active: $('#p_act').checked
  };
  try {
    if (id) await api('/admin/products/'+id, { method:'PUT', body: JSON.stringify(body) });
    else await api('/admin/products', { method:'POST', body: JSON.stringify(body) });
    closeModal(); toast('Saved'); loadProducts();
  } catch(e) { toast(e.message); }
}
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await api('/admin/products/'+id, { method:'DELETE' });
  toast('Deleted'); loadProducts();
}

async function loadCategories() {
  const list = await api('/categories');
  $('#content').innerHTML = `
    <h1>Categories (${list.length}) <button class="action-btn green" style="float:right" onclick="addCat()">+ Add</button></h1>
    <table class="table">
      <thead><tr><th>ID</th><th>Icon</th><th>Name</th><th>Sort</th><th>Action</th></tr></thead>
      <tbody>${list.map(c=>`<tr><td>${c.id}</td><td style="font-size:24px">${c.icon}</td><td>${c.name}</td><td>${c.sort_order}</td><td><button class="action-btn red" onclick="delCat(${c.id})">Delete</button></td></tr>`).join('')}</tbody>
    </table>`;
}
function addCat() {
  showModal('Add Category', `<div class="form" style="border:none;padding:0">
    <label>Name</label><input id="c_name">
    <label>Icon (emoji)</label><input id="c_icon" value="🛒">
    <label>Sort Order</label><input id="c_sort" type="number" value="99">
    <button class="btn" onclick="saveCat()">Create</button></div>`);
}
async function saveCat() {
  try {
    await api('/admin/categories', { method:'POST', body: JSON.stringify({ name: $('#c_name').value, icon: $('#c_icon').value, sort_order: Number($('#c_sort').value) }) });
    closeModal(); toast('Added'); loadCategories();
  } catch(e) { toast(e.message); }
}
async function delCat(id) {
  if (!confirm('Delete?')) return;
  await api('/admin/categories/'+id, { method:'DELETE' });
  loadCategories();
}

async function loadUsers(role) {
  const list = await api('/admin/users?role='+role);
  const isPartner = role === 'partner';
  $('#content').innerHTML = `
    <h1>${isPartner?'Delivery Partners':'Customers'} (${list.length})</h1>
    <table class="table">
      <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>City</th>${isPartner?'<th>Vehicle</th><th>Rating</th>':''}<th>Status</th><th>Joined</th><th>Action</th></tr></thead>
      <tbody>${list.map(u=>`<tr>
        <td>${u.id}</td><td><b>${u.name}</b></td><td>${u.phone||'-'}</td><td>${u.city||'-'}</td>
        ${isPartner?`<td>${u.vehicle||'-'}</td><td>⭐ ${u.rating}</td>`:''}
        <td><span class="status-pill s-${u.status==='active'?'delivered':(u.status==='pending'?'placed':'cancelled')}">${u.status}</span></td>
        <td><small>${new Date(u.created_at).toLocaleDateString()}</small></td>
        <td>
          ${u.status==='pending'?`<button class="action-btn green" onclick="setUserStatus(${u.id},'active')">Approve</button>`:''}
          ${u.status==='active'?`<button class="action-btn red" onclick="setUserStatus(${u.id},'blocked')">Block</button>`:''}
          ${u.status==='blocked'?`<button class="action-btn green" onclick="setUserStatus(${u.id},'active')">Unblock</button>`:''}
          <button class="action-btn red" onclick="delUser(${u.id})">Delete</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>`;
}
async function setUserStatus(id, status) {
  await api('/admin/users/'+id+'/status', { method:'POST', body: JSON.stringify({status}) });
  toast('Updated'); loadView();
}
async function delUser(id) {
  if (!confirm('Delete user?')) return;
  await api('/admin/users/'+id, { method:'DELETE' });
  loadView();
}

async function loadAreas() {
  const list = await api('/service-areas');
  $('#content').innerHTML = `
    <h1>Service Areas (${list.length})
      <button class="action-btn green" style="float:right" onclick="addArea()">+ Add City/Pincode</button>
    </h1>
    <table class="table">
      <thead><tr><th>ID</th><th>City</th><th>Pincode</th><th>Action</th></tr></thead>
      <tbody>${list.map(a=>`<tr><td>${a.id}</td><td>${a.city}</td><td>${a.pincode}</td><td><button class="action-btn red" onclick="delArea(${a.id})">Remove</button></td></tr>`).join('')}</tbody>
    </table>
    <p style="margin-top:14px;color:#666;font-size:13px">Add cities like Bhopal, Ujjain, Gwalior, Sagar, Rewa, Satna etc. as you expand.</p>`;
}
function addArea() {
  showModal('Add Service Area', `<div class="form" style="border:none;padding:0">
    <label>City</label><input id="a_city" placeholder="Umaria">
    <label>Pincode</label><input id="a_pin" placeholder="484661">
    <button class="btn" onclick="saveArea()">Add</button></div>`);
}
async function saveArea() {
  try {
    await api('/admin/service-areas', { method:'POST', body: JSON.stringify({ city: $('#a_city').value, pincode: $('#a_pin').value }) });
    closeModal(); toast('Added'); loadAreas();
  } catch(e) { toast(e.message); }
}
async function delArea(id) {
  await api('/admin/service-areas/'+id, { method:'DELETE' });
  loadAreas();
}

async function loadSettings() {
  const s = await api('/settings');
  $('#content').innerHTML = `
    <h1>App Settings</h1>
    <div class="form" style="max-width:600px">
      <label>App Name</label><input id="s_app_name" value="${s.app_name||''}">
      <label>Tagline</label><input id="s_tagline" value="${s.tagline||''}">
      <label>Free Delivery Above (₹)</label><input id="s_free_delivery_above" type="number" value="${s.free_delivery_above||199}">
      <label>Delivery Charge (₹)</label><input id="s_delivery_charge" type="number" value="${s.delivery_charge||20}">
      <label>Minimum Order (₹)</label><input id="s_min_order" type="number" value="${s.min_order||99}">
      <label>Opening Time</label><input id="s_open_time" type="time" value="${s.open_time||'08:00'}">
      <label>Closing Time</label><input id="s_close_time" type="time" value="${s.close_time||'22:00'}">
      <label>Support Phone</label><input id="s_support_phone" value="${s.support_phone||''}">
      <label>Support Email</label><input id="s_support_email" value="${s.support_email||''}">
      <label><input id="s_cod_enabled" type="checkbox" ${s.cod_enabled=='1'?'checked':''}> COD Enabled</label>
      <label><input id="s_online_enabled" type="checkbox" ${s.online_enabled=='1'?'checked':''}> Online Payment Enabled</label>
      <button class="btn" onclick="saveSettings()">Save Settings</button>
    </div>`;
}
async function saveSettings() {
  const keys = ['app_name','tagline','free_delivery_above','delivery_charge','min_order','open_time','close_time','support_phone','support_email'];
  const body = {};
  keys.forEach(k => body[k] = $('#s_'+k).value);
  body.cod_enabled = $('#s_cod_enabled').checked ? '1' : '0';
  body.online_enabled = $('#s_online_enabled').checked ? '1' : '0';
  try { await api('/admin/settings', { method:'PUT', body: JSON.stringify(body) }); toast('Saved!'); }
  catch(e) { toast(e.message); }
}

function renderLogin() {
  return `<div class="auth-wrap" style="max-width:420px;margin:80px auto">
    <div class="auth-card">
      <h1>🛒 Admin Login</h1>
      <div class="sub">PrinsoMart Admin Panel</div>
      <label>Email</label>
      <input id="l_email" value="princesoni5010@gmail.com">
      <label>Password</label>
      <input id="l_pass" type="password" value="admin@123">
      <button class="btn" onclick="login()">Login</button>
      <div style="margin-top:10px;text-align:center;font-size:12px;color:#888">Default: princesoni5010@gmail.com / admin@123</div>
    </div>
  </div>`;
}

async function login() {
  try {
    const r = await api('/auth/login', { method:'POST', body: JSON.stringify({ email: $('#l_email').value, password: $('#l_pass').value, role: 'admin' }) });
    state.token = r.token; state.user = r.user; save(); render();
  } catch(e) { toast(e.message); }
}

function go(v) { state.view = v; render(); }
function logout() {
  state.token = null; state.user = null;
  localStorage.removeItem('pma_token'); localStorage.removeItem('pma_user');
  render();
}

function showModal(title, body) {
  let m = document.getElementById('modalBg');
  if (m) m.remove();
  m = document.createElement('div');
  m.id = 'modalBg'; m.className = 'modal-bg';
  m.innerHTML = `<div class="modal"><h3>${title}</h3>${body}</div>`;
  m.onclick = e => { if (e.target === m) closeModal(); };
  document.body.appendChild(m);
}
function closeModal() { const m = document.getElementById('modalBg'); if (m) m.remove(); }

render();
