/**
 * LoopTech Spec Selector
 * 
 * Progressive spec selection UX with state machine.
 * Handles variant selection, summary building, and UI updates.
 * 
 * States:
 * - idle: No options selected, waiting for user input
 * - partial: Some options selected, not all
 * - ready: All options selected, can add to cart
 * - loading: Form is submitting
 * - sold-out: Selected variant is not available
 */

(function() {
  'use strict';

  class LooptechSpecSelector {
    constructor(container, sectionId) {
      this.container = container;
      this.sectionId = sectionId;
      
      // State
      this.state = container.dataset.initialState || 'idle';
      this.selections = new Map();
      this.totalOptions = parseInt(container.dataset.totalOptions, 10) || 0;
      this.hasVariants = container.dataset.hasVariants === 'true';
      
      // Product data
      this.productData = this.loadProductData();
      this.productTitle = this.productData?.title || '';
      
      // DOM Elements
      this.elements = {
        title: container.querySelector('[data-product-title]'),
        summary: container.querySelector('[data-spec-summary]'),
        summaryText: container.querySelector('[data-summary-text]'),
        priceBlock: container.querySelector('[data-price-block]'),
        price: container.querySelector('[data-product-price]'),
        priceLabel: container.querySelector('[data-price-label]'),
        comparePrice: container.querySelector('[data-compare-price]'),
        variantId: container.querySelector('[data-variant-id]'),
        addButton: container.querySelector('[data-add-to-cart]'),
        addText: container.querySelector('[data-add-text]'),
        loadingSpinner: container.querySelector('[data-loading-spinner]'),
        perfectChoice: container.querySelector('[data-perfect-choice]'),
        klarnaAmount: container.querySelector('[data-klarna-amount]'),
        optionGroups: container.querySelectorAll('.looptech-info__option'),
        variantInputs: container.querySelectorAll('.looptech-info__option-value input')
      };
      
      // Bind methods
      this.handleOptionChange = this.handleOptionChange.bind(this);
      this.handleFormSubmit = this.handleFormSubmit.bind(this);
      
      // Initialize
      this.init();
    }
    
    /**
     * Load product JSON data from script tag
     */
    loadProductData() {
      try {
        const jsonScript = document.querySelector(`[data-product-json-${this.sectionId}]`);
        if (jsonScript) {
          return JSON.parse(jsonScript.textContent);
        }
      } catch (e) {
        console.error('[LoopTech Spec Selector] Error parsing product JSON:', e);
      }
      return null;
    }
    
    /**
     * Initialize the spec selector
     */
    init() {
      if (!this.hasVariants) {
        // No variants - product is ready to add
        this.setState('ready');
        this.updateUI();
        return;
      }
      
      // EDGE CASE: Single option products
      // If there's only one option and it has only one value, auto-select it
      if (this.totalOptions === 1) {
        const singleOptionGroup = this.container.querySelector('.looptech-info__option');
        const optionValues = singleOptionGroup?.querySelectorAll('.looptech-info__option-value input');
        
        if (optionValues?.length === 1) {
          // Auto-select the only option
          optionValues[0].checked = true;
          this.selections.set(0, optionValues[0].value);
          this.updateOptionGroupState(0, true);
          this.setState('ready');
          this.updateUI();
          this.attachEventListeners();
          console.log('[LoopTech Spec Selector] Single-value option auto-selected');
          return;
        }
      }
      
      // Check for URL variant parameter
      const urlParams = new URLSearchParams(window.location.search);
      const urlVariantId = urlParams.get('variant');
      
      if (urlVariantId) {
        this.preSelectFromVariantId(urlVariantId);
      } else {
        // Fresh page load - set initial idle state
        this.setState('idle');
        this.updateUI();
      }
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Mark unavailable variant combinations
      this.updateAvailability();
      
      console.log('[LoopTech Spec Selector] Initialized with state:', this.state);
    }
    
    /**
     * Update availability of variant options
     * Marks options that would lead to sold-out variants
     */
    updateAvailability() {
      if (!this.productData?.variants) return;
      
      // For each option group, check which values are available
      this.elements.optionGroups.forEach((group, groupIndex) => {
        const optionInputs = group.querySelectorAll('.looptech-info__option-value input');
        
        optionInputs.forEach(input => {
          const value = input.value;
          const label = input.closest('.looptech-info__option-value');
          
          // Check if any variant with this option value is available
          const hasAvailableVariant = this.productData.variants.some(variant => {
            return variant.options[groupIndex] === value && variant.available;
          });
          
          if (!hasAvailableVariant) {
            label.classList.add('looptech-info__option-value--sold-out');
          } else {
            label.classList.remove('looptech-info__option-value--sold-out');
          }
        });
      });
    }
    
    /**
     * Pre-select options based on variant ID from URL
     */
    preSelectFromVariantId(variantId) {
      if (!this.productData?.variants) return;
      
      const variant = this.productData.variants.find(v => v.id === parseInt(variantId, 10));
      if (!variant) return;
      
      // Select each option based on variant
      variant.options.forEach((value, index) => {
        const input = this.container.querySelector(
          `.looptech-info__option[data-option-index="${index}"] input[value="${CSS.escape(value)}"]`
        );
        if (input) {
          input.checked = true;
          this.selections.set(index, value);
          this.updateOptionGroupState(index, true);
        }
      });
      
      // Update state based on selection count
      this.updateState();
      this.updateUI();
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      // Option change listeners
      this.elements.variantInputs.forEach(input => {
        input.addEventListener('change', this.handleOptionChange);
      });
      
      // Form submit listener
      const form = this.container.querySelector('form');
      if (form) {
        form.addEventListener('submit', this.handleFormSubmit);
      }
    }
    
    /**
     * Handle option selection change
     */
    handleOptionChange(event) {
      const input = event.target;
      const optionIndex = parseInt(input.dataset.optionIndex, 10);
      const optionValue = input.value;
      
      // Store selection
      this.selections.set(optionIndex, optionValue);
      
      // Update option group visual state
      this.updateOptionGroupState(optionIndex, true);
      
      // Update visual selection on labels
      this.updateOptionValueVisuals(optionIndex);
      
      // Move pending indicator to next unselected option
      this.updatePendingIndicator();
      
      // Update overall state
      this.updateState();
      
      // Update UI
      this.updateUI();
      
      // Update availability of remaining options based on current selection
      this.updateAvailabilityForCurrentSelection();
      
      console.log('[LoopTech Spec Selector] Option changed:', optionIndex, '=', optionValue, 'State:', this.state);
    }
    
    /**
     * Update availability based on current selections
     * More precise than initial updateAvailability - considers selected options
     */
    updateAvailabilityForCurrentSelection() {
      if (!this.productData?.variants) return;
      
      const selectedOptions = this.getSelectedOptions();
      
      // For each option group, check which values are still available
      this.elements.optionGroups.forEach((group, groupIndex) => {
        // Skip already-selected options
        if (this.selections.has(groupIndex)) return;
        
        const optionInputs = group.querySelectorAll('.looptech-info__option-value input');
        
        optionInputs.forEach(input => {
          const value = input.value;
          const label = input.closest('.looptech-info__option-value');
          
          // Build a test option array with current selections + this value
          const testOptions = [...selectedOptions];
          testOptions[groupIndex] = value;
          
          // Check if any variant matches and is available
          const hasAvailableVariant = this.productData.variants.some(variant => {
            // Check all selected options match
            return testOptions.every((opt, idx) => {
              if (opt === undefined) return true; // Skip unselected
              return variant.options[idx] === opt;
            }) && variant.available;
          });
          
          if (!hasAvailableVariant) {
            label.classList.add('looptech-info__option-value--sold-out');
          } else {
            label.classList.remove('looptech-info__option-value--sold-out');
          }
        });
      });
    }
    
    /**
     * Handle form submission
     */
    handleFormSubmit(event) {
      if (this.state !== 'ready') {
        event.preventDefault();
        return;
      }
      
      this.setState('loading');
      this.updateUI();
    }
    
    /**
     * Update option group visual state
     */
    updateOptionGroupState(index, isSelected) {
      const optionGroup = this.container.querySelector(`.looptech-info__option[data-option-index="${index}"]`);
      if (optionGroup) {
        optionGroup.dataset.selected = isSelected ? 'true' : 'false';
      }
    }
    
    /**
     * Update visual selection state on option value labels
     */
    updateOptionValueVisuals(optionIndex) {
      const optionGroup = this.container.querySelector(`.looptech-info__option[data-option-index="${optionIndex}"]`);
      if (!optionGroup) return;
      
      const labels = optionGroup.querySelectorAll('.looptech-info__option-value');
      labels.forEach(label => {
        const input = label.querySelector('input');
        if (input.checked) {
          label.classList.add('looptech-info__option-value--selected');
        } else {
          label.classList.remove('looptech-info__option-value--selected');
        }
      });
    }
    
    /**
     * Update pending indicator to next unselected option
     */
    updatePendingIndicator() {
      // Remove pending from all
      this.elements.optionGroups.forEach(group => {
        group.dataset.pending = 'false';
      });
      
      // Find first unselected option
      for (let i = 0; i < this.totalOptions; i++) {
        if (!this.selections.has(i)) {
          const optionGroup = this.container.querySelector(`.looptech-info__option[data-option-index="${i}"]`);
          if (optionGroup) {
            optionGroup.dataset.pending = 'true';
          }
          break;
        }
      }
    }
    
    /**
     * Get count of selected options
     */
    getSelectionCount() {
      return this.selections.size;
    }
    
    /**
     * Check if all options are selected
     */
    allOptionsSelected() {
      return this.selections.size === this.totalOptions;
    }
    
    /**
     * Get array of selected option values
     */
    getSelectedOptions() {
      const options = [];
      for (let i = 0; i < this.totalOptions; i++) {
        if (this.selections.has(i)) {
          options.push(this.selections.get(i));
        }
      }
      return options;
    }
    
    /**
     * Build summary string from selections
     * Format: "iPhone 14 Pro • 256GB • Black"
     */
    buildSummaryString() {
      const parts = [];
      
      for (let i = 0; i < this.totalOptions; i++) {
        if (this.selections.has(i)) {
          parts.push(this.selections.get(i));
        }
      }
      
      if (parts.length === 0) {
        return '';
      }
      
      return parts.join(' • ');
    }
    
    /**
     * Find matching variant based on current selections
     */
    findMatchingVariant() {
      if (!this.productData?.variants || !this.allOptionsSelected()) {
        return null;
      }
      
      const selectedOptions = this.getSelectedOptions();
      
      return this.productData.variants.find(variant => {
        return selectedOptions.every((opt, index) => variant.options[index] === opt);
      });
    }
    
    /**
     * Update state based on current selections
     */
    updateState() {
      const selectionCount = this.getSelectionCount();
      
      if (selectionCount === 0) {
        this.setState('idle');
      } else if (selectionCount < this.totalOptions) {
        this.setState('partial');
      } else {
        // All options selected - check variant availability
        const variant = this.findMatchingVariant();
        if (variant) {
          if (variant.available) {
            this.setState('ready');
          } else {
            this.setState('sold-out');
          }
        } else {
          this.setState('partial');
        }
      }
    }
    
    /**
     * Set state
     */
    setState(newState) {
      const oldState = this.state;
      this.state = newState;
      
      if (oldState !== newState) {
        this.container.dispatchEvent(new CustomEvent('looptech-spec-state-change', {
          bubbles: true,
          detail: { oldState, newState, selector: this }
        }));
      }
    }
    
    /**
     * Format price in GBP
     */
    formatMoney(cents) {
      return '£' + (cents / 100).toFixed(2);
    }
    
    /**
     * Update all UI elements based on current state
     */
    updateUI() {
      this.updateSummary();
      this.updatePrice();
      this.updateButton();
      this.updatePerfectChoice();
      this.updateURL();
      this.updateKlarna();
    }
    
    /**
     * Update summary text
     */
    updateSummary() {
      if (!this.elements.summaryText) return;
      
      const summaryString = this.buildSummaryString();
      this.elements.summaryText.textContent = summaryString;
      
      // Add complete class when all selected
      if (this.allOptionsSelected()) {
        this.elements.summaryText.classList.add('looptech-info__summary-text--complete');
      } else {
        this.elements.summaryText.classList.remove('looptech-info__summary-text--complete');
      }
    }
    
    /**
     * Update price display
     */
    updatePrice() {
      if (!this.elements.priceBlock) return;
      
      const variant = this.findMatchingVariant();
      
      if (this.state === 'idle' || this.state === 'partial') {
        // Show "From" price
        this.elements.priceBlock.dataset.state = 'pending';
        if (this.elements.price) {
          const lowestPrice = parseInt(this.elements.priceBlock.dataset.lowestPrice, 10);
          this.elements.price.textContent = this.formatMoney(lowestPrice);
        }
      } else if (variant) {
        // Show actual variant price
        this.elements.priceBlock.dataset.state = 'ready';
        
        if (this.elements.price) {
          this.elements.price.textContent = this.formatMoney(variant.price);
        }
        
        if (this.elements.comparePrice) {
          if (variant.compare_at_price && variant.compare_at_price > variant.price) {
            this.elements.comparePrice.textContent = this.formatMoney(variant.compare_at_price);
            this.elements.comparePrice.style.display = '';
          } else {
            this.elements.comparePrice.style.display = 'none';
          }
        }
      }
    }
    
    /**
     * Update add to cart button
     */
    updateButton() {
      if (!this.elements.addButton || !this.elements.addText) return;
      
      const button = this.elements.addButton;
      const text = this.elements.addText;
      const spinner = this.elements.loadingSpinner;
      
      // Update button state attribute
      button.dataset.state = this.state;
      
      // Update disabled state
      button.disabled = (this.state !== 'ready');
      
      // Update button text
      switch (this.state) {
        case 'idle':
          text.textContent = 'Select your spec below';
          if (spinner) spinner.classList.add('hidden');
          break;
          
        case 'partial':
          // Find next option to select
          const nextOption = this.getNextUnselectedOptionName();
          text.textContent = nextOption ? `Select ${nextOption}` : 'Select your spec below';
          if (spinner) spinner.classList.add('hidden');
          break;
          
        case 'ready':
          text.textContent = 'Add To Cart';
          if (spinner) spinner.classList.add('hidden');
          break;
          
        case 'loading':
          text.textContent = '';
          if (spinner) spinner.classList.remove('hidden');
          break;
          
        case 'sold-out':
          text.textContent = 'Sold Out';
          if (spinner) spinner.classList.add('hidden');
          break;
      }
      
      // Update hidden variant ID input
      if (this.elements.variantId && this.state === 'ready') {
        const variant = this.findMatchingVariant();
        if (variant) {
          this.elements.variantId.value = variant.id;
        }
      }
    }
    
    /**
     * Get name of next unselected option
     */
    getNextUnselectedOptionName() {
      for (let i = 0; i < this.totalOptions; i++) {
        if (!this.selections.has(i)) {
          const optionGroup = this.container.querySelector(`.looptech-info__option[data-option-index="${i}"]`);
          if (optionGroup) {
            return optionGroup.dataset.optionName;
          }
        }
      }
      return null;
    }
    
    /**
     * Update perfect choice message visibility
     */
    updatePerfectChoice() {
      if (!this.elements.perfectChoice) return;
      
      if (this.state === 'ready') {
        this.elements.perfectChoice.dataset.visible = 'true';
      } else {
        this.elements.perfectChoice.dataset.visible = 'false';
      }
    }
    
    /**
     * Update URL with variant ID
     */
    updateURL() {
      if (this.state !== 'ready') return;
      
      const variant = this.findMatchingVariant();
      if (!variant) return;
      
      const url = new URL(window.location);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }
    
    /**
     * Update Klarna financing amount
     */
    updateKlarna() {
      if (!this.elements.klarnaAmount) return;
      
      const variant = this.findMatchingVariant();
      if (variant) {
        const klarnaPayment = Math.round(variant.price / 3);
        this.elements.klarnaAmount.textContent = this.formatMoney(klarnaPayment);
      }
    }
  }
  
  /**
   * Initialize all spec selectors on page
   */
  function initSpecSelectors() {
    const containers = document.querySelectorAll('[data-product-info-section]');
    
    containers.forEach(container => {
      const sectionId = container.dataset.productInfoSection;
      
      // Skip if already initialized
      if (container.dataset.specSelectorInitialized) return;
      
      // Create spec selector instance
      const selector = new LooptechSpecSelector(container, sectionId);
      
      // Store reference on element
      container.looptechSpecSelector = selector;
      container.dataset.specSelectorInitialized = 'true';
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpecSelectors);
  } else {
    initSpecSelectors();
  }
  
  // Expose for external use
  window.LooptechSpecSelector = LooptechSpecSelector;
  window.initLooptechSpecSelectors = initSpecSelectors;
  
})();

