// account.js - Xử lý trang quản lý tài khoản

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập
    if (typeof AuthState !== 'undefined' && !AuthState.check()) {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'dang-nhap.html';
        return;
    }

    // Hiển thị thông tin user
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    const userRoleDiv = document.getElementById('user-role');
    if (userRoleDiv) {
        userRoleDiv.innerHTML = `<span class="role-badge ${isAdmin ? 'admin' : 'user'}">${isAdmin ? 'Quản trị viên' : 'Người dùng'}</span>`;
    }

    // Cập nhật thông tin hiển thị
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    
    if (firstNameInput && lastNameInput) {
        if (isAdmin) {
            firstNameInput.value = 'Admin';
            lastNameInput.value = 'System';
            if (emailInput) emailInput.value = 'admin@abzgroup.com';
        } else {
            firstNameInput.value = 'Nguyễn';
            lastNameInput.value = 'Văn A';
            if (emailInput) emailInput.value = 'nguyenvana@example.com';
        }
    }
    // Xử lý chuyển tab
    const navLinks = document.querySelectorAll('.account-nav a');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Xóa active class
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            // Thêm active class cho tab được chọn
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Xử lý form cập nhật thông tin cá nhân
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            console.log('Cập nhật thông tin:', data);
            alert('Cập nhật thông tin thành công!');
        });
    }

    // Xử lý form cài đặt
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            console.log('Cập nhật cài đặt:', data);
            alert('Cập nhật cài đặt thành công!');
        });
    }

    // Xử lý nút đăng xuất
    const logoutLink = document.querySelector('a[href="#logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                // Xóa session/tokens (mô phỏng)
                if (typeof AuthState !== 'undefined') {
                    AuthState.logout();
                }
                alert('Đã đăng xuất!');
                window.location.href = '../index.html';
            }
        });
    }

    function resolveImageSrc(img) {
        if (!img) return '';
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && typeof img.data === 'string') return img.data;
        return '';
    }

    function statusBadge(status) {
        if (status === 'approved') return '<span class="status approved">Đã duyệt</span>';
        if (status === 'rejected') return '<span class="status rejected">Từ chối</span>';
        return '<span class="status pending">Chờ duyệt</span>';
    }

    function formatPrice(price, listingType) {
        if (!price && price !== 0) return 'Liên hệ';
        const n = typeof price === 'number' ? price : Number(price);
        if (Number.isNaN(n)) return String(price);

        if (listingType === 'thue') {
            if (n >= 1000000) return (n / 1000000).toFixed(0) + ' Triệu/tháng';
            return n.toLocaleString('vi-VN') + ' VND/tháng';
        }

        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + ' Tỷ';
        if (n >= 1000000) return (n / 1000000).toFixed(0) + ' Triệu';
        return n.toLocaleString('vi-VN') + ' VND';
    }

    function renderMyProperties() {
        const grid = document.getElementById('myPropertiesGrid');
        const empty = document.getElementById('myPropertiesEmpty');
        if (!grid) return;

        if (typeof window.dataManager === 'undefined') {
            grid.innerHTML = '<p style="color: #666;">Thiếu DataManager.</p>';
            return;
        }

        const currentUsername = localStorage.getItem('username') || '';
        const placeholderImage =
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80';

        const all = window.dataManager.getAllProperties() || [];
        const mine = all
            .filter((p) => {
                if (p.ownerUsername) return p.ownerUsername === currentUsername;
                if (p.contactInfo && p.contactInfo.name) return p.contactInfo.name === currentUsername;
                if (p.postedBy) return p.postedBy === currentUsername;
                return false;
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (empty) empty.style.display = mine.length === 0 ? 'block' : 'none';

        grid.innerHTML = '';
        mine.forEach((p) => {
            const firstImage =
                p.images && p.images.length > 0 ? resolveImageSrc(p.images[0]) : '';
            const imageUrl = firstImage || placeholderImage;
            const price = formatPrice(p.price, p.listingType);
            const beds = p.bedrooms || 0;
            const baths = p.bathrooms || 0;
            const area = p.area || 0;

            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${p.title || 'Property'}" onerror="this.src='${placeholderImage}'">
                <div class="property-info">
                    <div style="display:flex; justify-content:space-between; gap: 10px; align-items: center;">
                        <div class="property-price">${price}</div>
                        <div>${statusBadge(p.status)}</div>
                    </div>
                    <div class="property-title">${p.title || '(Không tiêu đề)'}</div>
                    <p>${beds} PN • ${baths} WC • ${area}m2</p>
                    <div class="property-actions">
                        <a class="btn btn-sm btn-outline" href="chi-tiet.html?id=${encodeURIComponent(p.id)}">Xem</a>
                        <button class="btn btn-sm btn-danger" type="button" data-action="delete-post" data-id="${p.id}">Xóa</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        grid.querySelectorAll('button[data-action="delete-post"]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id) return;
                if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;
                window.dataManager.deleteProperty(id);
                renderMyProperties();
                alert('Đã xóa bài đăng.');
            });
        });
    }

    renderMyProperties();
});
