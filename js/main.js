// Function fetch HTML file và chèn vào DOM
async function loadComponent(id, url, callback) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
        if (callback) {
            callback();
        }
    } catch (error) {
        console.error(`Lỗi tải component ${url}:`, error);
    }
}

// Chạy khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    // Determine path level based on current page
    const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const basePath = isRoot ? './components/' : '../components/';
    
    loadComponent('header-placeholder', basePath + 'header.html', () => {
        // `components/header.html` currently uses `../...` links (works for pages/*).
        // When the header is loaded on the root page (index.html), those links break.
        // Normalize them for root only.
        if (isRoot) {
            normalizeHeaderLinksForRoot();
        }
        initializeHeaderFunctionality();
        if (typeof AuthState !== 'undefined') {
            AuthState.update();
        }
    });
    loadComponent('footer-placeholder', basePath + 'footer.html');
});

function normalizeHeaderLinksForRoot() {
    const headerHost = document.getElementById('header-placeholder');
    if (!headerHost) return;

    const anchors = headerHost.querySelectorAll('a[href]');
    anchors.forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (href.startsWith('../')) {
            a.setAttribute('href', href.replace(/^\.\.\//, ''));
        }
    });
}

// Initialize header functionality
function initializeHeaderFunctionality() {
    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                if (mobileMenu) mobileMenu.classList.remove('active');
            } else {
                hamburger.classList.add('active');
                if (mobileMenu) mobileMenu.classList.add('active');
            }
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });

    // Close mobile menu when clicking on nav items
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
        });
    });

    // User Menu Dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
    }

    // Update header username when user logs in
    updateHeaderUsername();
}

function updateHeaderUsername() {
    const username = localStorage.getItem('username');
    const headerUsername = document.getElementById('headerUsername');
    if (headerUsername && username) {
        headerUsername.textContent = username.charAt(0).toUpperCase() + username.slice(1);
    }
}

// Close mobile menu when page changes
window.addEventListener('beforeunload', () => {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger) hamburger.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
});
