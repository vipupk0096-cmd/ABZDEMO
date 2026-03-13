// auth-state.js - Quản lý trạng thái xác thực toàn cục

// Hàm cập nhật trạng thái xác thực
function updateAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const authRequired = document.querySelectorAll('.auth-required');
    const authHidden = document.querySelectorAll('.auth-hidden');
    const logoutLink = document.getElementById('logout-link');
    const adminLink = document.getElementById('admin-link');
    
    if (isLoggedIn) {
        authRequired.forEach(el => el.style.display = 'inline-block');
        authHidden.forEach(el => el.style.display = 'none');
        if (logoutLink) {
            logoutLink.style.display = 'inline-block';
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        if (adminLink) {
            adminLink.style.display = isAdmin ? 'inline-block' : 'none';
        }
    } else {
        authRequired.forEach(el => el.style.display = 'none');
        authHidden.forEach(el => el.style.display = 'inline-block');
        if (logoutLink) logoutLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Hàm kiểm tra trạng thái đăng nhập
function checkAuth() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    updateAuthState();
    alert('Đã đăng xuất!');
    const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    window.location.href = isRoot ? 'index.html' : '../index.html';
}

// Xuất các hàm để sử dụng trong các file khác
window.AuthState = {
    update: updateAuthState,
    check: checkAuth,
    logout: logout
};
