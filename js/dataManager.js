// dataManager.js - Quáº£n lÃ½ dá»¯ liá»‡u báº¥t Ä‘á»™ng sáº£n

class DataManager {
    constructor() {
        this.properties = [];
        this.loadData();
    }

    // Táº£i dá»¯ liá»‡u tá»« localStorage
    loadData() {
        const data = localStorage.getItem('abz_properties');
        if (data) {
            try {
                this.properties = JSON.parse(data);
            } catch (e) {
                console.error('Lá»—i táº£i dá»¯ liá»‡u:', e);
                this.properties = [];
            }
        }
    }

    // LÆ°u dá»¯ liá»‡u vÃ o localStorage
    saveData() {
        try {
            localStorage.setItem('abz_properties', JSON.stringify(this.properties));
        } catch (e) {
            console.error('Lá»—i lÆ°u dá»¯ liá»‡u:', e);
        }
    }

    // ThÃªm báº¥t Ä‘á»™ng sáº£n má»›i
    addProperty(property) {
        const newProperty = {
            id: Date.now().toString(),
            ...property,
            createdAt: new Date().toISOString(),
            status: 'pending', // Chá» admin phÃª duyá»‡t
            views: 0,
            featured: false,
            verified: false,
            verifiedAt: null
        };

        this.properties.unshift(newProperty); // ThÃªm vÃ o Ä‘áº§u danh sÃ¡ch
        this.saveData();
        return newProperty;
    }

    // Cáº­p nháº­t báº¥t Ä‘á»™ng sáº£n
    updateProperty(id, updates) {
        const index = this.properties.findIndex(p => p.id === id);
        if (index !== -1) {
            this.properties[index] = { ...this.properties[index], ...updates };
            this.saveData();
            return this.properties[index];
        }
        return null;
    }

