// filters.js - Filtering system for listing pages (numeric inputs)

class PropertyFilters {
    constructor() {
        this.filters = {
            type: '',
            listingType: '',
            location: '',
            minPrice: 0,
            maxPrice: 10000000000,
            minArea: 0,
            maxArea: 1000,
            bedrooms: '',
            bathrooms: '',
            sortBy: 'newest'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedFilters();
        this.syncFromUI();
        this.applyFilters();
    }

    parseIntOr(value, fallback) {
        const s = (value === null || value === undefined) ? '' : String(value).trim();
        if (!s) return fallback;
        const n = parseInt(s, 10);
        return Number.isFinite(n) ? n : fallback;
    }

    maxBound(el, fallback) {
        if (!el) return fallback;
        const n = this.parseIntOr(el.max, fallback);
        return Number.isFinite(n) ? n : fallback;
    }

    updatePriceDisplays() {
        const minPriceDisplay = document.getElementById('minPriceDisplay');
        const maxPriceDisplay = document.getElementById('maxPriceDisplay');
        const maxPriceInput = document.getElementById('maxPrice');
        const maxAllowed = this.maxBound(maxPriceInput, this.filters.maxPrice);

        if (minPriceDisplay) minPriceDisplay.textContent = this.formatPriceLabel(this.filters.minPrice);
        if (maxPriceDisplay) {
            maxPriceDisplay.textContent = (Number.isFinite(maxAllowed) && this.filters.maxPrice >= maxAllowed)
                ? 'Không giới hạn'
                : this.formatPriceLabel(this.filters.maxPrice);
        }
    }

    updateAreaDisplays() {
        const minAreaDisplay = document.getElementById('minAreaDisplay');
        const maxAreaDisplay = document.getElementById('maxAreaDisplay');
        if (minAreaDisplay) minAreaDisplay.textContent = `${this.filters.minArea} m²`;
        if (maxAreaDisplay) maxAreaDisplay.textContent = `${this.filters.maxArea} m²`;
    }

    syncFromUI() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const minAreaInput = document.getElementById('minArea');
        const maxAreaInput = document.getElementById('maxArea');

        if (minPriceInput && maxPriceInput) {
            const maxAllowed = this.maxBound(maxPriceInput, this.filters.maxPrice);
            this.filters.minPrice = this.parseIntOr(minPriceInput.value, 0);
            this.filters.maxPrice = this.parseIntOr(maxPriceInput.value, maxAllowed);
        }

        if (minAreaInput && maxAreaInput) {
            const maxAllowed = this.maxBound(maxAreaInput, this.filters.maxArea);
            this.filters.minArea = this.parseIntOr(minAreaInput.value, 0);
            this.filters.maxArea = this.parseIntOr(maxAreaInput.value, maxAllowed);
        }

        const typeSelect = document.getElementById('filterType');
        if (typeSelect) this.filters.type = typeSelect.value || '';

        const listingTypeSelect = document.getElementById('filterListingType');
        if (listingTypeSelect) this.filters.listingType = listingTypeSelect.value || '';

        const locationInput = document.getElementById('filterLocation');
        if (locationInput) this.filters.location = locationInput.value || '';

        const bedroomsSelect = document.getElementById('filterBedrooms');
        if (bedroomsSelect) this.filters.bedrooms = bedroomsSelect.value || '';

        const bathroomsSelect = document.getElementById('filterBathrooms');
        if (bathroomsSelect) this.filters.bathrooms = bathroomsSelect.value || '';

        const sortSelect = document.getElementById('filterSort');
        if (sortSelect) this.filters.sortBy = sortSelect.value || 'newest';

        this.updatePriceDisplays();
        this.updateAreaDisplays();
    }

    setupEventListeners() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const minAreaInput = document.getElementById('minArea');
        const maxAreaInput = document.getElementById('maxArea');

