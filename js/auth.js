// auth.js - Xử lý đăng nhập và đăng ký

document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật trạng thái khi trang load
    if (typeof AuthState !== 'undefined') {
        AuthState.update();
    }
    // Xử lý form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Validation cơ bản
            if (!username || !password) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            // Kiểm tra tài khoản admin
            const adminUsername = 'admin01';
            const adminPassword = 'nguyenminh2502';
            
            let isValidLogin = false;
            let isAdmin = false;
            let loginUsername = username;
            
            if (username === adminUsername && password === adminPassword) {
                isValidLogin = true;
                isAdmin = true;
            } else {
                // Kiểm tra từ danh sách người dùng đã đăng ký
                const users = JSON.parse(localStorage.getItem('abz_users') || '[]');
                const user = users.find(u => 
                    (u.username === username || u.email === username) && u.password === password
                );
                
                if (user) {
                    isValidLogin = true;
                    isAdmin = false;
                    loginUsername = user.username;
                }
            }

            if (!isValidLogin) {
                alert('Tên đăng nhập/Email hoặc mật khẩu không đúng!');
                return;
            }

            // Mô phỏng đăng nhập thành công
            console.log('Đang đăng nhập với:', loginUsername);

            // Lưu trạng thái đăng nhập
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', loginUsername);
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            
            // Cập nhật header
            if (typeof AuthState !== 'undefined') {
                AuthState.update();
            }
            
            alert('Đăng nhập thành công!');
            window.location.href = isAdmin ? 'admin.html' : '../index.html';
        });
    }

    // Xử lý form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.querySelector('input[name="terms"]').checked;

            // Validation
            if (!firstName || !lastName || !email || !username || !phone || !password || !confirmPassword) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            // Validation username
            if (username.length < 4 || username.length > 20) {
                alert('Tên đăng nhập phải từ 4-20 ký tự!');
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                alert('Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới!');
                return;
            }

            // Kiểm tra username đã tồn tại
            const users = JSON.parse(localStorage.getItem('abz_users') || '[]');
            if (users.some(u => u.username === username)) {
                alert('Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.');
                return;
            }

            // Kiểm tra email đã tồn tại
            if (users.some(u => u.email === email)) {
                alert('Email đã được đăng ký! Vui lòng chọn email khác.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }

            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự!');
                return;
            }

            if (!terms) {
                alert('Vui lòng đồng ý với điều khoản!');
                return;
            }

            // Lưu tài khoản mới vào localStorage
            const newUser = {
                id: Date.now().toString(),
                firstName,
                lastName,
                email,
                username,
                phone,
                password: password, // Trong thực tế phải hash
                createdAt: new Date().toISOString(),
                isAdmin: false
            };

            users.push(newUser);
            localStorage.setItem('abz_users', JSON.stringify(users));

            // Mô phỏng đăng ký
            console.log('Đang đăng ký:', newUser);

            alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
            window.location.href = 'dang-nhap.html';
        });
    }

    // Xử lý đăng nhập Google (mô phỏng)
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            alert('Tính năng đăng nhập Google đang được phát triển!');
        });
    }
});
