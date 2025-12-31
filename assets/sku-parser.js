/**
 * Looptech SKU Parser Module
 *
 * SKU Format: BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE
 * Example: APPL-IPH14P-256-NEW-GRA-001
 *
 * Condition Codes:
 *   NEW = Brand New → mode: 'brand-new'
 *   REN = Renewed → mode: 'renewed'
 */

const LooptechSKU = {
  // Condition code to mode mapping
  CONDITION_MAP: {
    'NEW': { mode: 'brand-new', label: 'Brand New', class: 'condition-badge--new' },
    'REN': { mode: 'renewed', label: 'Renewed', class: 'condition-badge--renewed' },
    // Legacy support
    'REFA': { mode: 'renewed', label: 'Renewed', class: 'condition-badge--renewed' },
    'REFB': { mode: 'renewed', label: 'Renewed', class: 'condition-badge--renewed' },
    'REFC': { mode: 'renewed', label: 'Renewed', class: 'condition-badge--renewed' }
  },

  // Valid mode values
  VALID_MODES: ['brand-new', 'renewed'],

  // localStorage key for mode persistence
  STORAGE_KEY: 'looptech_mode',

  // Default mode
  DEFAULT_MODE: 'brand-new',

  // Brand code lookup table (from sku-generator.jsx)
  BRANDS: {
    'APPL': { name: 'Apple', slug: 'apple' },
    'SAMS': { name: 'Samsung', slug: 'samsung' },
    'MSFT': { name: 'Microsoft', slug: 'microsoft' },
    'DELL': { name: 'Dell', slug: 'dell' },
    'LNVO': { name: 'Lenovo', slug: 'lenovo' },
    'ASUS': { name: 'Asus', slug: 'asus' },
    'HPXX': { name: 'HP', slug: 'hp' },
    'ACERX': { name: 'Acer', slug: 'acer' },
    'MSIX': { name: 'MSI', slug: 'msi' },
    'HUAW': { name: 'Huawei', slug: 'huawei' },
    'GOOG': { name: 'Google', slug: 'google' }
  },

  // Capacity codes
  CAPACITIES: {
    '064': '64GB',
    '128': '128GB',
    '256': '256GB',
    '512': '512GB',
    '01T': '1TB',
    '02T': '2TB',
    '08G': '8GB RAM',
    '16G': '16GB RAM',
    '32G': '32GB RAM'
  },

  // Color codes
  COLORS: {
    'BLK': 'Black',
    'WHT': 'White',
    'SIL': 'Silver',
    'GRA': 'Graphite',
    'GLD': 'Gold',
    'BLU': 'Blue',
    'GRN': 'Green',
    'PNK': 'Pink',
    'PRP': 'Purple',
    'RED': 'Red',
    'NAT': 'Natural',
    'TIT': 'Titanium'
  },

  /**
   * Normalize legacy mode values to current standard
   * @param {string} mode - Mode value to normalize
   * @returns {string} Normalized mode value
   */
  normalizeMode(mode) {
    if (mode === 'new') return 'brand-new';
    if (mode === 'Renewed') return 'renewed';
    return mode;
  },

  /**
   * Parse a SKU string into its components
   * @param {string} sku - The SKU to parse
   * @returns {Object|null} Parsed SKU object or null if invalid
   */
  parse(sku) {
    if (!sku || typeof sku !== 'string') return null;

    const parts = sku.split('-');
    if (parts.length < 6) return null;

    const [brand, model, capacity, condition, color, sequence] = parts;
    const conditionUpper = condition.toUpperCase();

    const conditionInfo = this.CONDITION_MAP[conditionUpper];
    if (!conditionInfo) return null; // Invalid condition code

    return {
      raw: sku,
      brand: {
        code: brand,
        name: this.BRANDS[brand]?.name || brand,
        slug: this.BRANDS[brand]?.slug || brand.toLowerCase()
      },
      model: model,
      capacity: {
        code: capacity,
        display: this.CAPACITIES[capacity] || capacity
      },
      condition: {
        code: conditionUpper === 'REFA' || conditionUpper === 'REFB' || conditionUpper === 'REFC' ? 'REN' : conditionUpper,
        label: conditionInfo.label,
        originalCode: conditionUpper
      },
      color: {
        code: color,
        display: this.COLORS[color] || color
      },
      sequence: sequence,
      mode: conditionInfo.mode, // 'brand-new' or 'renewed'
      isBrandNew: conditionInfo.mode === 'brand-new',
      isRenewed: conditionInfo.mode === 'renewed'
    };
  },

  /**
   * Get the mode for a SKU (quick check)
   * @param {string} sku - The SKU to check
   * @returns {string} 'brand-new', 'renewed', or 'unknown'
   */
  getMode(sku) {
    if (!sku || typeof sku !== 'string') return 'unknown';
    const parts = sku.split('-');
    if (parts.length < 4) return 'unknown';
    const conditionInfo = this.CONDITION_MAP[parts[3].toUpperCase()];
    return conditionInfo?.mode || 'unknown';
  },

  /**
   * Check if a SKU matches the given mode
   * @param {string} sku - The SKU to check
   * @param {string} mode - 'brand-new' or 'renewed'
   * @returns {boolean}
   */
  matchesMode(sku, mode) {
    const normalizedMode = this.normalizeMode(mode);
    return this.getMode(sku) === normalizedMode;
  },

  /**
   * Filter an array of products by mode
   * @param {Array} products - Array of Shopify product objects
   * @param {string} mode - 'brand-new' or 'renewed'
   * @returns {Array} Filtered products
   */
  filterByMode(products, mode) {
    const normalizedMode = this.normalizeMode(mode);
    return products.filter(product => {
      // Check product tags first
      if (product.tags) {
        const tags = Array.isArray(product.tags) ? product.tags : product.tags.split(',').map(t => t.trim());
        if (tags.includes('brand-new') && normalizedMode === 'brand-new') return true;
        if (tags.includes('renewed') && normalizedMode === 'renewed') return true;
      }
      // Check first variant SKU (primary condition)
      const primarySku = product.variants?.[0]?.sku;
      if (primarySku && this.matchesMode(primarySku, normalizedMode)) {
        return true;
      }
      // Fallback: check if ANY variant matches the mode
      return product.variants?.some(v => this.matchesMode(v.sku, normalizedMode));
    });
  },

  /**
   * Get condition badge info for display
   * @param {string} sku - The SKU to check
   * @returns {Object|null} Badge info with label and class
   */
  getConditionBadge(sku) {
    const parsed = this.parse(sku);
    if (!parsed) return null;

    return {
      label: parsed.condition.label,
      class: parsed.isBrandNew ? 'condition-badge--new' : 'condition-badge--renewed',
      mode: parsed.mode
    };
  },

  /**
   * Get current mode from URL or localStorage
   * @returns {string} Current mode ('brand-new' or 'renewed')
   */
  getCurrentMode() {
    // Check URL first
    const urlParams = new URLSearchParams(window.location.search);
    let mode = urlParams.get('mode');

    // Normalize legacy values
    mode = this.normalizeMode(mode);

    if (this.VALID_MODES.includes(mode)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, mode);
      } catch(e) {}
      return mode;
    }

    // Fall back to localStorage
    try {
      mode = localStorage.getItem(this.STORAGE_KEY);
      if (this.VALID_MODES.includes(mode)) {
        return mode;
      }
    } catch(e) {}

    return this.DEFAULT_MODE;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LooptechSKU;
}

// Make available globally
window.LooptechSKU = LooptechSKU;