    // XÃ³a báº¥t Ä‘á»™ng sáº£n
    deleteProperty(id) {
        const index = this.properties.findIndex(p => p.id === id);
        if (index !== -1) {
            this.properties.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // Láº¥y táº¥t cáº£ báº¥t Ä‘á»™ng sáº£n
    getAllProperties() {
        return this.properties;
    }

    // Láº¥y báº¥t Ä‘á»™ng sáº£n theo ID
    getPropertyById(id) {
        return this.properties.find(p => p.id === id);
    }

    // Láº¥y báº¥t Ä‘á»™ng sáº£n ná»•i báº­t
    getFeaturedProperties(limit = 6) {
        const approved = this.properties.filter(p => p.status === 'approved');
        const featured = approved.filter(p => p.featured);
        const list = featured.length > 0 ? featured : approved;
        return list.slice(0, limit);
    }

    // Láº¥y báº¥t Ä‘á»™ng sáº£n theo loáº¡i
    getPropertiesByType(type, limit = null) {
        let filtered = this.properties.filter(p => p.status === 'approved');

        if (type === 'ban') {
            filtered = filtered.filter(p => p.listingType === 'ban');
        } else if (type === 'thue') {
            filtered = filtered.filter(p => p.listingType === 'thue');
        }

        return limit ? filtered.slice(0, limit) : filtered;
    }

    // TÄƒng lÆ°á»£t xem
    incrementViews(id) {
        const property = this.getPropertyById(id);
        if (property) {
            property.views++;
            this.saveData();
        }
    }

    // Láº¥y thá»‘ng kÃª
    getStats() {
        const approved = this.properties.filter(p => p.status === 'approved');
        const featured = approved.filter(p => p.featured);
        const totalViews = approved.reduce((sum, p) => sum + (p.views || 0), 0);

        return {
            total: approved.length,
            featured: featured.length,
            views: totalViews,
            pending: this.properties.filter(p => p.status === 'pending').length
        };
    }

    // Admin: Duyá»‡t tin
    approveProperty(id) {
        return this.updateProperty(id, { status: 'approved', approvedAt: new Date().toISOString() });
    }

    // Admin: Từ chối tin
    rejectProperty(id, reason = '') {
        return this.updateProperty(id, { status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason });
    }

    // Láº¥y báº¥t Ä‘á»™ng sáº£n theo status
    getPropertiesByStatus(status) {
        return this.properties.filter(p => p.status === status);
    }

    // Láº¥y táº¥t cáº£ báº¥t Ä‘á»™ng sáº£n chÆ°a duyá»‡t
    getPendingProperties() {
        return this.getPropertiesByStatus('pending');
    }

    // Admin: Đánh dấu nổi bật
    toggleFeatured(id) {
        const property = this.getPropertyById(id);
        if (property) {
            return this.updateProperty(id, { featured: !property.featured });
        }
        return null;
    }

    // Admin: Xác thực tin
    toggleVerified(id) {
        const property = this.getPropertyById(id);
        if (!property) return null;
        const next = !property.verified;
        return this.updateProperty(id, {
            verified: next,
            verifiedAt: next ? new Date().toISOString() : null
        });
    }

    // Admin: Thêm dữ liệu mẫu (bất động sản ảo) để test/xóa về sau
    seedDemoProperties() {
        const existingIds = new Set((this.properties || []).map(p => String(p && p.id ? p.id : "")));
        const dayMs = 24 * 60 * 60 * 1000;
        const iso = (daysAgo) => new Date(Date.now() - daysAgo * dayMs).toISOString();

        const demo = [
            {
                id: "demo-001",
                title: "Biệt thự view Fansipan, trung tâm Sa Pa",
                type: "bietthu",
                listingType: "ban",
                ownerUsername: "admin01",
                price: 3500000000,
                area: 100,
                bedrooms: 4,
                bathrooms: 3,
                address: "Đường Fansipan, Thị trấn Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Thị trấn Sa Pa, Lào Cai",
                description: "Biệt thự hoàn thiện, view núi đẹp, khu dân cư yên tĩnh. Nội thất cao cấp, vào ở ngay.",
                priceRange: "3,5 tỷ",
                houseDirection: "Đông - Bắc",
                frontage: 5,
                accessRoad: 8,
                legalStatus: "Sổ đỏ/Sổ hồng",
                images: [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
                    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
                ],
                contactInfo: { name: "admin01", phone: "0900000001", email: "admin01@example.com" },
                createdAt: iso(12),
                status: "approved",
                approvedAt: iso(11),
                views: 128,
                featured: true,
                verified: true,
                verifiedAt: iso(11)
            },
            {
                id: "demo-002",
                title: "Căn hộ cho thuê full nội thất, gần trung tâm Sa Pa",
                type: "canho",
                listingType: "thue",
                ownerUsername: "minh250299",
                price: 12000000,
                area: 55,
                bedrooms: 2,
                bathrooms: 1,
                address: "Khu căn hộ Sun Plaza, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Sun Plaza Sa Pa",
                description: "Căn hộ sạch đẹp, đầy đủ nội thất, phù hợp gia đình/nhóm bạn. Hợp đồng linh hoạt.",
                priceRange: "10-12 triệu/tháng",
                houseDirection: "Nam",
                frontage: null,
                accessRoad: 10,
                legalStatus: "Hợp đồng mua bán",
                images: [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80"
                ],
                contactInfo: { name: "minh250299", phone: "0900000002", email: "minh250299@example.com" },
                createdAt: iso(7),
                status: "approved",
                approvedAt: iso(7),
                views: 56,
                featured: false,
                verified: false,
                verifiedAt: null
            },
            {
                id: "demo-003",
                title: "Đất nền sổ đỏ, đường ô tô, gần quốc lộ",
                type: "datnen",
                listingType: "ban",
                ownerUsername: "hoangngoc",
                price: 950000000,
                area: 120,
                bedrooms: 0,
                bathrooms: 0,
                address: "Xã Tả Van, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Tả Van, Sa Pa",
                description: "Lô đất đẹp, đất thổ cư, đường ô tô vào tận nơi. Tiềm năng đầu tư homestay.",
                priceRange: "900 triệu - 1,1 tỷ",
                houseDirection: "Tây - Nam",
                frontage: 6,
                accessRoad: 6,
                legalStatus: "Sổ đỏ/Sổ hồng",
                images: [
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
                    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80"
                ],
                contactInfo: { name: "hoangngoc", phone: "0900000003", email: "hoangngoc@example.com" },
                createdAt: iso(2),
                status: "pending",
                views: 3,
                featured: false,
                verified: false,
                verifiedAt: null
            },
            {
                id: "demo-004",
                title: "Nhà riêng 3 tầng, trung tâm thị trấn, ô tô đỗ cửa",
                type: "nharieng",
                listingType: "ban",
                ownerUsername: "lananh",
                price: 1800000000,
                area: 72,
                bedrooms: 3,
                bathrooms: 2,
                address: "Đường Điện Biên Phủ, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Điện Biên Phủ, Sa Pa",
                description: "Nhà đẹp, thiết kế hiện đại. Gần chợ và khu du lịch. Phù hợp ở hoặc kinh doanh.",
                priceRange: "1,8 tỷ",
                houseDirection: "Đông",
                frontage: 4,
                accessRoad: 7,
                legalStatus: "Đang chờ sổ",
                images: [
                    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&q=80",
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80"
                ],
                contactInfo: { name: "lananh", phone: "0900000004", email: "lananh@example.com" },
                createdAt: iso(20),
                status: "rejected",
                rejectedAt: iso(19),
                rejectionReason: "Thiếu giấy tờ pháp lý rõ ràng. Vui lòng bổ sung.",
                views: 12,
                featured: false,
                verified: false,
                verifiedAt: null
            },
            {
                id: "demo-005",
                title: "Biệt thự nghỉ dưỡng view thung lũng, có sân vườn",
                type: "bietthu",
                listingType: "ban",
                ownerUsername: "sapaowner",
                price: 5200000000,
                area: 180,
                bedrooms: 5,
                bathrooms: 4,
                address: "Bản Lao Chải, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Lao Chải, Sa Pa",
                description: "Không gian nghỉ dưỡng riêng tư, sân vườn rộng, view thung lũng. Thích hợp nghỉ dưỡng/kinh doanh.",
                priceRange: "5,2 tỷ",
                houseDirection: "Bắc",
                frontage: 10,
                accessRoad: 6,
                legalStatus: "Sổ đỏ/Sổ hồng",
                images: [
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80"
                ],
                contactInfo: { name: "sapaowner", phone: "0900000005", email: "sapaowner@example.com" },
                createdAt: iso(30),
                status: "approved",
                approvedAt: iso(29),
                views: 245,
                featured: true,
                verified: true,
                verifiedAt: iso(29)
            },
            {
                id: "demo-006",
                title: "Nhà phố 2 mặt tiền, kinh doanh tốt, trung tâm Sa Pa",
                type: "nhaph",
                listingType: "ban",
                ownerUsername: "thanhha",
                price: 2600000000,
                area: 90,
                bedrooms: 3,
                bathrooms: 2,
                address: "Phố Cầu Mây, Thị trấn Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Phố Cầu Mây, Sa Pa",
                description: "Nhà phố vị trí đẹp, 2 mặt tiền, phù hợp kinh doanh homestay/cafe. Kết cấu chắc chắn, sẵn nội thất cơ bản.",
                priceRange: "2,6 tỷ",
                houseDirection: "Đông - Nam",
                frontage: 6,
                accessRoad: 12,
                legalStatus: "Sổ đỏ/Sổ hồng",
                images: [
                    "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=80",
                    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80"
                ],
                contactInfo: { name: "thanhha", phone: "0900000006", email: "thanhha@example.com" },
                createdAt: iso(16),
                status: "approved",
                approvedAt: iso(15),
                views: 88,
                featured: false,
                verified: true,
                verifiedAt: iso(15)
            },
            {
                id: "demo-007",
                title: "Studio cho thuê ngắn hạn, gần nhà thờ đá Sa Pa",
                type: "canho",
                listingType: "thue",
                ownerUsername: "hungtran",
                price: 6500000,
                area: 32,
                bedrooms: 1,
                bathrooms: 1,
                address: "Khu trung tâm, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Nhà thờ đá Sa Pa",
                description: "Studio mới, đầy đủ tiện nghi. Có thể thuê theo tháng hoặc theo tuần, nhận phòng linh hoạt.",
                priceRange: "6-7 triệu/tháng",
                houseDirection: "Tây",
                frontage: null,
                accessRoad: 10,
                legalStatus: "Hợp đồng mua bán",
                images: [
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
                    "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&q=80"
                ],
                contactInfo: { name: "hungtran", phone: "0900000007", email: "hungtran@example.com" },
                createdAt: iso(5),
                status: "approved",
                approvedAt: iso(5),
                views: 41,
                featured: true,
                verified: false,
                verifiedAt: null
            },
            {
                id: "demo-008",
                title: "Đất nền view ruộng bậc thang, phù hợp làm homestay",
                type: "datnen",
                listingType: "ban",
                ownerUsername: "ngocmai",
                price: 1400000000,
                area: 200,
                bedrooms: 0,
                bathrooms: 0,
                address: "Bản Tả Phìn, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Tả Phìn, Sa Pa",
                description: "Lô đất rộng, view ruộng bậc thang, không khí trong lành. Đường vào thuận tiện, tiềm năng du lịch.",
                priceRange: "1,3 - 1,5 tỷ",
                houseDirection: "Bắc",
                frontage: 8,
                accessRoad: 5,
                legalStatus: "Sổ đỏ/Sổ hồng",
                images: [
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
                    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80"
                ],
                contactInfo: { name: "ngocmai", phone: "0900000008", email: "ngocmai@example.com" },
                createdAt: iso(1),
                status: "pending",
                views: 1,
                featured: false,
                verified: false,
                verifiedAt: null
            },
            {
                id: "demo-009",
                title: "Nhà riêng giá tốt cần bán gấp, gần chợ Sa Pa",
                type: "nharieng",
                listingType: "ban",
                ownerUsername: "quanghuy",
                price: 1250000000,
                area: 60,
                bedrooms: 2,
                bathrooms: 2,
                address: "Gần chợ Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Chợ Sa Pa",
                description: "Chủ cần bán gấp, giá tốt. Nhà kiên cố, khu dân cư hiện hữu. Liên hệ để xem nhà.",
                priceRange: "1,2 - 1,3 tỷ",
                houseDirection: "Nam",
                frontage: 4,
                accessRoad: 4,
                legalStatus: "Giấy tờ viết tay",
                images: [
                    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80"
                ],
                contactInfo: { name: "quanghuy", phone: "0900000009", email: "quanghuy@example.com" },
                createdAt: iso(22),
                status: "rejected",
                rejectedAt: iso(21),
                rejectionReason: "Thông tin hình ảnh/địa chỉ chưa rõ. Vui lòng cập nhật đầy đủ để duyệt.",
                views: 9,
                featured: false,
                verified: false,
                verifiedAt: null
            },
            {
                id: "demo-010",
                title: "Văn phòng cho thuê mặt đường lớn, tiện làm showroom",
                type: "vanphong",
                listingType: "thue",
                ownerUsername: "linhpham",
                price: 18000000,
                area: 80,
                bedrooms: 0,
                bathrooms: 1,
                address: "Đường lớn trung tâm, Sa Pa, Lào Cai",
                location: "Sa Pa, Lào Cai",
                mapQuery: "Sa Pa, Lào Cai",
                description: "Mặt bằng đẹp, thông thoáng, có chỗ để xe. Phù hợp văn phòng/Showroom/Studio.",
                priceRange: "18 triệu/tháng",
                houseDirection: "Đông",
                frontage: 7,
                accessRoad: 14,
                legalStatus: "Hợp đồng mua bán",
                images: [
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
                    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80"
                ],
                contactInfo: { name: "linhpham", phone: "0900000010", email: "linhpham@example.com" },
                createdAt: iso(9),
                status: "approved",
                approvedAt: iso(9),
                views: 22,
                featured: false,
                verified: false,
                verifiedAt: null
            }
        ];

        let added = 0;
        for (const p of demo) {
            if (!p || !p.id) continue;
            if (existingIds.has(String(p.id))) continue;
            this.properties.unshift(p);
            existingIds.add(String(p.id));
            added++;
        }

        if (added > 0) this.saveData();
        return added;
    }

    // TÃ¬m kiáº¿m
    searchProperties(filtersOrQuery, deprecatedFilters) {
        // Há»— trá»£ cáº£ cÃ¡ch gá»i cÅ© láº«n má»›i
        let query = '';
        let filters = {};

        if (typeof filtersOrQuery === 'string') {
            // CÃ¡ch gá»i cÅ©: searchProperties(query, filters)
            query = filtersOrQuery;
            filters = deprecatedFilters || {};
        } else if (typeof filtersOrQuery === 'object') {
            // CÃ¡ch gá»i má»›i: searchProperties({type, location, minPrice, ...})
            filters = filtersOrQuery || {};
            query = filters.query || '';
        }

        let results = this.properties.filter(p => p.status === 'approved');

        const norm = (v) => {
            const s = (v === null || v === undefined) ? '' : String(v);
            try {
                return s
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            } catch (e) {
                return s.toLowerCase().replace(/\s+/g, ' ').trim();
            }
        };

        // TÃ¬m kiáº¿m theo tá»« khÃ³a
        if (query) {
            const searchTerm = norm(query);
            results = results.filter(p => {
                const title = norm(p.title);
                const desc = norm(p.description);
                const loc = norm(p.location);
                const type = norm(p.type);
                return title.includes(searchTerm) || desc.includes(searchTerm) || loc.includes(searchTerm) || type.includes(searchTerm);
            });
        }

        // Ãp dá»¥ng filters
        if (filters.type) {
            results = results.filter(p => p.type === filters.type);
        }
        if (filters.listingType) {
            results = results.filter(p => p.listingType === filters.listingType);
        }
        if (filters.location) {
            const locTerm = norm(filters.location);
            results = results.filter(p => norm(p.location).includes(locTerm));
        }
        const minPrice = (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '')
            ? Number(filters.minPrice)
            : null;
        const maxPrice = (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '')
            ? Number(filters.maxPrice)
            : null;
        if (minPrice !== null && Number.isFinite(minPrice)) {
            results = results.filter(p => this.parsePrice(p.price) >= minPrice);
        }
        if (maxPrice !== null && Number.isFinite(maxPrice)) {
            results = results.filter(p => this.parsePrice(p.price) <= maxPrice);
        }

        const minArea = (filters.minArea !== undefined && filters.minArea !== null && filters.minArea !== '')
            ? Number(filters.minArea)
            : null;
        const maxArea = (filters.maxArea !== undefined && filters.maxArea !== null && filters.maxArea !== '')
            ? Number(filters.maxArea)
            : null;
        if (minArea !== null && Number.isFinite(minArea)) {
            results = results.filter(p => (Number(p.area) || 0) >= minArea);
        }
        if (maxArea !== null && Number.isFinite(maxArea)) {
            results = results.filter(p => (Number(p.area) || 0) <= maxArea);
        }

        if (filters.bedrooms !== undefined && filters.bedrooms !== null && filters.bedrooms !== '') {
            const n = Number(filters.bedrooms);
            if (Number.isFinite(n)) {
                results = results.filter(p => (Number(p.bedrooms) || 0) >= n);
            }
        }

        if (filters.bathrooms !== undefined && filters.bathrooms !== null && filters.bathrooms !== '') {
            const n = Number(filters.bathrooms);
            if (Number.isFinite(n)) {
                results = results.filter(p => (Number(p.bathrooms) || 0) >= n);
            }
        }

        // Sort (optional)
        const sortBy = (filters.sortBy || '').toString();
        if (sortBy) {
            if (sortBy === 'priceLow') {
                results = results.slice().sort((a, b) => this.parsePrice(a.price) - this.parsePrice(b.price));
            } else if (sortBy === 'priceHigh') {
                results = results.slice().sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price));
            } else if (sortBy === 'popular') {
                results = results.slice().sort((a, b) => (b.views || 0) - (a.views || 0));
            } else {
                results = results.slice().sort((a, b) => {
                    const at = new Date(a.createdAt || 0).getTime() || 0;
                    const bt = new Date(b.createdAt || 0).getTime() || 0;
                    return bt - at;
                });
            }
        }

        return results;
    }

    // Parse giÃ¡ tá»« string sang number
    parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;

        const match = priceStr.toString().match(/(\d+(?:\.\d+)?)/);
        if (match) {
            const num = parseFloat(match[1]);
            // Support both correctly-encoded Vietnamese and older mojibake strings.
            if (priceStr.includes('Triệu') || priceStr.includes('Triá»‡u') || priceStr.includes('Tr')) return num * 1000000;
            if (priceStr.includes('Tỷ') || priceStr.includes('Tá»·')) return num * 1000000000;
            return num;
        }
        return 0;
    }

    // Xuáº¥t dá»¯ liá»‡u (cho admin)
    exportData() {
        return {
            properties: this.properties,
            stats: this.getStats(),
            exportedAt: new Date().toISOString()
        };
    }

    // Import dá»¯ liá»‡u (cho admin)
    importData(data) {
        if (data.properties && Array.isArray(data.properties)) {
            this.properties = data.properties;
            this.saveData();
            return true;
        }
        return false;
    }
}

// Táº¡o instance global
window.dataManager = new DataManager();
