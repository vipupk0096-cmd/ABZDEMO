// property-detail.js - Trang chi tiet bat dong san (localStorage + dataManager)

(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function asDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatDateVN(value) {
    const d = asDate(value);
    if (!d) return '-';
    return d.toLocaleDateString('vi-VN');
  }

  function addDays(value, days) {
    const d = asDate(value);
    if (!d) return null;
    const out = new Date(d.getTime());
    out.setDate(out.getDate() + days);
    return out;
  }

  function resolveImageSrc(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && typeof img.data === 'string') return img.data;
    return '';
  }

  function formatPrice(price, listingType) {
    if (price === null || price === undefined || price === '') return 'Liên hệ';

    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (Number.isNaN(numPrice)) return String(price);

    if (listingType === 'thue') {
      if (numPrice >= 1000000) return (numPrice / 1000000).toFixed(0) + ' Triệu/tháng';
      return numPrice.toLocaleString('vi-VN') + ' VND/tháng';
    }

    if (numPrice >= 1000000000) return (numPrice / 1000000000).toFixed(1) + ' Tỷ';
    if (numPrice >= 1000000) return (numPrice / 1000000).toFixed(0) + ' Triệu';
    return numPrice.toLocaleString('vi-VN') + ' VND';
  }

  function getTypeLabel(type) {
    const typeLabels = {
      canho: 'Căn hộ',
      nharieng: 'Nhà riêng',
      nhaph: 'Nhà phố',
      bietthu: 'Biệt thự',
      datnen: 'Đất nền',
      nha: 'Nhà ở',
      nhao: 'Nhà ở',
      vanphong: 'Văn phòng',
      kho: 'Kho bãi',
    };
    return typeLabels[type] || type || '';
  }

  function createImageGallery(images, placeholderImage) {
    const placeholder =
      placeholderImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80';
    const resolved = (images || []).map(resolveImageSrc).filter(Boolean);

    if (resolved.length === 0) {
      return `<img src="${placeholder}" alt="No image" class="thumbnail">`;
    }

    return resolved.slice(0, 8)
      .map(
        (img, index) => `
        <img
          src="${img}"
          alt="Thumbnail ${index + 1}"
          class="thumbnail ${index === 0 ? 'active' : ''}"
          onclick="changeMainImage('${img}')"
          onerror="this.src='${placeholder}'"
        >
      `
      )
      .join('');
  }

  function createRelatedCard(p) {
    const placeholderImage =
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80';
    const firstImage = p.images && p.images.length > 0 ? resolveImageSrc(p.images[0]) : '';
    const imageUrl = firstImage || placeholderImage;

    const priceDisplay = formatPrice(p.price, p.listingType);
    const typeLabel = getTypeLabel(p.type);

    const badges = [];
    if (p.featured) badges.push('<span class="badge badge-primary">Nổi bật</span>');
    if (p.verified) badges.push('<span class="badge badge-verified">Đã xác thực</span>');

    return `
      <div class="property-card" onclick="window.location.href='chi-tiet.html?id=${encodeURIComponent(
        p.id
      )}'" role="link" tabindex="0">
        <div class="property-card-image">
          <img src="${imageUrl}" alt="${p.title || ''}" onerror="this.src='${placeholderImage}'">
          ${
            badges.length
              ? `<div class="property-card-badge">${badges.join(' ')}</div>`
              : ''
          }
          <div class="property-card-price">${priceDisplay}</div>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${p.title || ''}</h3>
          <div class="property-card-location">${p.location || ''}</div>
          <div class="property-card-details">
            <div class="property-detail-item">
              <strong>${p.bedrooms || 0}</strong>
              <span>Phòng ngủ</span>
            </div>
            <div class="property-detail-item">
              <strong>${p.bathrooms || 0}</strong>
              <span>WC</span>
            </div>
            <div class="property-detail-item">
              <strong>${p.area || 0}m²</strong>
              <span>Diện tích</span>
            </div>
          </div>
          <div class="property-card-actions">
            <a href="chi-tiet.html?id=${encodeURIComponent(p.id)}" class="btn btn-secondary btn-sm">Chi tiết</a>
            <span class="btn btn-outline btn-sm" style="pointer-events:none;">${typeLabel}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderFeaturedRelated(currentId) {
    const section = $('relatedSection');
    const grid = $('relatedProperties');
    if (!section || !grid || typeof window.dataManager === 'undefined') return;

    let items = [];
    try {
      items = window.dataManager.getFeaturedProperties(8) || [];
    } catch {
      items = [];
    }

    items = (Array.isArray(items) ? items : []).filter((p) => p && p.id !== currentId);

    if (items.length === 0) {
      // Fallback: latest approved
      const all = window.dataManager.getAllProperties() || [];
      items = all
        .filter((p) => p && p.status === 'approved' && p.id !== currentId)
        .slice(0, 6);
    }

    if (items.length === 0) {
      section.style.display = 'none';
      grid.innerHTML = '';
      return;
    }

    section.style.display = 'block';
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = 'Sản phẩm nổi bật';
    grid.innerHTML = items.slice(0, 6).map(createRelatedCard).join('');
  }

  function createPropertyDetailHTML(property) {
    const placeholderImage =
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
    const firstImage =
      property.images && property.images.length > 0 ? resolveImageSrc(property.images[0]) : '';
    const imageUrl = firstImage || placeholderImage;

    const priceDisplay = formatPrice(property.price, property.listingType);
    const typeLabel = getTypeLabel(property.type);
    const listingTypeLabel = property.listingType === 'ban' ? 'Bán' : 'Cho thuê';

    const imageGallery = createImageGallery(property.images || [], placeholderImage);

    const sellerName = property.contactInfo && property.contactInfo.name ? property.contactInfo.name : 'ABZ GROUP';
    const sellerPhone = property.contactInfo && property.contactInfo.phone ? property.contactInfo.phone : '';
    const sellerEmail = property.contactInfo && property.contactInfo.email ? property.contactInfo.email : '';

    const isFeatured = !!property.featured;
    const isVerified = !!property.verified;

    const metaBadges = [
      `<span class="badge badge-primary">${typeLabel}</span>`,
      isFeatured ? `<span class="badge badge-info">Nổi bật</span>` : '',
      isVerified ? `<span class="badge badge-verified">Đã xác thực</span>` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const priceRange = (property.priceRange && String(property.priceRange).trim()) || priceDisplay;
    const houseDirection = (property.houseDirection && String(property.houseDirection).trim()) || '-';
    const frontage =
      typeof property.frontage === 'number' && Number.isFinite(property.frontage) ? `${property.frontage} m` : '-';
    const accessRoad =
      typeof property.accessRoad === 'number' && Number.isFinite(property.accessRoad) ? `${property.accessRoad} m` : '-';
    const legalStatus = (property.legalStatus && String(property.legalStatus).trim()) || '-';

    const mapQuery =
      (property.mapQuery && String(property.mapQuery).trim()) ||
      (property.address && String(property.address).trim()) ||
      (property.location && String(property.location).trim()) ||
      '';
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

    const createdAt = property.createdAt || property.approvedAt || '';
    const expiresAt = addDays(createdAt, 15);
    const postType = isFeatured ? 'Tin nổi bật' : 'Tin thường';

    const verifiedAt = property.verifiedAt || '';
    const verifyTitle = isVerified
      ? `ABZ GROUP đã xác thực ngày ${formatDateVN(verifiedAt)}`
      : 'Tin chưa được xác thực';

    const verifyList = isVerified
      ? `
        <ul class="verify-list">
          <li><span class="li-icon">✓</span><span>Có sổ đỏ / hợp đồng mua bán</span></li>
          <li><span class="li-icon">✓</span><span>Đúng địa chỉ, hình ảnh và đặc điểm</span></li>
          <li><span class="li-icon">✓</span><span>Trong khoảng giá thị trường</span></li>
        </ul>
      `
      : `
        <ul class="verify-list">
          <li><span class="li-icon">i</span><span>Admin sẽ kiểm tra giấy tờ, địa chỉ, hình ảnh và mức giá trước khi gắn tích xanh.</span></li>
        </ul>
      `;

    return `
      <div class="detail-wrapper">
        <div class="detail-main">
          <div class="gallery-section">
            <div class="main-image-container">
              <img src="${imageUrl}" alt="${property.title || ''}" id="mainImage" onerror="this.src='${placeholderImage}'">
              <div class="image-badge">${listingTypeLabel}</div>
              <div class="image-controls">
                <button type="button" onclick="shareProperty('${property.id}')" title="Chia sẻ">Chia sẻ</button>
                <button type="button" onclick="saveProperty('${property.id}')" title="Lưu tin">Lưu</button>
              </div>
            </div>
            <div class="thumbnail-gallery" id="thumbnailGallery">
              ${imageGallery}
            </div>
          </div>

          <div class="property-info-section">
            <div class="property-header">
              <h1 class="property-title">${property.title || ''}</h1>
              <div class="property-meta">${metaBadges}</div>
              <div class="property-location-detail"> ${property.location || ''} - ${property.address || ''}</div>
              <div class="property-price-large">${priceDisplay}</div>
            </div>

            <div class="specs-grid">
              <div class="spec-item">
                <span class="spec-label">Diện tích</span>
                <span class="spec-value">${property.area || 0}m²</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Phòng ngủ</span>
                <span class="spec-value">${property.bedrooms || 0}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Phòng tắm</span>
                <span class="spec-value">${property.bathrooms || 0}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Loại BĐS</span>
                <span class="spec-value" style="font-size: var(--font-size-lg);">${typeLabel}</span>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h2>Mô tả chi tiết</h2>
            <p>${property.description || 'Không có mô tả'}</p>
            <p style="color: var(--color-text-light); font-size: var(--font-size-sm);">
              <strong>Ngày đăng:</strong> ${formatDateVN(property.createdAt)}
            </p>
          </div>

          <div class="verify-card">
            <div class="verify-title">
              <span class="verify-icon">✓</span>
              <span>${verifyTitle}</span>
              ${isVerified ? '<span class="badge badge-verified">Tích xanh</span>' : ''}
            </div>
            ${verifyList}
            <a class="verify-link" href="#" onclick="return false;">Tìm hiểu thêm về Tin xác thực</a>
          </div>

          <div class="features-section">
            <h2>Đặc điểm bất động sản</h2>
            <div class="features-grid">
              <div class="feature-row">
                <div class="feature-left"><span class="feature-icon">đ</span><span>Khoảng giá</span></div>
                <div class="feature-value">${priceRange}</div>
              </div>
              <div class="feature-row">
                <div class="feature-left"><span class="feature-icon">m²</span><span>Diện tích</span></div>
                <div class="feature-value">${property.area || 0} m²</div>
              </div>
              <div class="feature-row">
                <div class="feature-left"><span class="feature-icon">N</span><span>Hướng nhà</span></div>
                <div class="feature-value">${houseDirection}</div>
              </div>
              <div class="feature-row">
                <div class="feature-left"><span class="feature-icon">| |</span><span>Mặt tiền</span></div>
                <div class="feature-value">${frontage}</div>
              </div>
              <div class="feature-row">
                <div class="feature-left"><span class="feature-icon">/\\</span><span>Đường vào</span></div>
                <div class="feature-value">${accessRoad}</div>
              </div>
              <div class="feature-row">
                <div class="feature-left"><span class="feature-icon">§</span><span>Pháp lý</span></div>
                <div class="feature-value">${legalStatus}</div>
              </div>
            </div>
          </div>

          <div class="map-section">
            <h2>Xem trên bản đồ</h2>
            <iframe class="map-embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapSrc}" title="Map"></iframe>
            <div class="map-meta">
              <div>
                <span class="meta-label">Ngày đăng</span>
                <span class="meta-value">${formatDateVN(createdAt)}</span>
              </div>
              <div>
                <span class="meta-label">Ngày hết hạn</span>
                <span class="meta-value">${expiresAt ? expiresAt.toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div>
                <span class="meta-label">Loại tin</span>
                <span class="meta-value">${postType}</span>
              </div>
              <div>
                <span class="meta-label">Mã tin</span>
                <span class="meta-value">${property.id || '-'}</span>
              </div>
            </div>
          </div>

          <div class="related-section" id="relatedSection" style="display: none;">
            <h2>Sản phẩm nổi bật</h2>
            <div class="related-grid" id="relatedProperties"></div>
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="agent-card">
            <div class="agent-avatar">User</div>
            <div class="agent-name">${sellerName}</div>
            <div class="agent-role">Chủ tài sản</div>
            <div class="agent-info">
              ${sellerPhone ? `<p><strong>${sellerPhone}</strong></p>` : ''}
              ${sellerEmail ? `<p><strong>${sellerEmail}</strong></p>` : ''}
            </div>
            <div class="agent-actions">
              ${sellerPhone ? `<button class="btn btn-primary" onclick="contactSeller('${sellerPhone}')">Gọi ngay</button>` : ''}
            </div>
          </div>

          <div class="inquiry-widget">
            <h3>Gửi yêu cầu</h3>
            <form class="inquiry-form" id="inquiryForm">
              <div class="form-group">
                <input type="text" class="form-control" id="inquiryName" placeholder="Họ tên của bạn" required>
              </div>
              <div class="form-group">
                <input type="email" class="form-control" id="inquiryEmail" placeholder="Email" required>
              </div>
              <div class="form-group">
                <input type="tel" class="form-control" id="inquiryPhone" placeholder="Số điện thoại" required>
              </div>
              <div class="form-group">
                <textarea class="form-control" id="inquiryMessage" placeholder="Tin nhắn..." rows="3"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Gửi yêu cầu</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  function showPropertyNotFound() {
    const detail = $('propertyDetail');
    const nf = $('propertyNotFound');
    if (detail) detail.style.display = 'none';
    if (nf) nf.style.display = 'block';
  }

  function loadPropertyDetail(propertyId) {
    if (typeof window.dataManager === 'undefined') {
      showPropertyNotFound();
      return;
    }

    const property = window.dataManager.getPropertyById(propertyId);
    if (!property) {
      showPropertyNotFound();
      return;
    }

    // Count view for stats (safe).
    try {
      window.dataManager.incrementViews(propertyId);
    } catch {
      // ignore
    }

    const container = $('propertyDetail');
    if (!container) return;
    container.innerHTML = createPropertyDetailHTML(property);

    renderFeaturedRelated(propertyId);
    wireInquiryForm();
  }

  function wireInquiryForm() {
    const form = $('inquiryForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Đã gửi yêu cầu. Chúng tôi sẽ liên hệ sớm!');
      form.reset();
    });
  }

  // Expose a few helpers for inline handlers.
  window.changeMainImage = function changeMainImage(imageSrc) {
    const mainImage = $('mainImage');
    if (mainImage) mainImage.src = imageSrc;
    document.querySelectorAll('.thumbnail').forEach((t) => t.classList.remove('active'));
    const thumbs = Array.from(document.querySelectorAll('.thumbnail'));
    const hit = thumbs.find((t) => t.getAttribute('src') === imageSrc);
    if (hit) hit.classList.add('active');
  };

  window.contactSeller = function contactSeller(phone) {
    const p = String(phone || '').trim();
    if (!p) {
      alert('Thông tin liên hệ chưa được cập nhật.');
      return;
    }
    window.location.href = `tel:${p}`;
  };

  window.saveProperty = function saveProperty() {
    alert('Tính năng lưu tin đang được phát triển!');
  };

  window.shareProperty = function shareProperty(propertyId) {
    const url = window.location.href;
    let title = document.title || '';
    try {
      if (typeof window.dataManager !== 'undefined') {
        const p = window.dataManager.getPropertyById(propertyId);
        if (p && p.title) title = p.title;
      }
    } catch {
      // ignore
    }
    const text = `Xem bất động sản: ${title} - ${url}`;
    if (navigator.share) {
      navigator.share({ title: title || 'Bất động sản', text, url });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => alert('Đã sao chép liên kết!'),
        () => alert('Không thể sao chép liên kết.')
      );
      return;
    }
    alert(url);
  };

  document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    if (propertyId) loadPropertyDetail(propertyId);
    else showPropertyNotFound();
  });
})();
