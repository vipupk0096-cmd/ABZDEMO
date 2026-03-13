// post.js - Xá»­ lÃ½ trang Ä‘Äƒng tin báº¥t Ä‘á»™ng sáº£n

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập
    if (typeof AuthState !== 'undefined' && !AuthState.check()) {
        alert('Vui lòng đăng nhập để đăng tin!');
        window.location.href = 'dang-nhap.html';
        return;
    }

    const postForm = document.getElementById('postForm');
    const imageInput = document.getElementById('images');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = document.getElementById('postSubmitBtn');
    let selectedImages = [];

    // Prefill contact info from registered profile when available.
    const contactPhoneEl = document.getElementById('contactPhone');
    const contactEmailEl = document.getElementById('contactEmail');
    const currentUsername = localStorage.getItem('username') || '';
    if (contactPhoneEl || contactEmailEl) {
        try {
            const users = JSON.parse(localStorage.getItem('abz_users') || '[]');
            const user = Array.isArray(users) ? users.find(u => u.username === currentUsername) : null;
            if (user) {
                if (contactEmailEl && !contactEmailEl.value && user.email) contactEmailEl.value = user.email;
                if (contactPhoneEl && !contactPhoneEl.value && user.phone) contactPhoneEl.value = user.phone;
            }
        } catch (e) {
            // Ignore malformed user store; contact fields remain empty.
        }
    }

    function setSubmitting(isSubmitting) {
        if (!submitBtn) return;
        submitBtn.disabled = !!isSubmitting;
        submitBtn.textContent = isSubmitting ? 'Đang đăng tin...' : 'Đăng tin';
    }

    // Xá»­ lÃ½ upload hÃ¬nh áº£nh
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            selectedImages = Array.from(e.target.files);

            if (selectedImages.length > 10) {
                alert('Chỉ được chọn tối đa 10 ảnh!');
                this.value = '';
                selectedImages = [];
                updateImageCount(0);
                if (imagePreview) imagePreview.innerHTML = '';
                return;
            }

            // Hiá»ƒn thá»‹ sá»‘ lÆ°á»£ng áº£nh Ä‘Ã£ chá»n
            updateImageCount(selectedImages.length);
            renderImagePreview();
        });
    }

    function renderImagePreview() {
        if (!imagePreview) return;
        imagePreview.innerHTML = '';

        selectedImages.forEach((file, idx) => {
            const url = URL.createObjectURL(file);
            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.innerHTML = `
                <img src="${url}" alt="Preview ${idx + 1}">
                <button type="button" class="image-preview-remove" data-index="${idx}" aria-label="Remove image">&times;</button>
            `;
            imagePreview.appendChild(item);
        });

        imagePreview.querySelectorAll('.image-preview-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                if (!Number.isFinite(index)) return;
                selectedImages.splice(index, 1);
                updateImageCount(selectedImages.length);
                renderImagePreview();
                if (imageInput && selectedImages.length === 0) {
                    imageInput.value = '';
                }
            });
        });
    }

    function updateImageCount(count) {
        const existingCount = document.querySelector('.image-count');
        if (existingCount) {
            existingCount.remove();
        }

        if (count > 0) {
            const countDisplay = document.createElement('small');
            countDisplay.className = 'image-count';
            countDisplay.textContent = `Đã chọn ${count} ảnh`;
            countDisplay.style.color = '#6c757d';
            countDisplay.style.marginTop = '5px';
            countDisplay.style.display = 'block';

            imageInput.parentNode.appendChild(countDisplay);
        }
    }

    if (postForm) {
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Thu tháº­p dá»¯ liá»‡u form
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Validation
            const requiredFields = ['title', 'category', 'type', 'price', 'area', 'address', 'description'];
            const fieldLabels = {
                title: 'tiêu đề',
                category: 'loại bất động sản',
                type: 'loại tin',
                price: 'giá',
                area: 'diện tích',
                address: 'địa chỉ',
                description: 'mô tả'
            };

            for (const field of requiredFields) {
                if (!data[field] || data[field].trim() === '') {
                    alert(`Vui lòng nhập ${fieldLabels[field]}!`);
                    return;
                }
            }

            if (!data.terms) {
                alert('Vui lòng đồng ý với điều khoản sử dụng!');
                return;
            }

            // Xá»­ lÃ½ hÃ¬nh áº£nh - Convert sang Base64 Ä‘á»ƒ lÆ°u
            setSubmitting(true);

            let imageUrls = [];
            
            if (selectedImages.length > 0) {
                // Sá»­ dá»¥ng Promise.all Ä‘á»ƒ xá»­ lÃ½ táº¥t cáº£ file áº£nh
                const imagePromises = selectedImages.map((file, index) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // LÆ°u Base64 data
                            const base64 = e.target.result;
                            imageUrls.push(base64);
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    });
                });

                // Chá»‰ thá»±c hiá»‡n khi táº¥t cáº£ áº£nh Ä‘Ã£ Ä‘Æ°á»£c load
                Promise.all(imagePromises).then(() => {
                    savePropertyData(data, imageUrls);
                });
                return; // ThoÃ¡t Ä‘á»ƒ trÃ¡nh submit ngay
            } else {
                // Không có ảnh, cứ lưu
                savePropertyData(data, []);
            }
        });
    }

    function savePropertyData(data, imageUrls) {
        function parseOptionalNumber(v) {
            if (v === null || v === undefined) return null;
            const s = String(v).trim();
            if (!s) return null;
            const n = Number(s);
            return Number.isFinite(n) ? n : null;
        }

        // Táº¡o object báº¥t Ä‘á»™ng sáº£n
        const propertyData = {
            title: data.title,
            type: data.category,
            listingType: data.type, // 'ban' hoáº·c 'thue'
            ownerUsername: localStorage.getItem('username') || '',
            price: parseFloat(data.price) || 0,
            area: parseFloat(data.area) || 0,
            bedrooms: parseInt(data.bedrooms) || 0,
            bathrooms: parseInt(data.bathrooms) || 0,
            address: data.address,
            location: extractLocation(data.address),
            mapQuery: (data.mapQuery || "").trim() || data.address,
            description: data.description,
            priceRange: (data.priceRange || "").trim(),
            houseDirection: (data.houseDirection || "").trim(),
            frontage: parseOptionalNumber(data.frontage),
            accessRoad: parseOptionalNumber(data.accessRoad),
            legalStatus: (data.legalStatus || "").trim(),
            images: imageUrls,
            contactInfo: {
                name: localStorage.getItem('username') || 'Người dùng',
                phone: data.contactPhone || 'Chưa cập nhật',
                email: data.contactEmail || 'Chưa cập nhật'
            }
        };

        // Lưu vào dataManager
        if (typeof dataManager !== 'undefined') {
            const newProperty = dataManager.addProperty(propertyData);

            // Verify it actually persisted (localStorage quota may fail silently).
            dataManager.loadData();
            if (!dataManager.getPropertyById(newProperty.id)) {
                alert('Không thể lưu tin. Có thể do dung lượng localStorage đã đầy (ảnh quá nặng).');
                setSubmitting(false);
                return;
            }

            alert(`Đăng tin thành công! Mã tin: ${newProperty.id}\nTin của bạn đang chờ phê duyệt. Admin sẽ duyệt trong 24 giờ!`);

            // Reset form
            document.getElementById('postForm').reset();
            selectedImages = [];
            updateImageCount(0);
            if (imagePreview) imagePreview.innerHTML = '';

            // Chuyá»ƒn vá» trang chá»§
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            alert('Lỗi hệ thống! Vui lòng thử lại sau.');
            setSubmitting(false);
        }
    }

    // Hàm trích xuất địa điểm từ địa chỉ
    function extractLocation(address) {
        // Mô phỏng trích xuất địa điểm từ địa chỉ
        const parts = address.split(',');
        if (parts.length >= 2) {
            return parts[parts.length - 1].trim() + ', ' + parts[parts.length - 2].trim();
        }
        return address;
    }
});