        if (minPriceInput && maxPriceInput) {
            const onMin = (e) => {
                const maxAllowed = this.maxBound(maxPriceInput, this.filters.maxPrice);
                const min = e.target.value === '' ? 0 : this.parseIntOr(e.target.value, 0);
                const max = maxPriceInput.value === '' ? maxAllowed : this.parseIntOr(maxPriceInput.value, maxAllowed);
                this.filters.minPrice = min;
                if (min > max) {
                    this.filters.minPrice = max;
                    minPriceInput.value = String(max);
                }
                this.updatePriceDisplays();
                this.applyFilters();
            };
            const onMax = (e) => {
                const maxAllowed = this.maxBound(maxPriceInput, this.parseIntOr(e.target.value, this.filters.maxPrice));
                const max = e.target.value === '' ? maxAllowed : this.parseIntOr(e.target.value, maxAllowed);
                const min = minPriceInput.value === '' ? 0 : this.parseIntOr(minPriceInput.value, 0);
                this.filters.maxPrice = max;
                if (max < min) {
                    this.filters.maxPrice = min;
                    maxPriceInput.value = String(min);
                }
                this.updatePriceDisplays();
                this.applyFilters();
            };

            minPriceInput.addEventListener('input', onMin);
            maxPriceInput.addEventListener('input', onMax);
            minPriceInput.addEventListener('change', onMin);
            maxPriceInput.addEventListener('change', onMax);
        }

        if (minAreaInput && maxAreaInput) {
            const onMin = (e) => {
                const maxAllowed = this.maxBound(maxAreaInput, this.filters.maxArea);
                const min = e.target.value === '' ? 0 : this.parseIntOr(e.target.value, 0);
                const max = maxAreaInput.value === '' ? maxAllowed : this.parseIntOr(maxAreaInput.value, maxAllowed);
                this.filters.minArea = min;
                if (min > max) {
                    this.filters.minArea = max;
                    minAreaInput.value = String(max);
                }
                this.updateAreaDisplays();
                this.applyFilters();
            };
            const onMax = (e) => {
                const maxAllowed = this.maxBound(maxAreaInput, this.parseIntOr(e.target.value, this.filters.maxArea));
                const max = e.target.value === '' ? maxAllowed : this.parseIntOr(e.target.value, maxAllowed);
                const min = minAreaInput.value === '' ? 0 : this.parseIntOr(minAreaInput.value, 0);
                this.filters.maxArea = max;
                if (max < min) {
                    this.filters.maxArea = min;
                    maxAreaInput.value = String(min);
                }
                this.updateAreaDisplays();
                this.applyFilters();
            };

            minAreaInput.addEventListener('input', onMin);
            maxAreaInput.addEventListener('input', onMax);
            minAreaInput.addEventListener('change', onMin);
            maxAreaInput.addEventListener('change', onMax);
        }

