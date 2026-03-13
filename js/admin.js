// admin.js - Admin dashboard backed by localStorage (demo)
(() => {
  const ADMIN_USERNAME = 'admin01';
  const LS_USERS = 'abz_users';
  const LS_PROPERTIES = 'abz_properties';
  const LS_SETTINGS = 'abz_settings';

  function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  function isAdmin() {
    return (
      localStorage.getItem('isAdmin') === 'true' &&
      localStorage.getItem('username') === ADMIN_USERNAME
    );
  }

  function requireAdminOrRedirect() {
    const loggedIn =
      typeof AuthState !== 'undefined' ? AuthState.check() : isLoggedIn();

    if (!loggedIn) {
      alert('Vui long dang nhap de truy cap trang nay!');
      window.location.href = 'dang-nhap.html';
      return false;
    }

    if (!isAdmin()) {
      alert('Ban khong co quyen truy cap trang quan tri!');
      window.location.href = '../index.html';
      return false;
    }

    return true;
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function asDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function normalizeForSearch(value) {
    const s = String(value || '')
      .toLowerCase()
      .trim();
    // Remove diacritics so "Sapa" can match "Sa Pa".
    try {
      return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
    } catch {
      return s.replace(/\s+/g, ' ');
    }
  }

  function splitTerms(query) {
    const q = normalizeForSearch(query);
    if (!q) return [];
    return q.split(' ').map((t) => t.trim()).filter(Boolean);
  }

  function matchesAllTerms(haystack, terms) {
    if (!terms || terms.length === 0) return true;
    const h = normalizeForSearch(haystack);
    return terms.every((t) => h.includes(t));
  }

  function numericPrice(property) {
    if (!property) return 0;
    const v = property.price;
    const n = typeof v === 'number' ? v : Number(String(v || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function formatNumber(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0';
    return value.toLocaleString('vi-VN');
  }

  function statusBadge(status) {
    if (status === 'approved') {
      return '<span class="status approved">Da duyet</span>';
    }
    if (status === 'rejected') {
      return '<span class="status rejected">Tu choi</span>';
    }
    return '<span class="status pending">Cho duyet</span>';
  }

  function activeBadge(isActive) {
    return isActive
      ? '<span class="status active">Hoat dong</span>'
      : '<span class="status inactive">Khong hoat dong</span>';
  }

  function roleLabel(user) {
    return user && user.isAdmin ? 'Admin' : 'Nguoi dung';
  }

  function getUsers() {
    const users = safeJsonParse(localStorage.getItem(LS_USERS) || '[]', []);
    if (!Array.isArray(users)) return [];

    return users.map((u) => ({
      id: u.id || Date.now().toString(),
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      username: u.username || '',
      phone: u.phone || '',
      password: u.password || '',
      createdAt: u.createdAt || new Date().toISOString(),
      isAdmin: !!u.isAdmin,
      isActive: typeof u.isActive === 'boolean' ? u.isActive : true,
    }));
  }

  function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  function getSettings() {
    const s = safeJsonParse(localStorage.getItem(LS_SETTINGS) || '{}', {});
    return {
      siteTitle: s.siteTitle || 'ABZ GROUP',
      contactEmail: s.contactEmail || 'contact@abzgroup.com',
      maintenance: !!s.maintenance,
    };
  }

  function saveSettings(settings) {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }

  function getAllProperties() {
    if (typeof window.dataManager === 'undefined') return [];
    const props = window.dataManager.getAllProperties();
    return Array.isArray(props) ? props : [];
  }

  function formatPrice(property) {
    if (!property) return 'N/A';
    const price = property.price;
    if (price === null || price === undefined || price === '') return 'Lien he';
    const n = typeof price === 'number' ? price : Number(price);
    if (Number.isNaN(n)) return String(price);
    const suffix = property.listingType === 'thue' ? ' d/thang' : ' d';
    return formatNumber(n) + suffix;
  }

  function computeDashboardStats() {
    const users = getUsers();
    const props = getAllProperties();
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    const newThisMonth = props.filter((p) => {
      const d = asDate(p.createdAt);
      return d && d.getMonth() === m && d.getFullYear() === y;
    }).length;

    const totalViews = props.reduce(
      (sum, p) => sum + (typeof p.views === 'number' ? p.views : 0),
      0
    );

    return {
      usersTotal: users.length + 1, // + admin account
      propertiesTotal: props.length,
      newThisMonth,
      totalViews,
    };
  }

  function renderDashboard() {
    const stats = computeDashboardStats();
    const elUsers = document.getElementById('adminStatUsers');
    const elProps = document.getElementById('adminStatProperties');
    const elNew = document.getElementById('adminStatNewThisMonth');
    const elViews = document.getElementById('adminStatViews');

    if (elUsers) elUsers.textContent = formatNumber(stats.usersTotal);
    if (elProps) elProps.textContent = formatNumber(stats.propertiesTotal);
    if (elNew) elNew.textContent = formatNumber(stats.newThisMonth);
    if (elViews) elViews.textContent = formatNumber(stats.totalViews);

    renderRecentActivity();
  }

  function renderRecentActivity() {
    const host = document.getElementById('adminRecentActivity');
    if (!host) return;

    const users = getUsers()
      .slice()
      .sort(
        (a, b) =>
          (asDate(b.createdAt)?.getTime() || 0) - (asDate(a.createdAt)?.getTime() || 0)
      );

    const props = getAllProperties()
      .slice()
      .sort(
        (a, b) =>
          (asDate(b.createdAt)?.getTime() || 0) - (asDate(a.createdAt)?.getTime() || 0)
      );

    const items = [];

    props.slice(0, 3).forEach((p) => {
      const title = p.title || p.id || 'Tin khong tieu de';
      const s = p.status === 'approved' ? 'da duyet' : p.status === 'rejected' ? 'bi tu choi' : 'cho duyet';
      items.push(`Tin "${title}" ${s}`);
    });

    users.slice(0, 2).forEach((u) => {
      const name =
        [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
        u.username ||
        u.email ||
        'nguoi dung';
      items.push(`Nguoi dung "${name}" vua dang ky`);
    });

    host.innerHTML = '';
    if (items.length === 0) {
      host.innerHTML = '<li>Khong co hoat dong moi.</li>';
      return;
    }

    items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      host.appendChild(li);
    });
  }

  function renderUsersTable() {
    const tbody = document.getElementById('adminUsersTbody');
    if (!tbody) return;

    const qRaw = document.querySelector('#users .search-input')?.value || '';
    const terms = splitTerms(qRaw);
    const roleFilter = document.getElementById('adminUserRoleFilter')?.value || '';
    const statusFilter = document.getElementById('adminUserStatusFilter')?.value || '';

    const users = getUsers();

    const rows = [];
    const adminRow = {
      id: 'admin',
      name: 'Admin',
      email: '-',
      role: 'Admin',
      isActive: true,
      actionsHtml: '<button class="btn btn-sm btn-outline" disabled>Chinh sua</button>',
    };
    const adminHaystack = [adminRow.id, adminRow.name, adminRow.role].join(' ');
    const adminRoleOk = !roleFilter || roleFilter === 'admin';
    const adminStatusOk = !statusFilter || statusFilter === 'active';
    if (adminRoleOk && adminStatusOk && matchesAllTerms(adminHaystack, terms)) {
      rows.push(adminRow);
    }

    users.forEach((u) => {
      const name =
        [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
        u.username ||
        u.email ||
        '(Khong ten)';
      const userRole = roleLabel(u);
      const roleOk =
        !roleFilter ||
        (roleFilter === 'admin' && userRole.toLowerCase() === 'admin') ||
        (roleFilter === 'user' && userRole.toLowerCase() !== 'admin');
      if (!roleOk) return;

      const statusOk =
        !statusFilter ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'inactive' && !u.isActive);
      if (!statusOk) return;

      const haystack = [u.id, name, u.email, u.username, u.phone, userRole].join(' ');
      if (!matchesAllTerms(haystack, terms)) return;

      const lockLabel = u.isActive ? 'Khoa' : 'Kich hoat';
      const lockClass = u.isActive ? 'btn-danger' : 'btn-success';

      rows.push({
        id: u.id,
        name,
        email: u.email || '-',
        role: roleLabel(u),
        isActive: u.isActive,
        actionsHtml: `
          <button class="btn btn-sm btn-outline" data-action="edit-user" data-id="${u.id}">Chinh sua</button>
          <button class="btn btn-sm ${lockClass}" data-action="toggle-user" data-id="${u.id}">${lockLabel}</button>
          <button class="btn btn-sm btn-danger" data-action="delete-user" data-id="${u.id}">Xoa</button>
        `.trim(),
      });
    });

    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 20px;">Khong co nguoi dung phu hop.</td></tr>';
      return;
    }

    rows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.email}</td>
        <td>${r.role}</td>
        <td>${activeBadge(r.isActive)}</td>
        <td>${r.actionsHtml}</td>
      `.trim();
      tbody.appendChild(tr);
    });
  }

  function handleAddUser() {
    const firstName = prompt('Ho:', '');
    if (firstName === null) return;
    const lastName = prompt('Ten:', '');
    if (lastName === null) return;
    const email = prompt('Email:', '');
    if (email === null) return;
    const username = prompt('Ten dang nhap:', '');
    if (username === null) return;
    const phone = prompt('So dien thoai:', '');
    if (phone === null) return;
    const password = prompt('Mat khau (>= 6 ky tu):', '');
    if (password === null) return;

    if (!username.trim() || !email.trim() || password.length < 6) {
      alert('Thong tin khong hop le.');
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.username === username.trim())) {
      alert('Ten dang nhap da ton tai.');
      return;
    }
    if (users.some((u) => u.email === email.trim())) {
      alert('Email da duoc dang ky.');
      return;
    }

    users.push({
      id: Date.now().toString(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      username: username.trim(),
      phone: phone.trim(),
      password,
      createdAt: new Date().toISOString(),
      isAdmin: false,
      isActive: true,
    });

    saveUsers(users);
    renderUsersTable();
    renderDashboard();
    alert('Da them nguoi dung.');
  }

  function handleUserTableClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (!id) return;

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return;

    if (action === 'toggle-user') {
      const next = !users[idx].isActive;
      const label = next ? 'kich hoat' : 'khoa';
      if (!confirm(`Ban chac chan muon ${label} tai khoan "${users[idx].username || users[idx].email}"?`)) {
        return;
      }
      users[idx].isActive = next;
      saveUsers(users);
      renderUsersTable();
      return;
    }

    if (action === 'edit-user') {
      const u = users[idx];
      const nextEmail = prompt('Email:', u.email || '');
      if (nextEmail === null) return;
      const nextPhone = prompt('So dien thoai:', u.phone || '');
      if (nextPhone === null) return;

      if (users.some((x, i) => i !== idx && x.email === nextEmail.trim())) {
        alert('Email da duoc dung boi tai khoan khac.');
        return;
      }

      users[idx] = { ...u, email: nextEmail.trim(), phone: nextPhone.trim() };
      saveUsers(users);
      renderUsersTable();
      alert('Da cap nhat nguoi dung.');
      return;
    }

    if (action === 'delete-user') {
      const u = users[idx];
      const username = u.username || '';
      const label = username || u.email || u.id;

      if (username === ADMIN_USERNAME) {
        alert('Khong the xoa tai khoan admin.');
        return;
      }

      if (!confirm(`Xoa thanh vien "${label}" va xoa luon cac bai dang cua ho?`)) {
        return;
      }

      users.splice(idx, 1);
      saveUsers(users);

      if (typeof window.dataManager !== 'undefined') {
        window.dataManager.loadData();
        const before = window.dataManager.properties.length;
        window.dataManager.properties = (window.dataManager.properties || []).filter((p) => {
          const owner = p.ownerUsername || (p.contactInfo && p.contactInfo.name) || p.postedBy || '';
          return owner !== username;
        });
        if (window.dataManager.properties.length !== before) {
          window.dataManager.saveData();
        }
      } else {
        // Fallback if DataManager isn't available for some reason.
        const props = safeJsonParse(localStorage.getItem(LS_PROPERTIES) || '[]', []);
        if (Array.isArray(props)) {
          const filtered = props.filter((p) => {
            const owner = p.ownerUsername || (p.contactInfo && p.contactInfo.name) || p.postedBy || '';
            return owner !== username;
          });
          localStorage.setItem(LS_PROPERTIES, JSON.stringify(filtered));
        }
      }

      renderUsersTable();
      renderPropertiesTable();
      renderDashboard();
      alert('Da xoa thanh vien.');
      return;
    }
  }

  function renderPropertiesTable() {
    const tbody = document.getElementById('adminPropertiesTbody');
    if (!tbody) return;

    if (typeof window.dataManager === 'undefined') {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 20px;">Thieu DataManager.</td></tr>';
      return;
    }

    const qRaw = document.getElementById('adminPropertySearch')?.value || '';
    const terms = splitTerms(qRaw);
    const status = document.getElementById('adminPropertyStatusFilter')?.value || '';
    const listingType = document.getElementById('adminPropertyListingTypeFilter')?.value || '';
    const featuredFilter = document.getElementById('adminPropertyFeaturedFilter')?.value || '';
    const verifiedFilter = document.getElementById('adminPropertyVerifiedFilter')?.value || '';
    const sort = document.getElementById('adminPropertySort')?.value || 'newest';

    const props = getAllProperties()
      .slice()
      .filter((p) => {
        if (status && p.status !== status) return false;
        if (listingType && p.listingType !== listingType) return false;
        if (featuredFilter === 'featured' && !p.featured) return false;
        if (featuredFilter === 'not_featured' && p.featured) return false;
        if (verifiedFilter === 'verified' && !p.verified) return false;
        if (verifiedFilter === 'not_verified' && p.verified) return false;

        if (!terms || terms.length === 0) return true;
        const author = p.contactInfo && p.contactInfo.name ? p.contactInfo.name : '';
        const extra = [
          p.type,
          p.listingType,
          p.priceRange,
          p.houseDirection,
          p.legalStatus,
          p.mapQuery,
          p.ownerUsername,
          p.featured ? 'noi bat featured' : '',
          p.verified ? 'xac thuc verified' : '',
          numericPrice(p),
        ].join(' ');
        const haystack = [p.id, p.title, p.location, p.address, author, p.status, extra].join(' ');
        return matchesAllTerms(haystack, terms);
      })
      .sort((a, b) => {
        if (sort === 'oldest') {
          return (asDate(a.createdAt)?.getTime() || 0) - (asDate(b.createdAt)?.getTime() || 0);
        }
        if (sort === 'price_desc') return numericPrice(b) - numericPrice(a);
        if (sort === 'price_asc') return numericPrice(a) - numericPrice(b);
        if (sort === 'views_desc') return (b.views || 0) - (a.views || 0);
        // newest default
        return (asDate(b.createdAt)?.getTime() || 0) - (asDate(a.createdAt)?.getTime() || 0);
      });

    tbody.innerHTML = '';
    if (props.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 20px;">Khong co tin phu hop.</td></tr>';
      return;
    }

    props.forEach((p) => {
      const tr = document.createElement('tr');
      const author =
        (p.contactInfo && p.contactInfo.name) ? p.contactInfo.name : (p.postedBy || 'An danh');

      const actions = [];
      if (p.status === 'pending') {
        actions.push(`<button class="btn btn-sm btn-success" data-action="approve" data-id="${p.id}">Duyet</button>`);
        actions.push(`<button class="btn btn-sm btn-danger" data-action="reject" data-id="${p.id}">Tu choi</button>`);
      } else if (p.status === 'approved') {
        actions.push(`<button class="btn btn-sm btn-danger" data-action="reject" data-id="${p.id}">Tu choi</button>`);
        actions.push(`<button class="btn btn-sm btn-outline" data-action="toggle-featured" data-id="${p.id}">${p.featured ? 'Bo noi bat' : 'Noi bat'}</button>`);
        actions.push(`<button class="btn btn-sm btn-outline" data-action="toggle-verified" data-id="${p.id}">${p.verified ? 'Bo xac thuc' : 'Xac thuc'}</button>`);
      } else if (p.status === 'rejected') {
        actions.push(`<button class="btn btn-sm btn-success" data-action="approve" data-id="${p.id}">Duyet lai</button>`);
      }
      actions.push(`<button class="btn btn-sm btn-danger" data-action="delete" data-id="${p.id}">Xoa</button>`);
      actions.push(`<button class="btn btn-sm btn-outline" data-action="view" data-id="${p.id}">Xem</button>`);

      tr.innerHTML = `
        <td>${p.id || 'N/A'}</td>
        <td>${p.title || 'Khong co tieu de'}${p.verified ? ' <span class="badge badge-verified" title="Da xac thuc">Da xac thuc</span>' : ''}</td>
        <td>${author}</td>
        <td>${formatPrice(p)}</td>
        <td>${statusBadge(p.status)}</td>
        <td>${actions.join(' ')}</td>
      `.trim();

      tbody.appendChild(tr);
    });
  }

  function handlePropertiesTableClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (!action || !id) return;
    if (typeof window.dataManager === 'undefined') return;

    const p = window.dataManager.getPropertyById(id);
    if (!p) return;

    if (action === 'approve') {
      if (!confirm(`Duyet tin "${p.title || id}"?`)) return;
      window.dataManager.approveProperty(id);
      renderPropertiesTable();
      renderDashboard();
      alert('Da duyet.');
      return;
    }

    if (action === 'reject') {
      const reason = prompt(`Ly do tu choi tin "${p.title || id}":`, p.rejectionReason || '');
      if (reason === null) return;
      window.dataManager.rejectProperty(id, reason);
      renderPropertiesTable();
      renderDashboard();
      alert('Da tu choi.');
      return;
    }

    if (action === 'toggle-featured') {
      window.dataManager.toggleFeatured(id);
      renderPropertiesTable();
      alert('Da cap nhat trang thai noi bat.');
      return;
    }

    if (action === 'toggle-verified') {
      window.dataManager.toggleVerified(id);
      renderPropertiesTable();
      alert('Da cap nhat trang thai xac thuc.');
      return;
    }

    if (action === 'delete') {
      if (!confirm(`Xoa tin "${p.title || id}"?`)) return;
      window.dataManager.deleteProperty(id);
      renderPropertiesTable();
      renderDashboard();
      alert('Da xoa.');
      return;
    }

    if (action === 'view') {
      window.open(`chi-tiet.html?id=${encodeURIComponent(id)}`, '_blank', 'noopener');
    }
  }

  function activateTab(tabId) {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const tabs = document.querySelectorAll('.admin-tab');

    navLinks.forEach((a) => a.classList.remove('active'));
    tabs.forEach((t) => t.classList.remove('active'));

    const link = document.querySelector(`.admin-nav a[href="#${tabId}"]`);
    const tab = document.getElementById(tabId);
    if (link) link.classList.add('active');
    if (tab) tab.classList.add('active');
  }

  function syncTabWithHash() {
    const id = (window.location.hash || '#dashboard').replace('#', '') || 'dashboard';
    activateTab(id);
    if (id === 'dashboard') renderDashboard();
    if (id === 'users') renderUsersTable();
    if (id === 'properties') renderPropertiesTable();
    if (id === 'reports') renderMonthlyChart();
    if (id === 'settings') loadSettingsForm();
  }

  function loadSettingsForm() {
    const s = getSettings();
    const siteTitle = document.getElementById('siteTitle');
    const contactEmail = document.getElementById('contactEmail');
    const maintenance = document.getElementById('maintenance');

    if (siteTitle) siteTitle.value = s.siteTitle;
    if (contactEmail) contactEmail.value = s.contactEmail;
    if (maintenance) maintenance.checked = s.maintenance;
  }

  function wireSettingsForm() {
    const form = document.getElementById('systemSettings');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const siteTitle = document.getElementById('siteTitle')?.value || 'ABZ GROUP';
      const contactEmail = document.getElementById('contactEmail')?.value || 'contact@abzgroup.com';
      const maintenance = document.getElementById('maintenance')?.checked || false;
      saveSettings({ siteTitle, contactEmail, maintenance });
      alert('Da luu cai dat.');
    });
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function wireExportImport() {
    const exportBtn = document.getElementById('adminExportBtn');
    const importBtn = document.getElementById('adminImportBtn');
    const importFile = document.getElementById('adminImportFile');
    const seedBtn = document.getElementById('adminSeedDemoBtn');
    const clearBtn = document.getElementById('adminClearDataBtn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const payload = {
          users: getUsers(),
          properties: getAllProperties(),
          settings: getSettings(),
          exportedAt: new Date().toISOString(),
        };
        downloadJson(`abz-export-${Date.now()}.json`, payload);
      });
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', async () => {
        const file = importFile.files && importFile.files[0];
        if (!file) return;

        const text = await file.text();
        const data = safeJsonParse(text, null);
        if (!data || typeof data !== 'object') {
          alert('File JSON khong hop le.');
          importFile.value = '';
          return;
        }

        if (!confirm('Nhap du lieu se ghi de users/properties/settings hien tai. Tiep tuc?')) {
          importFile.value = '';
          return;
        }

        if (Array.isArray(data.users)) localStorage.setItem(LS_USERS, JSON.stringify(data.users));
        if (Array.isArray(data.properties)) localStorage.setItem(LS_PROPERTIES, JSON.stringify(data.properties));
        if (data.settings && typeof data.settings === 'object') localStorage.setItem(LS_SETTINGS, JSON.stringify(data.settings));

        alert('Da nhap du lieu. Trang se tai lai.');
        window.location.reload();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('Xoa toan bo du lieu users/properties/settings?')) return;
        localStorage.removeItem(LS_USERS);
        localStorage.removeItem(LS_PROPERTIES);
        localStorage.removeItem(LS_SETTINGS);
        if (typeof window.dataManager !== 'undefined') {
          // Keep in-memory state consistent with localStorage.
          window.dataManager.properties = [];
          window.dataManager.saveData();
        }
        alert('Da xoa du lieu.');
        renderUsersTable();
        renderPropertiesTable();
        renderDashboard();
        renderMonthlyChart();
      });
    }

    if (seedBtn) {
      seedBtn.addEventListener('click', () => {
        if (typeof window.dataManager === 'undefined') return;
        if (!confirm('Them du lieu mau bat dong san vao localStorage? Ban co the xoa trong tab Quan ly bat dong san.')) return;
        const added = window.dataManager.seedDemoProperties ? window.dataManager.seedDemoProperties() : 0;
        renderPropertiesTable();
        renderDashboard();
        alert(`Da them ${added || 0} tin mau.`);
      });
    }
  }

  function renderMonthlyChart() {
    const canvas = document.getElementById('monthlyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const props = getAllProperties();
    const now = new Date();
    const months = 5;

    const labels = [];
    const counts = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(`T${d.getMonth() + 1}`);
      counts.push(
        props.filter((p) => {
          const cd = asDate(p.createdAt);
          if (!cd) return false;
          const ck = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}`;
          return ck === key;
        }).length
      );
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padding = 30;
    const max = Math.max(1, ...counts);
    const barWidth = Math.floor((w - padding * 2) / (counts.length * 2));
    const gap = barWidth;

    ctx.strokeStyle = '#e1e4e8';
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    counts.forEach((c, idx) => {
      const x = padding + idx * (barWidth + gap) + gap / 2;
      const barH = Math.round((h - padding * 2) * (c / max));
      const y = h - padding - barH;

      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x, y, barWidth, barH);

      ctx.fillStyle = '#2c3e50';
      ctx.font = '12px Arial';
      ctx.fillText(labels[idx], x, h - padding + 14);
      ctx.fillText(String(c), x, y - 6);
    });
  }

  function wireTabNav() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute('href') || '#dashboard';
        window.location.hash = href;
      });
    });
    window.addEventListener('hashchange', syncTabWithHash);
  }

  function wireSearchAndFilters() {
    const userSearch = document.querySelector('#users .search-input');
    if (userSearch) userSearch.addEventListener('input', renderUsersTable);
    const userRole = document.getElementById('adminUserRoleFilter');
    if (userRole) userRole.addEventListener('change', renderUsersTable);
    const userStatus = document.getElementById('adminUserStatusFilter');
    if (userStatus) userStatus.addEventListener('change', renderUsersTable);

    const propSearch = document.getElementById('adminPropertySearch');
    if (propSearch) propSearch.addEventListener('input', renderPropertiesTable);

    const propStatus = document.getElementById('adminPropertyStatusFilter');
    if (propStatus) propStatus.addEventListener('change', renderPropertiesTable);

    const propListingType = document.getElementById('adminPropertyListingTypeFilter');
    if (propListingType) propListingType.addEventListener('change', renderPropertiesTable);
    const propFeatured = document.getElementById('adminPropertyFeaturedFilter');
    if (propFeatured) propFeatured.addEventListener('change', renderPropertiesTable);
    const propVerified = document.getElementById('adminPropertyVerifiedFilter');
    if (propVerified) propVerified.addEventListener('change', renderPropertiesTable);
    const propSort = document.getElementById('adminPropertySort');
    if (propSort) propSort.addEventListener('change', renderPropertiesTable);
  }

  function wireUsersActions() {
    const addBtn = document.getElementById('adminAddUserBtn');
    if (addBtn) addBtn.addEventListener('click', handleAddUser);

    const tbody = document.getElementById('adminUsersTbody');
    if (tbody) tbody.addEventListener('click', handleUserTableClick);
  }

  function wirePropertiesActions() {
    const tbody = document.getElementById('adminPropertiesTbody');
    if (tbody) tbody.addEventListener('click', handlePropertiesTableClick);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!requireAdminOrRedirect()) return;

    if (typeof AuthState !== 'undefined') {
      AuthState.update();
    }

    // Clear placeholder rows that ship with the HTML.
    document.getElementById('adminUsersTbody')?.replaceChildren();
    document.getElementById('adminPropertiesTbody')?.replaceChildren();

    wireTabNav();
    wireSettingsForm();
    wireExportImport();
    wireSearchAndFilters();
    wireUsersActions();
    wirePropertiesActions();

    loadSettingsForm();
    renderUsersTable();
    renderPropertiesTable();
    renderDashboard();
    renderMonthlyChart();
    syncTabWithHash();
  });
})();
