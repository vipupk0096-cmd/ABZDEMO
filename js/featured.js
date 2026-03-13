// featured.js - Xá»­ lÃ½ hiá»ƒn thá»‹ báº¥t Ä‘á»™ng sáº£n ná»•i báº­t

document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProperties();

    // Xá»­ lÃ½ filter
    const filterForm = document.querySelector('.filter-section form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const filters = Object.fromEntries(formData);

            applyFilters(filters);
        });
    }

    // Xá»­ lÃ½ nÃºt "Xem thÃªm"
    const loadMoreBtn = document.querySelector('.load-more .btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreProperties();
        });
    }
});

let currentPage = 1;
const propertiesPerPage = 8;
let currentFilters = {};

function loadFeaturedProperties() {
    const container = document.querySelector('.grid-properties');

    if (!container) return;

    // Láº¥y báº¥t Ä‘á»™ng sáº£n ná»•i báº­t tá»« dataManager
    const allProperties = dataManager.properties.filter(p => p.status === 'approved');
    const featuredProperties = allProperties.slice(0, propertiesPerPage);

    if (featuredProperties.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Chưa có bất động sản nào được đăng tải.</p>';
        hideLoadMoreButton();
        return;
    }

    // Render cÃ¡c property cards
    container.innerHTML = featuredProperties.map(property => createPropertyCard(property)).join('');

    // ThÃªm event listeners cho cÃ¡c cards
    addPropertyCardListeners();

    // Hiá»ƒn thá»‹/áº©n nÃºt "Xem thÃªm"
    if (allProperties.length > propertiesPerPage) {
        showLoadMoreButton();
    } else {
        hideLoadMoreButton();
    }
}

function loadMoreProperties() {
    const loadMoreBtn = document.querySelector('.load-more .btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.textContent = 'Đang tải...';
    loadMoreBtn.disabled = true;

    setTimeout(() => {
        currentPage++;

        const allProperties = dataManager.properties.filter(p => p.status === 'approved');
        const startIndex = (currentPage - 1) * propertiesPerPage;
        const endIndex = currentPage * propertiesPerPage;
        const newProperties = allProperties.slice(startIndex, endIndex);

        if (newProperties.length > 0) {
            const container = document.querySelector('.grid-properties');
            const newCardsHtml = newProperties.map(property => createPropertyCard(property)).join('');
            container.insertAdjacentHTML('beforeend', newCardsHtml);

            // ThÃªm event listeners cho cards má»›i
            addPropertyCardListeners();

            loadMoreBtn.textContent = 'Xem thêm bất động sản nổi bật';
            loadMoreBtn.disabled = false;

            // áº¨n nÃºt náº¿u Ä‘Ã£ load háº¿t
            if (endIndex >= allProperties.length) {
                hideLoadMoreButton();
            }
        } else {
            hideLoadMoreButton();
        }
    }, 1000);
}

function applyFilters(filters) {
    currentFilters = filters;
    currentPage = 1;

    const filteredProperties = dataManager.searchProperties({
        type: filters.type || '',
        location: filters.location || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        minArea: filters.minArea || '',
        maxArea: filters.maxArea || ''
    });

    const container = document.querySelector('.grid-properties');

    if (filteredProperties.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Không tìm thấy bất động sản nào phù hợp với bộ lọc.</p>';
        hideLoadMoreButton();
        return;
    }

    const displayProperties = filteredProperties.slice(0, propertiesPerPage);
    container.innerHTML = displayProperties.map(property => createPropertyCard(property)).join('');

    addPropertyCardListeners();

    // Hiá»ƒn thá»‹/áº©n nÃºt "Xem thÃªm"
    if (filteredProperties.length > propertiesPerPage) {
        showLoadMoreButton();
    } else {
        hideLoadMoreButton();
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
    const listingTypeLabel = property.listingType === 'ban' ? 'Bán' : 'Cho thuê';
    const verifiedBadge = property.verified ? '<span class="badge badge-verified">Đã xác thực</span>' : '';

    return `
        <div class="property-card" data-id="${property.id}" data-title="${property.title}" data-location="${property.location}" data-type="${property.type}">
            <div class="property-card-image">
                <img src="${imageUrl}" alt="${property.title}" onerror="this.src='${placeholderImage}'">
                <div class="property-card-badge">
                    <span class="badge badge-primary">Nổi bật</span>
                    ${verifiedBadge}
                </div>
                <div class="property-card-price">${priceDisplay}</div>
            </div>
            <div class="property-card-body">
                <h3 class="property-card-title">${property.title}</h3>
                <div class="property-card-location">
                    ${property.location}
                </div>
                <div class="property-card-details">
                    <div class="property-detail-item">
                        <strong>${property.bedrooms || 0}</strong>
                        <span>Phòng ngủ</span>
                    </div>
                    <div class="property-detail-item">
                        <strong>${property.bathrooms || 0}</strong>
                        <span>WC</span>
                    </div>
                    <div class="property-detail-item">
                        <strong>${property.area}m²</strong>
                        <span>Diện tích</span>
                    </div>
                </div>
                <div class="property-card-actions">
                    <a href="../pages/chi-tiet.html?id=${property.id}" class="btn btn-secondary btn-sm">Chi tiết</a>
                    <button class="btn btn-primary btn-sm" onclick="contactProperty('${property.id}')">Liên hệ</button>
                </div>
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
        if (numPrice >= 1000000000) { // Tỷ
            return (numPrice / 1000000000).toFixed(1) + ' Tỷ';
        } else if (numPrice >= 1000000) { // Triệu
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

function showLoadMoreButton() {
    const loadMoreSection = document.querySelector('.load-more');
    if (loadMoreSection) {
        loadMoreSection.style.display = 'block';
    }
}

function hideLoadMoreButton() {
    const loadMoreSection = document.querySelector('.load-more');
    if (loadMoreSection) {
        loadMoreSection.style.display = 'none';
    }
}

// Animation cho featured badges
const badges = document.querySelectorAll('.featured-badge');
badges.forEach((badge, index) => {
    badge.style.animationDelay = `${index * 0.2}s`;
});

// ThÃªm animation CSS cho badges
const style = document.createElement('style');
style.textContent = `
    .featured-badge {
        animation: badgePulse 2s infinite;
    }

    @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
