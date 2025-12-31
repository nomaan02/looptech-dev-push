/**
 * LoopTech Collection Filter Engine
 *
 * Tier 2 Client-Side Filtering for SKU-based attributes:
 * - Brand (parsed from SKU position 1)
 * - Capacity/Storage (parsed from SKU position 3)
 * - Color (parsed from SKU position 5)
 * - Price Range
 *
 * Works in conjunction with Tier 1 Liquid server-side filtering (tag-based mode)
 */

class LooptechCollectionFilter {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.warn('LooptechCollectionFilter: Container not found');
      return;
    }

    // DOM Elements
    this.productsGrid = this.container.querySelector('#products-grid');
    this.products = Array.from(this.container.querySelectorAll('.looptech-product-item'));
    this.emptyState = this.container.querySelector('#empty-state');
    this.countDisplay = this.container.querySelector('#visible-count');
    this.activeFiltersContainer = this.container.querySelector('#active-filters');
    this.activeFilterCountBadge = this.container.querySelector('#active-filter-count');

    // Filter state
    this.filters = {
      brands: new Set(),
      capacities: new Set(),
      colors: new Set(),
      priceMin: null,
      priceMax: null
    };

    // Filter options extracted from products (code -> { name/display, count })
    this.filterOptions = {
      brands: new Map(),
      capacities: new Map(),
      colors: new Map()
    };

    // Brand code to name mapping (from sku-parser.js)
    this.brandNames = {
      'APPL': 'Apple',
      'SAMS': 'Samsung',
      'GOOG': 'Google',
      'MSFT': 'Microsoft',
      'DELL': 'Dell',
      'LNVO': 'Lenovo',
      'HPXX': 'HP',
      'ASUS': 'Asus',
      'ACER': 'Acer',
      'MSIX': 'MSI',
      'HUAW': 'Huawei',
      'ONEP': 'OnePlus',
      'XIAO': 'Xiaomi',
      'SONY': 'Sony',
      'LGGX': 'LG'
    };

    // Capacity code to display mapping
    this.capacityDisplay = {
      '008': '8GB',
      '016': '16GB',
      '032': '32GB',
      '064': '64GB',
      '128': '128GB',
      '256': '256GB',
      '512': '512GB',
      '01T': '1TB',
      '02T': '2TB',
      '04T': '4TB',
      '08G': '8GB RAM',
      '16G': '16GB RAM',
      '32G': '32GB RAM',
      '64G': '64GB RAM'
    };

    // Color code to display and hex mapping
    this.colorInfo = {
      'BLK': { name: 'Black', hex: '#000000' },
      'WHT': { name: 'White', hex: '#FFFFFF' },
      'SIL': { name: 'Silver', hex: '#C0C0C0' },
      'GRA': { name: 'Graphite', hex: '#4A4A4A' },
      'GLD': { name: 'Gold', hex: '#FFD700' },
      'RSG': { name: 'Rose Gold', hex: '#B76E79' },
      'BLU': { name: 'Blue', hex: '#0066CC' },
      'GRN': { name: 'Green', hex: '#228B22' },
      'RED': { name: 'Red', hex: '#CC0000' },
      'PNK': { name: 'Pink', hex: '#FF69B4' },
      'PRP': { name: 'Purple', hex: '#9D4EDD' },
      'YLW': { name: 'Yellow', hex: '#FFD93D' },
      'ORG': { name: 'Orange', hex: '#FF6B35' },
      'NAT': { name: 'Natural', hex: '#D4B896' },
      'TIT': { name: 'Titanium', hex: '#878681' },
      'MID': { name: 'Midnight', hex: '#191970' },
      'STL': { name: 'Starlight', hex: '#F8F6F0' },
      'CRM': { name: 'Cream', hex: '#FFFDD0' }
    };

    this.init();
  }

  init() {
    if (this.products.length === 0) {
      console.warn('LooptechCollectionFilter: No products found');
      return;
    }

    this.extractFilterOptions();
    this.renderFilterOptions();
    this.attachEventListeners();
    this.loadStateFromURL();
    this.applyFilters();
    this.updateProductCount();
  }

  /**
   * Scan all products to extract unique filter values
   */
  extractFilterOptions() {
    this.products.forEach(product => {
      const brand = product.dataset.brand;
      const capacity = product.dataset.capacity;
      const color = product.dataset.color;

      // Extract brands
      if (brand && brand.trim().length > 0) {
        const brandCode = brand.toUpperCase();
        const existing = this.filterOptions.brands.get(brandCode) || {
          name: this.brandNames[brandCode] || brandCode,
          count: 0
        };
        existing.count++;
        this.filterOptions.brands.set(brandCode, existing);
      }

      // Extract capacities
      if (capacity && capacity.trim().length > 0) {
        const capacityCode = capacity.toUpperCase();
        const existing = this.filterOptions.capacities.get(capacityCode) || {
          display: this.capacityDisplay[capacityCode] || capacityCode,
          count: 0
        };
        existing.count++;
        this.filterOptions.capacities.set(capacityCode, existing);
      }

      // Extract colors
      if (color && color.trim().length > 0) {
        const colorCode = color.toUpperCase();
        const colorData = this.colorInfo[colorCode] || { name: colorCode, hex: '#CCCCCC' };
        const existing = this.filterOptions.colors.get(colorCode) || {
          display: colorData.name,
          hex: colorData.hex,
          count: 0
        };
        existing.count++;
        this.filterOptions.colors.set(colorCode, existing);
      }
    });
  }

  /**
   * Render filter checkboxes in sidebar
   */
  renderFilterOptions() {
    // Brands
    const brandsContainer = document.getElementById('filter-brands');
    if (brandsContainer && this.filterOptions.brands.size > 0) {
      brandsContainer.innerHTML = '';
      // Sort alphabetically by name
      const sortedBrands = [...this.filterOptions.brands.entries()]
        .sort((a, b) => a[1].name.localeCompare(b[1].name));

      sortedBrands.forEach(([code, info]) => {
        brandsContainer.appendChild(this.createCheckbox('brand', code, info.name, info.count));
      });
    }

    // Capacities
    const capacitiesContainer = document.getElementById('filter-capacities');
    if (capacitiesContainer && this.filterOptions.capacities.size > 0) {
      capacitiesContainer.innerHTML = '';
      // Sort by numeric value
      const sortedCapacities = [...this.filterOptions.capacities.entries()]
        .sort((a, b) => {
          const aNum = this.parseCapacityToBytes(a[0]);
          const bNum = this.parseCapacityToBytes(b[0]);
          return aNum - bNum;
        });

      sortedCapacities.forEach(([code, info]) => {
        capacitiesContainer.appendChild(this.createCheckbox('capacity', code, info.display, info.count));
      });
    }

    // Colors
    const colorsContainer = document.getElementById('filter-colors');
    if (colorsContainer && this.filterOptions.colors.size > 0) {
      colorsContainer.innerHTML = '';
      // Sort alphabetically by name
      const sortedColors = [...this.filterOptions.colors.entries()]
        .sort((a, b) => a[1].display.localeCompare(b[1].display));

      sortedColors.forEach(([code, info]) => {
        colorsContainer.appendChild(this.createColorCheckbox(code, info.display, info.hex, info.count));
      });
    }
  }

  /**
   * Parse capacity code to bytes for sorting
   */
  parseCapacityToBytes(code) {
    const num = parseInt(code.replace(/[^\d]/g, '')) || 0;
    if (code.includes('T')) return num * 1024 * 1024;
    if (code.includes('G')) return num * 1024;
    return num;
  }

  /**
   * Create a checkbox filter element
   */
  createCheckbox(type, value, label, count) {
    const wrapper = document.createElement('label');
    wrapper.className = 'looptech-filter-checkbox';
    wrapper.innerHTML = `
      <input type="checkbox" data-filter-type="${type}" data-filter-value="${value}">
      <span class="looptech-filter-checkmark"></span>
      <span class="looptech-filter-label">${label}</span>
      <span class="looptech-filter-count">(${count})</span>
    `;
    return wrapper;
  }

  /**
   * Create a color swatch checkbox
   */
  createColorCheckbox(code, display, hex, count) {
    const wrapper = document.createElement('label');
    wrapper.className = 'looptech-filter-checkbox looptech-filter-checkbox--color';

    // Add border for light colors
    const needsBorder = ['#FFFFFF', '#F8F6F0', '#FFFDD0', '#FFD700'].includes(hex.toUpperCase());
    const borderStyle = needsBorder ? 'border: 1px solid #E5E7EB;' : '';

    wrapper.innerHTML = `
      <input type="checkbox" data-filter-type="color" data-filter-value="${code}">
      <span class="looptech-color-swatch" style="background-color: ${hex}; ${borderStyle}"></span>
      <span class="looptech-filter-label">${display}</span>
      <span class="looptech-filter-count">(${count})</span>
    `;
    return wrapper;
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Checkbox filter changes
    this.container.addEventListener('change', (e) => {
      if (e.target.matches('[data-filter-type]')) {
        this.handleFilterChange(e.target);
      }
    });

    // Price range inputs with debounce
    const priceMin = this.container.querySelector('[data-filter-price-min]');
    const priceMax = this.container.querySelector('[data-filter-price-max]');

    if (priceMin) {
      priceMin.addEventListener('input', this.debounce(() => {
        this.filters.priceMin = priceMin.value ? parseFloat(priceMin.value) * 100 : null;
        this.applyFilters();
        this.updateURL();
      }, 400));
    }

    if (priceMax) {
      priceMax.addEventListener('input', this.debounce(() => {
        this.filters.priceMax = priceMax.value ? parseFloat(priceMax.value) * 100 : null;
        this.applyFilters();
        this.updateURL();
      }, 400));
    }

    // Clear all buttons
    this.container.querySelectorAll('[data-clear-all]').forEach(btn => {
      btn.addEventListener('click', () => this.clearAllFilters());
    });

    // Sort dropdown
    const sortSelect = this.container.querySelector('[data-sort-select]');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.sortProducts(sortSelect.value));
    }

    // Filter group toggles (accordion)
    this.container.querySelectorAll('.looptech-filter-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        const content = toggle.nextElementSibling;
        if (content) {
          content.style.display = expanded ? 'none' : 'block';
        }
      });
    });

    // Mobile filter drawer
    const openDrawerBtn = this.container.querySelector('[data-open-mobile-filters]');
    const filterDrawer = this.container.querySelector('[data-filter-drawer]');
    const filterOverlay = this.container.querySelector('[data-filter-overlay]');
    const closeDrawerBtn = this.container.querySelector('[data-close-mobile-filters]');

    if (openDrawerBtn && filterDrawer) {
      openDrawerBtn.addEventListener('click', () => {
        filterDrawer.classList.add('is-open');
        filterOverlay?.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeDrawerBtn && filterDrawer) {
      closeDrawerBtn.addEventListener('click', () => this.closeMobileFilters());
    }

    if (filterOverlay) {
      filterOverlay.addEventListener('click', () => this.closeMobileFilters());
    }
  }

  /**
   * Close mobile filter drawer
   */
  closeMobileFilters() {
    const filterDrawer = this.container.querySelector('[data-filter-drawer]');
    const filterOverlay = this.container.querySelector('[data-filter-overlay]');

    filterDrawer?.classList.remove('is-open');
    filterOverlay?.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  /**
   * Handle filter checkbox change
   */
  handleFilterChange(checkbox) {
    const type = checkbox.dataset.filterType;
    const value = checkbox.dataset.filterValue;

    // Map type to filter set key
    const filterKey = type + 's'; // brand -> brands, capacity -> capacities, color -> colors
    const filterSet = this.filters[filterKey];

    if (filterSet) {
      if (checkbox.checked) {
        filterSet.add(value);
      } else {
        filterSet.delete(value);
      }
    }

    this.applyFilters();
    this.updateURL();
    this.renderActiveFilters();
  }

  /**
   * Apply all active filters to products
   */
  applyFilters() {
    let visibleCount = 0;

    this.products.forEach(product => {
      const visible = this.productMatchesFilters(product);
      product.style.display = visible ? '' : 'none';
      product.classList.toggle('is-filtered-out', !visible);
      if (visible) visibleCount++;
    });

    // Show/hide empty state
    if (this.emptyState) {
      this.emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    // Hide products grid if empty
    if (this.productsGrid) {
      this.productsGrid.style.display = visibleCount === 0 ? 'none' : '';
    }

    this.updateProductCount(visibleCount);
    this.updateActiveFilterCount();
  }

  /**
   * Check if a product matches all active filters
   */
  productMatchesFilters(product) {
    const brand = (product.dataset.brand || '').toUpperCase();
    const capacity = (product.dataset.capacity || '').toUpperCase();
    const color = (product.dataset.color || '').toUpperCase();
    const price = parseInt(product.dataset.price) || 0;

    // Brand filter (OR within group)
    if (this.filters.brands.size > 0) {
      if (!brand || !this.filters.brands.has(brand)) {
        return false;
      }
    }

    // Capacity filter (OR within group)
    if (this.filters.capacities.size > 0) {
      if (!capacity || !this.filters.capacities.has(capacity)) {
        return false;
      }
    }

    // Color filter (OR within group)
    if (this.filters.colors.size > 0) {
      if (!color || !this.filters.colors.has(color)) {
        return false;
      }
    }

    // Price range filter
    if (this.filters.priceMin !== null && price < this.filters.priceMin) {
      return false;
    }
    if (this.filters.priceMax !== null && price > this.filters.priceMax) {
      return false;
    }

    return true;
  }

  /**
   * Sort products by selected criteria
   */
  sortProducts(sortBy) {
    if (!this.productsGrid) return;

    const sortedProducts = [...this.products].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (parseInt(a.dataset.price) || 0) - (parseInt(b.dataset.price) || 0);
        case 'price-desc':
          return (parseInt(b.dataset.price) || 0) - (parseInt(a.dataset.price) || 0);
        case 'title-asc':
          return (a.dataset.title || '').localeCompare(b.dataset.title || '');
        case 'title-desc':
          return (b.dataset.title || '').localeCompare(a.dataset.title || '');
        case 'created-desc':
          return (parseInt(b.dataset.created) || 0) - (parseInt(a.dataset.created) || 0);
        case 'best-selling':
        default:
          return 0; // Keep original order for best-selling
      }
    });

    // Re-append in sorted order
    sortedProducts.forEach(product => {
      this.productsGrid.appendChild(product);
    });
  }

  /**
   * Clear all active filters
   */
  clearAllFilters() {
    this.filters.brands.clear();
    this.filters.capacities.clear();
    this.filters.colors.clear();
    this.filters.priceMin = null;
    this.filters.priceMax = null;

    // Uncheck all checkboxes
    this.container.querySelectorAll('[data-filter-type]').forEach(cb => {
      cb.checked = false;
    });

    // Clear price inputs
    const priceMin = this.container.querySelector('[data-filter-price-min]');
    const priceMax = this.container.querySelector('[data-filter-price-max]');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';

    this.applyFilters();
    this.updateURL();
    this.renderActiveFilters();
  }

  /**
   * Update visible product count display
   */
  updateProductCount(count) {
    if (!this.countDisplay) return;

    const visibleCount = count ?? this.products.filter(p => p.style.display !== 'none').length;
    const mode = (this.container.dataset.currentMode || 'brand-new').replace('-', ' ');
    const plural = visibleCount !== 1 ? 's' : '';

    this.countDisplay.textContent = `${visibleCount} ${mode} product${plural}`;
  }

  /**
   * Update active filter count badge
   */
  updateActiveFilterCount() {
    if (!this.activeFilterCountBadge) return;

    const total = this.filters.brands.size +
                  this.filters.capacities.size +
                  this.filters.colors.size +
                  (this.filters.priceMin !== null ? 1 : 0) +
                  (this.filters.priceMax !== null ? 1 : 0);

    this.activeFilterCountBadge.textContent = total > 0 ? total : '';
    this.activeFilterCountBadge.style.display = total > 0 ? 'inline-flex' : 'none';
  }

  /**
   * Render active filter pills
   */
  renderActiveFilters() {
    if (!this.activeFiltersContainer) return;

    this.activeFiltersContainer.innerHTML = '';

    // Brand pills
    this.filters.brands.forEach(code => {
      const info = this.filterOptions.brands.get(code);
      if (info) {
        this.activeFiltersContainer.appendChild(
          this.createFilterPill('brand', code, info.name)
        );
      }
    });

    // Capacity pills
    this.filters.capacities.forEach(code => {
      const info = this.filterOptions.capacities.get(code);
      if (info) {
        this.activeFiltersContainer.appendChild(
          this.createFilterPill('capacity', code, info.display)
        );
      }
    });

    // Color pills
    this.filters.colors.forEach(code => {
      const info = this.filterOptions.colors.get(code);
      if (info) {
        this.activeFiltersContainer.appendChild(
          this.createFilterPill('color', code, info.display)
        );
      }
    });

    // Show/hide container based on whether there are active filters
    const hasFilters = this.activeFiltersContainer.children.length > 0;
    this.activeFiltersContainer.style.display = hasFilters ? 'flex' : 'none';
  }

  /**
   * Create an active filter pill element
   */
  createFilterPill(type, value, label) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'looptech-filter-pill';
    pill.innerHTML = `
      <span>${label}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    pill.addEventListener('click', () => {
      const filterKey = type + 's';
      this.filters[filterKey].delete(value);

      // Uncheck the corresponding checkbox
      const checkbox = this.container.querySelector(
        `[data-filter-type="${type}"][data-filter-value="${value}"]`
      );
      if (checkbox) checkbox.checked = false;

      this.applyFilters();
      this.updateURL();
      this.renderActiveFilters();
    });

    return pill;
  }

  /**
   * Update URL with current filter state
   */
  updateURL() {
    const params = new URLSearchParams(window.location.search);

    // Preserve mode parameter
    const mode = params.get('mode');

    // Clear existing filter params
    params.delete('brands');
    params.delete('capacities');
    params.delete('colors');
    params.delete('price_min');
    params.delete('price_max');

    // Add active filters
    if (this.filters.brands.size > 0) {
      params.set('brands', [...this.filters.brands].join(','));
    }
    if (this.filters.capacities.size > 0) {
      params.set('capacities', [...this.filters.capacities].join(','));
    }
    if (this.filters.colors.size > 0) {
      params.set('colors', [...this.filters.colors].join(','));
    }
    if (this.filters.priceMin !== null) {
      params.set('price_min', Math.round(this.filters.priceMin / 100));
    }
    if (this.filters.priceMax !== null) {
      params.set('price_max', Math.round(this.filters.priceMax / 100));
    }

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  }

  /**
   * Load filter state from URL parameters
   */
  loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Load brands
    const brands = params.get('brands');
    if (brands) {
      brands.split(',').forEach(code => {
        const upperCode = code.toUpperCase();
        if (this.filterOptions.brands.has(upperCode)) {
          this.filters.brands.add(upperCode);
          const cb = this.container.querySelector(
            `[data-filter-type="brand"][data-filter-value="${upperCode}"]`
          );
          if (cb) cb.checked = true;
        }
      });
    }

    // Load capacities
    const capacities = params.get('capacities');
    if (capacities) {
      capacities.split(',').forEach(code => {
        const upperCode = code.toUpperCase();
        if (this.filterOptions.capacities.has(upperCode)) {
          this.filters.capacities.add(upperCode);
          const cb = this.container.querySelector(
            `[data-filter-type="capacity"][data-filter-value="${upperCode}"]`
          );
          if (cb) cb.checked = true;
        }
      });
    }

    // Load colors
    const colors = params.get('colors');
    if (colors) {
      colors.split(',').forEach(code => {
        const upperCode = code.toUpperCase();
        if (this.filterOptions.colors.has(upperCode)) {
          this.filters.colors.add(upperCode);
          const cb = this.container.querySelector(
            `[data-filter-type="color"][data-filter-value="${upperCode}"]`
          );
          if (cb) cb.checked = true;
        }
      });
    }

    // Load price range
    const priceMin = params.get('price_min');
    if (priceMin) {
      this.filters.priceMin = parseFloat(priceMin) * 100;
      const input = this.container.querySelector('[data-filter-price-min]');
      if (input) input.value = priceMin;
    }

    const priceMax = params.get('price_max');
    if (priceMax) {
      this.filters.priceMax = parseFloat(priceMax) * 100;
      const input = this.container.querySelector('[data-filter-price-max]');
      if (input) input.value = priceMax;
    }

    this.renderActiveFilters();
  }

  /**
   * Debounce utility function
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLooptechFilter);
} else {
  initLooptechFilter();
}

function initLooptechFilter() {
  const filterInstance = new LooptechCollectionFilter('.looptech-collection');

  // Expose instance for debugging
  window.LooptechCollectionFilter = filterInstance;
}
