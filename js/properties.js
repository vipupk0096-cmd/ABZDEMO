// properties.js - Xá»­ lÃ½ trang danh sÃ¡ch báº¥t Ä‘á»™ng sáº£n bÃ¡n/thuÃª

document.addEventListener('DOMContentLoaded', function() {
    // XÃ¡c Ä‘á»‹nh loáº¡i trang (ban/thue) tá»« URL
    const currentPage = window.location.pathname;
    const isRentPage = currentPage.includes('nha-cho-thue');
    const listingType = isRentPage ? 'thue' : 'ban';

    loadProperties(listingType);

    // Nối hệ thống filters.js (sliders/selects) với danh sách
    window.addEventListener('filtersChanged', (e) => {
        const f = (e && e.detail) ? e.detail : {};
        const merged = { ...(f || {}), listingType };
        applyFilters(merged, listingType);
    });

    // Áp dụng ngay filter hiện tại (bao gồm saved filters) nếu có
    if (window.propertyFilters && typeof window.propertyFilters.setFilter === 'function') {
        try {
            window.propertyFilters.setFilter('listingType', listingType);
        } catch (e) {
            // ignore
        }
    }
    if (window.propertyFilters && typeof window.propertyFilters.applyFilters === 'function') {
        try {
            window.propertyFilters.applyFilters();
        } catch (e) {
            // ignore
        }
    }
});

let currentPageNum = 1;
const propertiesPerPage = 12;
let currentFilters = {};

function loadProperties(listingType) {
    const container = document.getElementById('propertiesGrid');
    const resultCount = document.getElementById('resultCount');

    if (!container) return;

    // Láº¥y báº¥t Ä‘á»™ng sáº£n theo loáº¡i (ban/thue)
    const allProperties = dataManager.getPropertiesByType(listingType);
    const paginatedProperties = allProperties.slice(0, propertiesPerPage);

    if (paginatedProperties.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Chưa có bất động sản nào được đăng tải.</p>';
        if (resultCount) resultCount.textContent = '0 kết quả';
        hidePagination();
        return;
    }

    // Render cÃ¡c property cards
    container.innerHTML = paginatedProperties.map(property => createPropertyCard(property)).join('');

    // ThÃªm event listeners cho cÃ¡c cards
    addPropertyCardListeners();

    // Hiá»ƒn thá»‹/áº©n pagination
    if (allProperties.length > propertiesPerPage) {
        showPagination(allProperties.length, listingType);
    } else {
        hidePagination();
    }

    // Cáº­p nháº­t thá»‘ng kÃª
    updateStats(allProperties.length);
    if (resultCount) resultCount.textContent = `${allProperties.length} kết quả`;
}

function applyFilters(filters, listingType) {
    currentFilters = filters || {};
    currentPageNum = 1;

    const searchFilters = { ...(filters || {}), listingType: listingType };
    const filteredProperties = dataManager.searchProperties(searchFilters);

    const container = document.getElementById('propertiesGrid');
    const noResults = document.getElementById('no-results');
    const resultCount = document.getElementById('resultCount');

    if (filteredProperties.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        if (resultCount) resultCount.textContent = '0 kết quả';
        hidePagination();
        return;
    }

    noResults.style.display = 'none';
    if (resultCount) resultCount.textContent = `${filteredProperties.length} kết quả`;

    const paginatedProperties = filteredProperties.slice(0, propertiesPerPage);
    container.innerHTML = paginatedProperties.map(property => createPropertyCard(property)).join('');

    addPropertyCardListeners();

    // Hiá»ƒn thá»‹/áº©n pagination
    if (filteredProperties.length > propertiesPerPage) {
        showPagination(filteredProperties.length, listingType);
    } else {
        hidePagination();
    }
}

function createPropertyCard(property) {
    function resolveImageSrc(img) {
        if (!img) return '';
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && typeof img.data === 'string') return img.data;
        return '';
    }

    const placeholderImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80';
    const firstImage = property.images && property.images.length > 0 ? resolveImageSrc(property.images[0]) : '';
    const imageUrl = firstImage || placeholderImage;

    const priceDisplay = formatPrice(property.price, property.listingType);
    const typeLabel = getTypeLabel(property.type);

    const verifiedBadge = property.verified ? `<span class="badge badge-verified">Đã xác thực</span>` : '';

    return `
        <div class="property-card" data-id="${property.id}" data-title="${property.title}" data-location="${property.location}" data-type="${property.type}">
            <div class="property-thumb">
                <img src="${imageUrl}" alt="${property.title}" onerror="this.src='${placeholderImage}'">
                ${verifiedBadge ? `<div class="property-thumb-badges">${verifiedBadge}</div>` : ''}
            </div>
            <div class="property-info">
                <div class="property-price">${priceDisplay}</div>
                <div class="property-title">${property.title}</div>
                <p class="property-desc">${property.bedrooms || 0} PN &bull; ${property.bathrooms || 0} WC &bull; ${property.area}m²</p>
                <p class="property-location">📍 ${property.location}</p>
                <div class="property-features">
                    <span class="feature">${typeLabel}</span>
                    <span class="feature">${property.listingType === 'ban' ? 'Bán' : 'Cho thuê'}</span>
                </div>
                <a href="chi-tiet.html?id=${property.id}" class="btn-detail">Xem chi tiết &rarr;</a>
            </div>
        </div>
    `;
}

