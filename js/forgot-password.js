// forgot-password.js - Xử lý quên mật khẩu

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_t9k2ybh';
const EMAILJS_TEMPLATE_ID = 'template_9zmlsdr';
const EMAILJS_PUBLIC_KEY = 'feU8PxXp45RA0gTfX';

// Khởi tạo EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

let resetData = {
    email: '',
    username: '',
    code: '', // Sẽ được tạo động
    verificationCode: ''
};

document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const codeForm = document.getElementById('codeForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Step 1: Email verification
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailOrUsername = document.getElementById('emailOrUsername').value.trim();

            if (!emailOrUsername) {
                alert('Vui lòng nhập email hoặc tên đăng nhập!');
                return;
            }

            // Kiểm tra xem email/username có tồn tại không
            let found = false;

            // Kiểm tra admin
            if (emailOrUsername === 'admin01') {
                found = true;
                resetData.username = 'admin01';
                resetData.email = 'admin@abzgroup.vn';
            } else {
                // Kiểm tra trong danh sách người dùng đã đăng ký
                const users = JSON.parse(localStorage.getItem('abz_users') || '[]');
                const user = users.find(u =>
                    u.username === emailOrUsername || u.email === emailOrUsername
                );

                if (user) {
                    found = true;
                    resetData.username = user.username;
                    resetData.email = user.email;
                }
            }

            if (!found) {
                alert('Email hoặc tên đăng nhập không tồn tại trong hệ thống!');
                return;
            }

            // Tạo mã xác nhận ngẫu nhiên 6 chữ số
            resetData.code = Math.floor(100000 + Math.random() * 900000).toString();

            // Gửi email
            sendVerificationCode(resetData.email, resetData.username, resetData.code);

            // Lưu mã xác nhận vào sessionStorage (tạm thời cho session)
            sessionStorage.setItem('resetCode', resetData.code);
            sessionStorage.setItem('resetUsername', resetData.username);

            console.log('Mã xác nhận đã gửi tới:', resetData.email);

            // Chuyển sang step 2
            goToStep(2);
        });
    }

    // Step 2: Verification code
    if (codeForm) {
        codeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const verificationCode = document.getElementById('verificationCode').value.trim();

            if (!verificationCode) {
                alert('Vui lòng nhập mã xác nhận!');
                return;
            }

            const savedCode = sessionStorage.getItem('resetCode');

            if (verificationCode !== savedCode) {
                alert('Mã xác nhận không đúng! Vui lòng kiểm tra lại.');
                return;
            }

            // Mã đúng, chuyển sang step 3
            goToStep(3);
        });
    }

    // Step 3: Reset password
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (!newPassword || !confirmNewPassword) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            if (newPassword !== confirmNewPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }

            if (newPassword.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự!');
                return;
            }

            // Cập nhật mật khẩu
            const username = sessionStorage.getItem('resetUsername');

            if (username === 'admin01') {
                // Update admin password (trong demo chỉ là localStorage)
                localStorage.setItem('admin_password_reset', newPassword);
                console.log('Cập nhật mật khẩu admin thành công');
            } else {
                // Update user password
                const users = JSON.parse(localStorage.getItem('abz_users') || '[]');
                const userIndex = users.findIndex(u => u.username === username);

                if (userIndex !== -1) {
                    users[userIndex].password = newPassword;
                    localStorage.setItem('abz_users', JSON.stringify(users));
                    console.log('Cập nhật mật khẩu người dùng thành công');
                }
            }

            // Xóa dữ liệu tạm
            sessionStorage.removeItem('resetCode');
            sessionStorage.removeItem('resetUsername');

            // Hiển thị step thành công
            showStep('success');
        });
    }
});

function goToStep(step) {
    // Ẩn tất cả form sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => section.classList.remove('active'));

    // Hiển thị step được yêu cầu
    const activeSection = document.getElementById('step' + step);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Cập nhật step indicator
    updateStepIndicator(step);
}

function showStep(stepId) {
    // Ẩn tất cả form sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => section.classList.remove('active'));

    // Hiển thị section được yêu cầu
    const activeSection = document.getElementById(stepId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

function updateStepIndicator(currentStep) {
    const indicators = document.querySelectorAll('.step');
    indicators.forEach((indicator, index) => {
        if (index + 1 <= currentStep) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function backToStep1() {
    // Xóa mã xác nhận cũ
    sessionStorage.removeItem('resetCode');
    document.getElementById('verificationCode').value = '';
    goToStep(1);
}

function backToStep2() {
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    goToStep(2);
}

function resendCode() {
    // Tạo mã mới
    resetData.code = Math.floor(100000 + Math.random() * 900000).toString();
    const username = sessionStorage.getItem('resetUsername');

    // Gửi email lại
    sendVerificationCode(resetData.email, username, resetData.code);

    // Cập nhật mã vào sessionStorage
    sessionStorage.setItem('resetCode', resetData.code);
    document.getElementById('verificationCode').value = '';

    alert('Mã xác nhận mới đã được gửi. Vui lòng kiểm tra email của bạn.');
}

// Hàm gửi email xác nhận
function sendVerificationCode(email, username, code) {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS chưa được load. Hiển thị mã trong console.');
        console.log('Mã xác nhận:', code);
        return;
    }

    const templateParams = {
        to_email: email,
        user_name: username,
        verification_code: code
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('Email gửi thành công!', response.status, response.text);
        }, function(error) {
            console.error('Lỗi gửi email:', error);
            alert('Không thể gửi email. Vui lòng thử lại sau.');
        });
}