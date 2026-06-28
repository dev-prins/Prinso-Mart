// featureToggle.js - Soni Mart Feature Control System
const SoniMartFeatures = {
  settings: null,
  isInitialized: false,

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const res = await fetch('https://prinso-mart.onrender.com/api/settings');
      if (!res.ok) throw new Error('Failed');
      
      const data = await res.json();
      this.settings = data.settings || data || {};
      
      console.log('✅ SoniMart Features Loaded:', this.settings);
      this.applyAll();
    } catch (e) {
      console.warn('⚠️ Settings load failed, defaults chal rahe hain', e);
      this.settings = {};
      this.applyAll();
    }
  },

  isEnabled(feature) {
    if (!this.settings || this.settings[feature] === undefined) return true;
    return this.settings[feature] !== false;
  },

  applyAll() {
    // Maintenance Mode
    if (this.settings?.maintenanceMode === true) {
      document.body.innerHTML = `
        <div style="text-align:center;padding:100px 20px;font-family:system-ui;max-width:400px;margin:40px auto;">
          <div style="font-size:80px;margin-bottom:20px;">🛠️</div>
          <h1 style="color:#e65100;margin-bottom:16px;">Under Maintenance</h1>
          <p style="color:#666;line-height:1.6;">हम कुछ सुधार कर रहे हैं। थोड़ी देर बाद वापस आएं।</p>
          <button onclick="location.reload()" style="margin-top:30px;padding:12px 28px;background:#2e7d32;color:white;border:none;border-radius:12px;font-weight:600;cursor:pointer;">Refresh करो</button>
        </div>`;
      return;
    }

    // data-feature वाले elements को control करो
    document.querySelectorAll('[data-feature]').forEach(el => {
      const feature = el.getAttribute('data-feature');
      if (feature) {
        el.style.display = this.isEnabled(feature) ? '' : 'none';
      }
    });
  }
};

// Page load होने पर auto start
document.addEventListener('DOMContentLoaded', () => SoniMartFeatures.init());

// Global access
window.SoniMartFeatures = SoniMartFeatures;