function addPropertyCardListeners() {
    const propertyCards = document.querySelectorAll('.property-card');

    propertyCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Náº¿u click vÃ o link chi tiáº¿t, khÃ´ng lÃ m gÃ¬ thÃªm
            if (e.target.classList.contains('btn-detail')) return;

            const propertyId = this.dataset.id;
            if (propertyId) {
                window.location.href = `chi-tiet.html?id=${propertyId}`;
            }
        });
    });

    // Animation cho property cards khi scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Ãp dá»¥ng animation cho cÃ¡c property cards
    propertyCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

function showPagination(totalItems, listingType) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / propertiesPerPage);

    let paginationHtml = '';

    // Previous button
    if (currentPageNum > 1) {
        paginationHtml += `<a href="#" class="page-btn" data-page="${currentPageNum - 1}">&laquo; Trước</a>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPageNum) {
            paginationHtml += `<a href="#" class="page-btn active" data-page="${i}">${i}</a>`;
        } else {
            paginationHtml += `<a href="#" class="page-btn" data-page="${i}">${i}</a>`;
        }
    }

    // Next button
    if (currentPageNum < totalPages) {
        paginationHtml += `<a href="#" class="page-btn" data-page="${currentPageNum + 1}">Tiếp &raquo;</a>`;
    }

    pagination.innerHTML = paginationHtml;
    pagination.style.display = 'block';

    // Add event listeners
    const pageButtons = pagination.querySelectorAll('.page-btn');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            if (page && page !== currentPageNum) {
                changePage(page, listingType);
            }
        });
    });
}

function hidePagination() {
    const pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.style.display = 'none';
    }
}

function changePage(pageNum, listingType) {
    currentPageNum = pageNum;

    let properties;
    if (Object.keys(currentFilters).length > 0) {
        // CÃ³ filter Ä‘ang Ã¡p dá»¥ng
        const searchFilters = {
            listingType: listingType,
            ...currentFilters
        };
        properties = dataManager.searchProperties(searchFilters);
    } else {
        // Không có filter
        properties = dataManager.getPropertiesByType(listingType);
    }

    const startIndex = (currentPageNum - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    const paginatedProperties = properties.slice(startIndex, endIndex);

    const container = document.getElementById('propertiesGrid');
    container.innerHTML = paginatedProperties.map(property => createPropertyCard(property)).join('');

    addPropertyCardListeners();
    showPagination(properties.length, listingType);
}

function updateStats(totalCount) {
    // Cáº­p nháº­t thá»‘ng kÃª trÃªn trang
    const statElements = document.querySelectorAll('.stat-item h3');
    if (statElements.length > 0 && statElements[0]) {
        statElements[0].textContent = totalCount.toLocaleString() + '+';
    }
}

function formatPrice(price, listingType) {
    if (!price) return 'Liên hệ';

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    if (listingType === 'thue') {
        // GiÃ¡ thuÃª thÆ°á»ng tÃ­nh theo thÃ¡ng
        if (numPrice >= 1000000) { // Náº¿u lÃ  sá»‘ lá»›n, giáº£ sá»­ lÃ  VND/thÃ¡ng
            return (numPrice / 1000000).toFixed(0) + ' Triệu/tháng';
        } else {
            return numPrice.toLocaleString() + ' VND/tháng';
        }
    } else {
        // GiÃ¡ bÃ¡n
        if (numPrice >= 1000000000) { // Tá»·
            return (numPrice / 1000000000).toFixed(1) + ' Tỷ';
        } else if (numPrice >= 1000000) { // Triá»‡u
            return (numPrice / 1000000).toFixed(0) + ' Triệu';
        } else {
            return numPrice.toLocaleString() + ' VND';
        }
    }
}

function getTypeLabel(type) {
    const typeLabels = {
        'canho': 'Căn hộ',
        'nhaph': 'Nhà phố',
        'bietthu': 'Biệt thự',
        'datnen': 'Đất nền',
        'nhao': 'Nhà ở',
        'vanphong': 'Văn phòng',
        'kho': 'Kho bãi'
    };
    return typeLabels[type] || type;
}