        const typeSelect = document.getElementById('filterType');
        if (typeSelect) typeSelect.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });

        const listingTypeSelect = document.getElementById('filterListingType');
        if (listingTypeSelect) listingTypeSelect.addEventListener('change', (e) => {
            this.filters.listingType = e.target.value;
            this.applyFilters();
        });

        const locationInput = document.getElementById('filterLocation');
        if (locationInput) locationInput.addEventListener('change', (e) => {
            this.filters.location = e.target.value;
            this.applyFilters();
        });

        const bedroomsSelect = document.getElementById('filterBedrooms');
        if (bedroomsSelect) bedroomsSelect.addEventListener('change', (e) => {
            this.filters.bedrooms = e.target.value;
            this.applyFilters();
        });

        const bathroomsSelect = document.getElementById('filterBathrooms');
        if (bathroomsSelect) bathroomsSelect.addEventListener('change', (e) => {
            this.filters.bathrooms = e.target.value;
            this.applyFilters();
        });

        const sortSelect = document.getElementById('filterSort');
        if (sortSelect) sortSelect.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilters());
    }

    applyFilters() {
        this.saveFilters();

        if (typeof window.onFiltersApplied === 'function') {
            window.onFiltersApplied(this.filters);
        }

        window.dispatchEvent(new CustomEvent('filtersChanged', { detail: this.filters }));
    }

    resetFilters() {
        const maxPriceInput = document.getElementById('maxPrice');
        const maxAreaInput = document.getElementById('maxArea');
        const maxPriceDefault = this.maxBound(maxPriceInput, 10000000000);
        const maxAreaDefault = this.maxBound(maxAreaInput, 1000);

        this.filters = {
            type: '',
            listingType: '',
            location: '',
            minPrice: 0,
            maxPrice: maxPriceDefault,
            minArea: 0,
            maxArea: maxAreaDefault,
            bedrooms: '',
            bathrooms: '',
            sortBy: 'newest'
        };

        const minPriceInput = document.getElementById('minPrice');
        if (minPriceInput) minPriceInput.value = '0';
        if (maxPriceInput) maxPriceInput.value = String(maxPriceDefault);

        const minAreaInput = document.getElementById('minArea');
        if (minAreaInput) minAreaInput.value = '0';
        if (maxAreaInput) maxAreaInput.value = String(maxAreaDefault);

        const typeSelect = document.getElementById('filterType');
        if (typeSelect) typeSelect.value = '';
        const listingTypeSelect = document.getElementById('filterListingType');
        if (listingTypeSelect) listingTypeSelect.value = '';
        const locationInput = document.getElementById('filterLocation');
        if (locationInput) locationInput.value = '';
        const bedroomsSelect = document.getElementById('filterBedrooms');
        if (bedroomsSelect) bedroomsSelect.value = '';
        const bathroomsSelect = document.getElementById('filterBathrooms');
        if (bathroomsSelect) bathroomsSelect.value = '';
        const sortSelect = document.getElementById('filterSort');
        if (sortSelect) sortSelect.value = 'newest';

        this.updatePriceDisplays();
        this.updateAreaDisplays();
        this.applyFilters();
    }

    saveFilters() {
        localStorage.setItem('propertyFilters', JSON.stringify(this.filters));
    }

    loadSavedFilters() {
        const saved = localStorage.getItem('propertyFilters');
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                this.filters = { ...this.filters, ...parsed };
                this.applyFiltersToUI();
            }
        } catch (e) {
            // ignore
        }
    }

    applyFiltersToUI() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const minAreaInput = document.getElementById('minArea');
        const maxAreaInput = document.getElementById('maxArea');

        if (minPriceInput) minPriceInput.value = String(this.filters.minPrice ?? 0);
        if (maxPriceInput) maxPriceInput.value = String(this.filters.maxPrice ?? this.maxBound(maxPriceInput, 10000000000));

        if (minAreaInput) minAreaInput.value = String(this.filters.minArea ?? 0);
        if (maxAreaInput) maxAreaInput.value = String(this.filters.maxArea ?? this.maxBound(maxAreaInput, 1000));

        const typeSelect = document.getElementById('filterType');
        if (typeSelect) typeSelect.value = this.filters.type || '';
        const listingTypeSelect = document.getElementById('filterListingType');
        if (listingTypeSelect) listingTypeSelect.value = this.filters.listingType || '';
        const locationInput = document.getElementById('filterLocation');
        if (locationInput) locationInput.value = this.filters.location || '';
        const bedroomsSelect = document.getElementById('filterBedrooms');
        if (bedroomsSelect) bedroomsSelect.value = this.filters.bedrooms || '';
        const bathroomsSelect = document.getElementById('filterBathrooms');
        if (bathroomsSelect) bathroomsSelect.value = this.filters.bathrooms || '';
        const sortSelect = document.getElementById('filterSort');
        if (sortSelect) sortSelect.value = this.filters.sortBy || 'newest';

        this.updatePriceDisplays();
        this.updateAreaDisplays();
    }

    formatPriceLabel(price) {
        const n = typeof price === 'number' ? price : parseInt(String(price || '0'), 10);
        if (!Number.isFinite(n) || n <= 0) return '0';
        if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + ' tỷ';
        if (n >= 1000000) return (n / 1000000).toFixed(0) + ' tr';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
        return String(n);
    }

    getFilters() {
        return this.filters;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.propertyFilters = new PropertyFilters();
});

