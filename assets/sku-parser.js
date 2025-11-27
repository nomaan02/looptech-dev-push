/**
 * Looptech SKU Parser Module
 *
 * SKU Format: BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE
 * Example: APPL-IPH14P-256-NEW-GRA-001
 *
 * Condition Codes:
 *   NEW  = Brand New → mode: 'new'
 *   REFA = Refurbished Grade A → mode: 'refurbished'
 *   REFB = Refurbished Grade B → mode: 'refurbished'
 *   REFC = Refurbished Grade C → mode: 'refurbished'
 */

const LooptechSKU = {
  // Condition code to mode mapping
  CONDITION_MAP: {
    'NEW': 'new',
    'REFA': 'refurbished',
    'REFB': 'refurbished',
    'REFC': 'refurbished'
  },

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

  // Condition code to human-readable label
  CONDITIONS: {
    'NEW': { label: 'Brand New', grade: null },
    'REFA': { label: 'Refurbished', grade: 'A' },
    'REFB': { label: 'Refurbished', grade: 'B' },
    'REFC': { label: 'Refurbished', grade: 'C' }
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
   * Parse a SKU string into its components
   * @param {string} sku - The SKU to parse
   * @returns {Object|null} Parsed SKU object or null if invalid
   */
  parse(sku) {
    if (!sku || typeof sku !== 'string') return null;

    const parts = sku.split('-');
    if (parts.length < 6) return null;

    const [brand, model, capacity, condition, color, sequence] = parts;

    const mode = this.CONDITION_MAP[condition];
    if (!mode) return null; // Invalid condition code

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
        code: condition,
        label: this.CONDITIONS[condition]?.label || condition,
        grade: this.CONDITIONS[condition]?.grade || null
      },
      color: {
        code: color,
        display: this.COLORS[color] || color
      },
      sequence: sequence,
      mode: mode, // 'new' or 'refurbished'
      isNew: mode === 'new',
      isRefurbished: mode === 'refurbished'
    };
  },

  /**
   * Get the mode for a SKU (quick check)
   * @param {string} sku - The SKU to check
   * @returns {string} 'new', 'refurbished', or 'unknown'
   */
  getMode(sku) {
    if (!sku || typeof sku !== 'string') return 'unknown';
    const parts = sku.split('-');
    if (parts.length < 4) return 'unknown';
    return this.CONDITION_MAP[parts[3]] || 'unknown';
  },

  /**
   * Check if a SKU matches the given mode
   * @param {string} sku - The SKU to check
   * @param {string} mode - 'new' or 'refurbished'
   * @returns {boolean}
   */
  matchesMode(sku, mode) {
    return this.getMode(sku) === mode;
  },

  /**
   * Filter an array of products by mode
   * @param {Array} products - Array of Shopify product objects
   * @param {string} mode - 'new' or 'refurbished'
   * @returns {Array} Filtered products
   */
  filterByMode(products, mode) {
    return products.filter(product => {
      // Check first variant SKU (primary condition)
      const primarySku = product.variants?.[0]?.sku;
      if (primarySku && this.matchesMode(primarySku, mode)) {
        return true;
      }
      // Fallback: check if ANY variant matches the mode
      return product.variants?.some(v => this.matchesMode(v.sku, mode));
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

    const badgeMap = {
      'NEW': { label: 'Brand New', class: 'condition-badge--new' },
      'REFA': { label: 'Grade A', class: 'condition-badge--grade-a' },
      'REFB': { label: 'Grade B', class: 'condition-badge--grade-b' },
      'REFC': { label: 'Grade C', class: 'condition-badge--grade-c' }
    };

    return badgeMap[parsed.condition.code] || null;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LooptechSKU;
}

// Make available globally
window.LooptechSKU = LooptechSKU;
