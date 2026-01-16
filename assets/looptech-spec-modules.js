/**
 * LoopTech Spec Modules
 * 
 * Scroll-down spec selection with:
 * - State management for selections
 * - Dynamic price updates (exact variant price for current selections)
 * - Auto-scroll to next module
 * - Sticky summary card trigger
 * - Sold out handling
 */

(function() {
  'use strict';

  class LooptechSpecModules {
    constructor(container) {
      this.container = container;
      
      // State
      this.selections = new Map();
      this.requiredOptions = [];
      this.variantMap = new Map();
      this.productData = null;
      this.isScrolling = false;
      this.suppressAutoScroll = false;
      
      // DOM Elements
      this.elements = {
        modules: container.querySelectorAll('[data-spec-module]'),
        // Sticky summary card elements
        summaryCard: document.querySelector('[data-summary-card]'),
        summarySpacer: document.querySelector('[data-summary-spacer]'),
        summaryPrice: document.querySelector('[data-summary-price]'),
        summaryComparePrice: document.querySelector('[data-summary-compare-price]'),
        summarySpecs: document.querySelector('[data-summary-specs]'),
        summaryVariantId: document.querySelector('[data-summary-variant-id]'),
        summaryKlarna: document.querySelector('[data-summary-klarna]'),
        summaryThumbnail: document.querySelector('[data-summary-thumbnail]'),
        summaryButton: document.querySelector('[data-summary-add-button]'),
        // Header elements
        headerButton: document.querySelector('[data-header-button]'),
        headerButtonText: document.querySelector('[data-button-text]'),
        headerVariantId: document.querySelector('[data-header-variant-id]'),
        headerForm: document.querySelector('[data-header-form]'),
        headerSpecSummary: document.querySelector('[data-spec-summary]'),
        headerPrice: document.querySelector('[data-product-price]'),
        headerComparePrice: document.querySelector('[data-compare-price]'),
        headerKlarnaAmount: document.querySelector('[data-klarna-amount]'),
        scrollCta: document.querySelector('[data-scroll-cta]'),
        hiddenVariantInputs: document.querySelectorAll('[data-hidden-variant-input]')
      };
      
      // Bind methods
      this.handleOptionSelect = this.handleOptionSelect.bind(this);
      this.scrollToFirstModule = this.scrollToFirstModule.bind(this);
      
      // Initialize
      this.init();
    }
    
    /**
     * Initialize the spec modules
     */
    init() {
      // Load product data
      this.loadProductData();
      
      if (!this.productData) {
        console.error('[LoopTech Spec Modules] No product data found');
        return;
      }
      
      // Build required options list
      this.buildRequiredOptions();
      
      // Pre-compute variant map for O(1) lookups
      this.buildVariantMap();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Detect pre-selected options from the DOM (handles default variant without URL param)
      this.detectPreSelectedOptions();
      
      // Check for URL variant parameter (may override detected selections)
      this.checkUrlVariant();
      
      // Auto-select single-value options
      this.autoSelectSingleOptions();
      
      // Initialize color carousel if present
      this.initColorCarousel();
      
      // Restore scroll position if returning from a color switch
      this.restoreScrollPosition();
      
      console.log('[LoopTech Spec Modules] Initialized with', this.requiredOptions.length, 'options');
    }
    
    /**
     * Restore scroll position after page reload from color switch
     */
    restoreScrollPosition() {
      const savedPosition = sessionStorage.getItem('looptech_scroll_position');
      const savedModule = sessionStorage.getItem('looptech_scroll_module');
      const isColorSwitch = sessionStorage.getItem('looptech_color_switch') === 'true';
      
      // If this is a color switch, suppress any auto-scroll from showSummaryCard
      if (isColorSwitch) {
        this.suppressAutoScroll = true;
        // Clear the color switch flag now that we've noted it
        sessionStorage.removeItem('looptech_color_switch');
        console.log('[LoopTech] Color switch detected, suppressing auto-scroll');
      }
      
      if (savedPosition) {
        // Clear saved data
        sessionStorage.removeItem('looptech_scroll_position');
        sessionStorage.removeItem('looptech_scroll_module');
        
        // Use requestAnimationFrame to ensure DOM is fully ready
        requestAnimationFrame(() => {
          // Try to scroll to the color module first
          if (savedModule) {
            const targetModule = document.getElementById(savedModule);
            if (targetModule) {
              const headerOffset = 100;
              const rect = targetModule.getBoundingClientRect();
              const absoluteTop = rect.top + window.pageYOffset - headerOffset;
              window.scrollTo({ top: absoluteTop, behavior: 'instant' });
              console.log('[LoopTech] Restored scroll to module:', savedModule);
              return;
            }
          }
          
          // Fallback to exact saved position
          window.scrollTo({ top: parseInt(savedPosition, 10), behavior: 'instant' });
          console.log('[LoopTech] Restored scroll position:', savedPosition);
        });
      }
    }
    
    /**
     * Auto-select options that only have one value
     */
    autoSelectSingleOptions() {
      if (!this.productData?.options_with_values) return;
      
      this.elements.modules.forEach((module, index) => {
        const optionName = module.dataset.optionName;
        
        // Skip if already selected (e.g., from URL)
        if (this.selections.has(optionName)) return;
        
        // Get available options for this module
        const availableOptions = module.querySelectorAll('[data-spec-option]:not(.looptech-spec-card--sold-out):not(.looptech-spec-row--sold-out)');
        
        // If only one available option, auto-select it
        if (availableOptions.length === 1) {
          const singleOption = availableOptions[0];
          const input = singleOption.querySelector('input');
          
          if (input && !input.disabled) {
            input.checked = true;
            
            // Store selection
            this.selections.set(optionName, input.value);
            
            // Update visuals
            this.updateOptionVisuals(input);
            this.updateModuleState(optionName, true);
            
            console.log('[LoopTech Spec Modules] Auto-selected single option:', optionName, '=', input.value);
          }
        }
      });
      
      // Update prices and check completion after auto-select
      if (this.selections.size > 0) {
        this.updateHiddenInputs();
        this.updateAllPrices();
        this.checkCompletion();
      }
    }
    
    /**
     * Load product data from JSON script tag
     */
    loadProductData() {
      const jsonScript = document.querySelector('[data-product-json]');
      if (jsonScript) {
        try {
          this.productData = JSON.parse(jsonScript.textContent);
        } catch (e) {
          console.error('[LoopTech Spec Modules] Error parsing product JSON:', e);
        }
      }
    }
    
    /**
     * Build list of required options from modules
     */
    buildRequiredOptions() {
      this.elements.modules.forEach(module => {
        const optionName = module.dataset.optionName;
        if (optionName) {
          this.requiredOptions.push(optionName);
        }
      });
    }
    
    /**
     * Detect pre-selected options from the DOM
     * This handles the case where Liquid renders a default variant as selected
     * but there's no ?variant= URL parameter
     */
    detectPreSelectedOptions() {
      this.elements.modules.forEach(module => {
        const optionName = module.dataset.optionName;
        if (!optionName) return;
        
        // Skip if already in selections (e.g., from URL variant)
        if (this.selections.has(optionName)) return;
        
        // Find any checked radio input in this module
        const checkedInput = module.querySelector('[data-spec-option] input:checked');
        if (checkedInput) {
          const optionValue = checkedInput.value;
          
          // Add to selections
          this.selections.set(optionName, optionValue);
          
          // Update visuals
          this.updateOptionVisuals(checkedInput);
          this.updateModuleState(optionName, true);
          
          console.log('[LoopTech Spec Modules] Detected pre-selected option:', optionName, '=', optionValue);
        }
      });
    }
    
    /**
     * Pre-compute variant map for fast lookups
     * Key: "Option1|Option2|Option3" -> Variant object
     */
    buildVariantMap() {
      if (!this.productData?.variants) return;
      
      this.productData.variants.forEach(variant => {
        const key = variant.options.join('|');
        this.variantMap.set(key, variant);
      });
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      // Option selection listeners
      const optionInputs = this.container.querySelectorAll('[data-spec-option] input');
      optionInputs.forEach(input => {
        input.addEventListener('change', this.handleOptionSelect);
      });
      
      // Color card click listeners - full page reload with scroll preservation
      const colorCards = this.container.querySelectorAll('[data-is-color="true"] .looptech-spec-card');
      colorCards.forEach(card => {
        card.addEventListener('click', (e) => {
          // Skip if sold out
          if (card.classList.contains('looptech-spec-card--sold-out')) return;
          
          // Skip if already selected
          if (card.classList.contains('looptech-spec-card--selected')) {
            // Just update carousel for already selected card
            this.updateCarouselImages(card);
            return;
          }
          
          const variantUrl = card.dataset.variantUrl;
          if (!variantUrl) return;
          
          // Prevent default navigation
          e.preventDefault();
          
          // Save scroll position to sessionStorage for restoration after reload
          sessionStorage.setItem('looptech_scroll_position', window.scrollY.toString());
          sessionStorage.setItem('looptech_scroll_module', 'spec-module-color');
          
          // Set flag to indicate this is a color switch (only pre-select color, not other options)
          sessionStorage.setItem('looptech_color_switch', 'true');
          
          console.log('[LoopTech] Navigating to variant (color switch):', variantUrl);
          
          // Navigate to variant URL (full page reload)
          window.location.href = variantUrl;
        });
      });
      
      // Scroll CTA button (legacy)
      if (this.elements.scrollCta) {
        this.elements.scrollCta.addEventListener('click', this.scrollToFirstModule);
      }
      
      // Header button click handler
      if (this.elements.headerButton) {
        this.elements.headerButton.addEventListener('click', this.handleHeaderButtonClick.bind(this));
      }
    }
    
    /**
     * Handle header button click based on current state
     */
    handleHeaderButtonClick(event) {
      const button = this.elements.headerButton;
      const state = button?.dataset.state;
      
      if (state === 'idle' || state === 'partial') {
        // Scroll to next incomplete module
        event.preventDefault();
        this.scrollToNextIncompleteModule();
      } else if (state === 'ready') {
        // Submit the form
        event.preventDefault();
        this.submitHeaderForm();
      }
      // 'sold-out' and 'loading' states do nothing
    }
    
    /**
     * Scroll to the next incomplete module
     */
    scrollToNextIncompleteModule() {
      for (const module of this.elements.modules) {
        if (module.dataset.completed !== 'true') {
          this.smoothScrollTo(module);
          return;
        }
      }
      // If all complete, scroll to first module
      this.scrollToFirstModule();
    }
    
    /**
     * Submit the header form (Add to Cart)
     */
    submitHeaderForm() {
      const form = this.elements.headerForm?.querySelector('form');
      if (!form) return;
      
      // Set loading state
      this.setHeaderButtonState('loading');
      
      // Get form data
      const formData = new FormData(form);
      
      // Submit via fetch
      fetch(window.routes?.cart_add_url || '/cart/add.js', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 422 || data.message) {
            // Error
            console.error('[LoopTech Spec Modules] Cart error:', data.message);
            this.setHeaderButtonState('ready');
          } else {
            // Success - update cart drawer or redirect
            this.setHeaderButtonState('ready');
            
            // Trigger cart update event
            if (typeof publish === 'function') {
              publish('cart:update', { source: 'looptech-product', cartData: data });
            }
            
            // Open cart drawer or redirect to cart
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer && typeof cartDrawer.open === 'function') {
              cartDrawer.open();
            } else {
              window.location.href = window.routes?.cart_url || '/cart';
            }
          }
        })
        .catch(error => {
          console.error('[LoopTech Spec Modules] Fetch error:', error);
          this.setHeaderButtonState('ready');
        });
    }
    
    /**
     * Check for URL variant parameter and pre-select
     */
    checkUrlVariant() {
      const urlParams = new URLSearchParams(window.location.search);
      const variantId = urlParams.get('variant');
      
      if (!variantId || !this.productData?.variants) return;
      
      const variant = this.productData.variants.find(v => v.id === parseInt(variantId, 10));
      if (!variant) return;
      
      // Check if this is a color switch navigation
      // If so, only pre-select the Color option, not other options like Storage
      const isColorSwitch = sessionStorage.getItem('looptech_color_switch') === 'true';
      
      // Pre-select options based on variant
      variant.options.forEach((value, index) => {
        const optionName = this.productData.options[index];
        const optionNameLower = optionName.toLowerCase();
        
        // If this is a color switch, only pre-select Color option
        if (isColorSwitch && optionNameLower !== 'color' && optionNameLower !== 'colour') {
          console.log('[LoopTech] Skipping pre-selection of', optionName, '(color switch mode)');
          return; // Skip non-color options
        }
        
        this.selections.set(optionName, value);
        
        // Check the corresponding radio input
        const input = this.container.querySelector(
          `[data-spec-option][data-option-value="${CSS.escape(value)}"] input`
        );
        if (input) {
          input.checked = true;
          this.updateOptionVisuals(input);
        }
        
        // Mark module as complete
        this.updateModuleState(optionName, true);
      });
      
      // Update prices and check completion
      this.updateAllPrices();
      this.checkCompletion();
    }
    
    /**
     * Handle option selection
     */
    handleOptionSelect(event) {
      const input = event.target;
      const optionName = input.dataset.optionName;
      const optionValue = input.value;
      const optionIndex = parseInt(input.dataset.optionIndex, 10);
      
      // Store selection
      this.selections.set(optionName, optionValue);
      
      // Update visual states
      this.updateOptionVisuals(input);
      this.updateModuleState(optionName, true);
      
      // Update hidden variant inputs in header form
      this.updateHiddenInputs();
      
      // Update sold out states for remaining options
      this.updateSoldOutStates();
      
      // Update all prices based on current selection
      this.updateAllPrices();
      
      // Update header spec summary
      this.updateHeaderSpecSummary();
      
      // Update header button state
      this.updateHeaderButtonState();
      
      // Check if all selections complete
      const isComplete = this.checkCompletion();
      
      // Auto-scroll to next module if not complete (per clarification: Yes, with smooth scroll)
      if (!isComplete) {
        this.scrollToNextModule(optionIndex);
      }
      
      console.log('[LoopTech Spec Modules] Selected:', optionName, '=', optionValue);
    }
    
    /**
     * Update the header spec summary text
     */
    updateHeaderSpecSummary() {
      if (!this.elements.headerSpecSummary) return;
      
      if (this.selections.size === 0) {
        this.elements.headerSpecSummary.textContent = '';
        this.elements.headerSpecSummary.dataset.state = 'empty';
        return;
      }
      
      // Build spec string in order of options
      const specParts = [];
      for (const optName of this.requiredOptions) {
        if (this.selections.has(optName)) {
          specParts.push(this.selections.get(optName));
        }
      }
      
      const specString = specParts.join(' • ');
      this.elements.headerSpecSummary.textContent = specString;
      
      // Update state
      if (this.selections.size === this.requiredOptions.length) {
        this.elements.headerSpecSummary.dataset.state = 'complete';
      } else {
        this.elements.headerSpecSummary.dataset.state = 'partial';
      }
    }
    
    /**
     * Update the header button state based on selections
     */
    updateHeaderButtonState() {
      const selectionCount = this.selections.size;
      const totalOptions = this.requiredOptions.length;
      
      if (selectionCount === 0) {
        this.setHeaderButtonState('idle');
      } else if (selectionCount < totalOptions) {
        this.setHeaderButtonState('partial');
      } else {
        // All selected - check if variant is available
        const variant = this.getSelectedVariant();
        if (variant && variant.available) {
          this.setHeaderButtonState('ready');
        } else {
          this.setHeaderButtonState('sold-out');
        }
      }
    }
    
    /**
     * Set header button state and update text
     */
    setHeaderButtonState(state) {
      if (!this.elements.headerButton || !this.elements.headerButtonText) return;
      
      this.elements.headerButton.dataset.state = state;
      
      switch (state) {
        case 'idle':
          this.elements.headerButtonText.textContent = 'Select specs below';
          this.elements.headerButton.type = 'button';
          break;
        case 'partial':
          // Find next unselected option name
          let nextOption = 'specs';
          for (const optName of this.requiredOptions) {
            if (!this.selections.has(optName)) {
              nextOption = optName.toLowerCase();
              break;
            }
          }
          this.elements.headerButtonText.textContent = `Select ${nextOption}`;
          this.elements.headerButton.type = 'button';
          break;
        case 'ready':
          this.elements.headerButtonText.textContent = 'Add To Cart';
          this.elements.headerButton.type = 'button'; // We handle submit via JS
          break;
        case 'sold-out':
          this.elements.headerButtonText.textContent = 'Sold Out';
          this.elements.headerButton.type = 'button';
          break;
        case 'loading':
          this.elements.headerButtonText.textContent = 'Adding...';
          break;
      }
    }
    
    /**
     * Update visual state of selected option
     */
    updateOptionVisuals(selectedInput) {
      // Find parent grid/list
      const optionContainer = selectedInput.closest('[data-option-grid], [data-option-list]');
      if (!optionContainer) return;
      
      // Remove selected class from all options in this group
      const allOptions = optionContainer.querySelectorAll('[data-spec-option]');
      allOptions.forEach(opt => {
        opt.classList.remove('looptech-spec-card--selected', 'looptech-spec-row--selected');
      });
      
      // Add selected class to chosen option
      const selectedOption = selectedInput.closest('[data-spec-option]');
      if (selectedOption) {
        if (selectedOption.classList.contains('looptech-spec-card')) {
          selectedOption.classList.add('looptech-spec-card--selected');
        } else {
          selectedOption.classList.add('looptech-spec-row--selected');
        }
      }
    }
    
    /**
     * Update module completion state
     */
    updateModuleState(optionName, isComplete) {
      const module = this.container.querySelector(`[data-spec-module][data-option-name="${optionName}"]`);
      if (module) {
        module.dataset.completed = isComplete ? 'true' : 'false';
      }
    }
    
    /**
     * Update hidden variant inputs in the header form
     */
    updateHiddenInputs() {
      this.elements.hiddenVariantInputs.forEach(container => {
        this.selections.forEach((value, optionName) => {
          const input = container.querySelector(`input[data-option-name="${optionName}"][value="${CSS.escape(value)}"]`);
          if (input) {
            input.checked = true;
          }
        });
      });
    }
    
    /**
     * Update all option prices based on current selection
     */
    updateAllPrices() {
      if (!this.productData?.variants) return;
      
      // For each module/option group
      this.elements.modules.forEach(module => {
        const optionIndex = parseInt(module.dataset.optionIndex, 10);
        const optionName = module.dataset.optionName;
        
        // Get all price elements in this module
        const priceElements = module.querySelectorAll('[data-option-price]');
        
        priceElements.forEach(priceEl => {
          const optionCard = priceEl.closest('[data-spec-option]');
          const optionValue = optionCard?.dataset.optionValue;
          
          if (!optionValue) return;
          
          // Calculate price for this option given current selections
          const price = this.calculatePriceForOption(optionIndex, optionValue);
          
          if (price !== null) {
            priceEl.textContent = this.formatMoney(price);
          }
        });
      });
    }
    
    /**
     * Calculate the EXACT variant price for a specific option value
     * given the current selections in other options.
     * 
     * Per clarification: Show exact variant price, not "from" or "cheapest".
     */
    calculatePriceForOption(optionIndex, optionValue) {
      if (!this.productData?.variants) return null;
      
      // Build test options array with current selections
      const testOptions = [];
      
      for (let i = 0; i < this.productData.options.length; i++) {
        const optName = this.productData.options[i];
        
        if (i === optionIndex) {
          // Use the value we're calculating for
          testOptions.push(optionValue);
        } else if (this.selections.has(optName)) {
          // Use selected value
          testOptions.push(this.selections.get(optName));
        } else {
          // Not selected yet - use null to match any
          testOptions.push(null);
        }
      }
      
      // Find matching variant - prefer exact match, fallback to first available
      let matchingVariant = null;
      
      this.productData.variants.forEach(variant => {
        const matches = testOptions.every((opt, idx) => {
          return opt === null || variant.options[idx] === opt;
        });
        
        if (matches && variant.available) {
          // Take the first available match (exact price for this combo)
          if (!matchingVariant) {
            matchingVariant = variant;
          }
        }
      });
      
      return matchingVariant ? matchingVariant.price : null;
    }
    
    /**
     * Check if an option value is sold out given current selections
     */
    isOptionSoldOut(optionIndex, optionValue) {
      if (!this.productData?.variants) return true;
      
      // Build test options with current selections
      const testOptions = [];
      
      for (let i = 0; i < this.productData.options.length; i++) {
        const optName = this.productData.options[i];
        
        if (i === optionIndex) {
          testOptions.push(optionValue);
        } else if (this.selections.has(optName)) {
          testOptions.push(this.selections.get(optName));
        } else {
          testOptions.push(null);
        }
      }
      
      // Check if any matching variant is available
      return !this.productData.variants.some(variant => {
        const matches = testOptions.every((opt, idx) => {
          return opt === null || variant.options[idx] === opt;
        });
        return matches && variant.available;
      });
    }
    
    /**
     * Update sold out states for all options based on current selections
     */
    updateSoldOutStates() {
      if (!this.productData?.variants) return;
      
      this.elements.modules.forEach(module => {
        const optionIndex = parseInt(module.dataset.optionIndex, 10);
        const optionCards = module.querySelectorAll('[data-spec-option]');
        
        optionCards.forEach(card => {
          const value = card.dataset.optionValue;
          const isSoldOut = this.isOptionSoldOut(optionIndex, value);
          const input = card.querySelector('input');
          
          // Update data attribute
          card.dataset.soldOut = isSoldOut ? 'true' : 'false';
          
          // Update classes
          if (card.classList.contains('looptech-spec-card')) {
            card.classList.toggle('looptech-spec-card--sold-out', isSoldOut);
          } else {
            card.classList.toggle('looptech-spec-row--sold-out', isSoldOut);
          }
          
          // Update input disabled state
          if (input) {
            input.disabled = isSoldOut;
          }
          
          // Update price display
          const priceEl = card.querySelector('[data-option-price]');
          const soldOutEl = card.querySelector('.looptech-spec-card__sold-out, .looptech-spec-row__sold-out');
          
          if (isSoldOut) {
            if (priceEl) priceEl.style.display = 'none';
            if (soldOutEl) soldOutEl.style.display = '';
          } else {
            if (priceEl) priceEl.style.display = '';
            if (soldOutEl) soldOutEl.style.display = 'none';
          }
        });
      });
    }
    
    /**
     * Check if all selections are complete
     */
    checkCompletion() {
      const isComplete = this.requiredOptions.every(opt => this.selections.has(opt));
      
      if (isComplete) {
        this.onComplete();
      } else {
        this.hideSummaryCard();
      }
      
      return isComplete;
    }
    
    /**
     * Called when all selections are complete
     */
    onComplete() {
      const variant = this.getSelectedVariant();
      
      if (!variant) {
        console.error('[LoopTech Spec Modules] No variant found for selections');
        return;
      }
      
      // Check if selected variant is sold out
      if (!variant.available) {
        this.handleSoldOutVariant(variant);
        return;
      }
      
      // Update header elements
      this.updateHeaderPrice(variant);
      this.updateHeaderVariantId(variant.id);
      
      // Update summary card
      this.updateSummaryCard(variant);
      
      // Show summary card
      this.showSummaryCard();
      
      // Update URL
      this.updateUrl(variant.id);
      
      console.log('[LoopTech Spec Modules] All selections complete, variant:', variant.id);
    }
    
    /**
     * Update header price display
     */
    updateHeaderPrice(variant) {
      // Update main price (remove "From" prefix)
      if (this.elements.headerPrice) {
        this.elements.headerPrice.textContent = this.formatMoney(variant.price);
      }
      
      // Update compare price
      if (this.elements.headerComparePrice) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          this.elements.headerComparePrice.textContent = this.formatMoney(variant.compare_at_price);
          this.elements.headerComparePrice.style.display = '';
        } else {
          this.elements.headerComparePrice.style.display = 'none';
        }
      }
      
      // Update Klarna amount
      if (this.elements.headerKlarnaAmount) {
        const klarnaAmount = Math.round(variant.price / 3);
        this.elements.headerKlarnaAmount.textContent = this.formatMoney(klarnaAmount);
      }
    }
    
    /**
     * Update header variant ID input
     */
    updateHeaderVariantId(variantId) {
      if (this.elements.headerVariantId) {
        this.elements.headerVariantId.value = variantId;
      }
    }
    
    /**
     * Handle when selected variant combination is sold out
     */
    handleSoldOutVariant(variant) {
      // Update header elements
      this.updateHeaderPrice(variant);
      this.updateHeaderVariantId(variant.id);
      this.setHeaderButtonState('sold-out');
      
      // Show summary card but with sold out state
      this.updateSummaryCard(variant);
      
      // Update button to sold out
      if (this.elements.summaryButton) {
        this.elements.summaryButton.disabled = true;
        this.elements.summaryButton.textContent = 'Sold Out';
      }
      
      // Still show the card so user can see what they configured
      this.showSummaryCard();
      
      // Update URL
      this.updateUrl(variant.id);
      
      console.log('[LoopTech Spec Modules] Variant sold out:', variant.id);
    }
    
    /**
     * Get the selected variant based on current selections
     */
    getSelectedVariant() {
      if (!this.productData?.variants) return null;
      
      // Build options array in order
      const options = this.productData.options.map(optName => this.selections.get(optName));
      
      // Check if all options are selected
      if (options.some(opt => opt === undefined)) return null;
      
      // Look up in pre-computed map
      const key = options.join('|');
      return this.variantMap.get(key) || null;
    }
    
    /**
     * Update the summary card with selected variant
     */
    updateSummaryCard(variant) {
      // Update price
      if (this.elements.summaryPrice) {
        this.elements.summaryPrice.textContent = this.formatMoney(variant.price);
      }
      
      // Update compare price
      if (this.elements.summaryComparePrice) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          this.elements.summaryComparePrice.textContent = this.formatMoney(variant.compare_at_price);
          this.elements.summaryComparePrice.style.display = '';
        } else {
          this.elements.summaryComparePrice.style.display = 'none';
        }
      }
      
      // Update specs string
      if (this.elements.summarySpecs) {
        const specs = Array.from(this.selections.values()).join(' • ');
        this.elements.summarySpecs.textContent = specs;
      }
      
      // Update variant ID
      if (this.elements.summaryVariantId) {
        this.elements.summaryVariantId.value = variant.id;
      }
      
      // Update Klarna
      if (this.elements.summaryKlarna) {
        const klarnaAmount = Math.round(variant.price / 3);
        this.elements.summaryKlarna.textContent = this.formatMoney(klarnaAmount);
      }
      
      // Update product image if variant has image
      const summaryImage = document.querySelector('[data-summary-image]');
      if (summaryImage && variant.featured_image) {
        // Build image URL at appropriate size
        const imageUrl = variant.featured_image.src.replace(/(\.[a-z]+)(\?.*)?$/, '_800x800$1');
        summaryImage.src = imageUrl;
      }
    }
    
    /**
     * Show the inline summary card with fade-in animation
     */
    showSummaryCard() {
      if (this.elements.summaryCard) {
        this.elements.summaryCard.classList.add('is-visible');
        
        // Skip auto-scroll if we're restoring from a color switch
        if (this.suppressAutoScroll) {
          console.log('[LoopTech] Skipping auto-scroll to summary (color switch restore)');
          this.suppressAutoScroll = false;
          return;
        }
        
        // Optional: smooth scroll to summary card after fade-in
        setTimeout(() => {
          this.elements.summaryCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 300);
      }
    }
    
    /**
     * Hide the inline summary card
     */
    hideSummaryCard() {
      if (this.elements.summaryCard) {
        this.elements.summaryCard.classList.remove('is-visible');
      }
    }
    
    /**
     * Update URL with variant ID
     */
    updateUrl(variantId) {
      const url = new URL(window.location);
      url.searchParams.set('variant', variantId);
      window.history.replaceState({}, '', url);
    }
    
    /**
     * Scroll to the first spec module
     */
    scrollToFirstModule() {
      if (this.isScrolling) return;
      
      const firstModule = this.container.querySelector('[data-spec-module]');
      if (firstModule) {
        this.smoothScrollTo(firstModule);
      }
    }
    
    /**
     * Scroll to the next unselected module
     * Per clarification: Yes, auto-scroll with subtle smooth animation
     */
    scrollToNextModule(currentIndex) {
      if (this.isScrolling) return;
      
      // Find next incomplete module
      let nextModule = null;
      
      // First, check the module right after current
      const immediateNext = this.container.querySelector(
        `[data-spec-module][data-module-index="${currentIndex + 1}"]`
      );
      
      if (immediateNext && immediateNext.dataset.completed !== 'true') {
        nextModule = immediateNext;
      } else {
        // Find any incomplete module
        const allModules = this.container.querySelectorAll('[data-spec-module]');
        for (const module of allModules) {
          if (module.dataset.completed !== 'true') {
            nextModule = module;
            break;
          }
        }
      }
      
      if (nextModule) {
        // Delay for visual feedback before scrolling
        setTimeout(() => {
          this.smoothScrollTo(nextModule);
        }, 300);
      }
    }
    
    /**
     * Smooth scroll to an element with header offset
     */
    smoothScrollTo(element) {
      this.isScrolling = true;
      
      // Calculate offset for sticky header (estimate 100px)
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation completes
      setTimeout(() => {
        this.isScrolling = false;
      }, 800);
    }
    
    /**
     * Format price in GBP
     */
    formatMoney(cents) {
      return '£' + (cents / 100).toFixed(2);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COLOR CAROUSEL FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Initialize color carousel for a spec module
     */
    initColorCarousel() {
      const colorCarousel = this.container.querySelector('[data-color-carousel]');
      if (!colorCarousel) return;
      
      this.colorCarousel = {
        container: colorCarousel,
        track: colorCarousel.querySelector('[data-carousel-track]'),
        prevBtn: colorCarousel.querySelector('.looptech-color-carousel__nav--prev'),
        nextBtn: colorCarousel.querySelector('.looptech-color-carousel__nav--next'),
        currentIndex: 0,
        thumbsPerView: 4,
        images: []
      };
      
      // Attach carousel nav listeners
      if (this.colorCarousel.prevBtn) {
        this.colorCarousel.prevBtn.addEventListener('click', () => this.slideCarousel(-1));
      }
      if (this.colorCarousel.nextBtn) {
        this.colorCarousel.nextBtn.addEventListener('click', () => this.slideCarousel(1));
      }
      
      // Calculate thumbs per view based on container width
      this.calculateThumbsPerView();
      window.addEventListener('resize', () => this.calculateThumbsPerView());
      
      // Load initial carousel images from selected color
      this.loadInitialCarouselImages();
    }
    
    /**
     * Calculate how many thumbnails fit in view
     */
    calculateThumbsPerView() {
      if (!this.colorCarousel?.track) return;
      
      const containerWidth = this.colorCarousel.track.parentElement.offsetWidth;
      const thumbWidth = 72 + 10; // thumb width + gap
      this.colorCarousel.thumbsPerView = Math.floor(containerWidth / thumbWidth) || 3;
    }
    
    /**
     * Load initial carousel images from the selected color card
     */
    loadInitialCarouselImages() {
      // Debug: Log all color cards and their image counts
      const allColorCards = this.container.querySelectorAll('.looptech-spec-card[data-variant-images]');
      console.log('[LoopTech Carousel] Found', allColorCards.length, 'color cards');
      allColorCards.forEach(card => {
        const color = card.dataset.optionValue;
        const imageCount = card.dataset.imageCount;
        const colorSearch = card.dataset.colorSearch;
        console.log(`[LoopTech Carousel] ${color}: ${imageCount} images (searched for: "${colorSearch}")`);
      });
      
      const selectedCard = this.container.querySelector('.looptech-spec-card--selected[data-variant-images]');
      if (selectedCard) {
        console.log('[LoopTech Carousel] Loading images for selected card:', selectedCard.dataset.optionValue);
        this.updateCarouselImages(selectedCard);
      } else {
        // Try first available color card
        const firstCard = this.container.querySelector('.looptech-spec-card[data-variant-images]:not(.looptech-spec-card--sold-out)');
        if (firstCard) {
          console.log('[LoopTech Carousel] No selected card, loading first available:', firstCard.dataset.optionValue);
          this.updateCarouselImages(firstCard);
        }
      }
    }
    
    /**
     * Update carousel with images from a color card
     */
    updateCarouselImages(colorCard) {
      if (!this.colorCarousel?.track) return;
      
      try {
        const rawData = colorCard.dataset.variantImages || '[]';
        console.log('[LoopTech Carousel] Raw image data for', colorCard.dataset.optionValue + ':', rawData);
        
        const imagesData = JSON.parse(rawData);
        console.log('[LoopTech Carousel] Parsed', imagesData.length, 'images');
        
        this.colorCarousel.images = imagesData;
        this.colorCarousel.currentIndex = 0;
        
        // Clear track
        this.colorCarousel.track.innerHTML = '';
        
        if (imagesData.length === 0) {
          // Show empty state
          this.colorCarousel.track.innerHTML = `
            <div class="looptech-color-carousel__empty">
              No images available for this color
            </div>
          `;
          this.updateCarouselNav();
          return;
        }
        
        // Create thumbnails
        imagesData.forEach((img, index) => {
          const thumb = document.createElement('button');
          thumb.type = 'button';
          thumb.className = 'looptech-color-carousel__thumb' + (index === 0 ? ' looptech-color-carousel__thumb--active' : '');
          thumb.setAttribute('aria-label', `View image ${index + 1}`);
          thumb.dataset.index = index;
          thumb.dataset.fullImage = img.full;
          thumb.dataset.mediaId = img.id;
          
          thumb.innerHTML = `<img src="${img.thumb}" alt="Product image ${index + 1}" loading="lazy">`;
          
          thumb.addEventListener('click', () => this.handleThumbnailClick(thumb, index));
          
          this.colorCarousel.track.appendChild(thumb);
        });
        
        this.updateCarouselNav();
        
      } catch (e) {
        console.error('[LoopTech Spec Modules] Error parsing variant images:', e);
      }
    }
    
    /**
     * Handle thumbnail click
     */
    handleThumbnailClick(thumb, index) {
      // Update active state
      const allThumbs = this.colorCarousel.track.querySelectorAll('.looptech-color-carousel__thumb');
      allThumbs.forEach(t => t.classList.remove('looptech-color-carousel__thumb--active'));
      thumb.classList.add('looptech-color-carousel__thumb--active');
      
      // Update main gallery if present
      const mediaId = thumb.dataset.mediaId;
      if (mediaId) {
        this.updateMainGallery(mediaId);
      }
    }
    
    /**
     * Update main product gallery to show specific media
     */
    updateMainGallery(mediaId) {
      // Find gallery and trigger media change
      const gallery = document.querySelector('[data-gallery-section]');
      if (!gallery) return;
      
      // Update thumbnails
      const thumbnails = gallery.querySelectorAll('.looptech-gallery__thumbnail');
      const slides = gallery.querySelectorAll('.looptech-gallery__slide');
      
      thumbnails.forEach(thumb => {
        if (thumb.dataset.mediaId === mediaId) {
          thumb.classList.add('looptech-gallery__thumbnail--active');
        } else {
          thumb.classList.remove('looptech-gallery__thumbnail--active');
        }
      });
      
      slides.forEach(slide => {
        if (slide.dataset.mediaId === mediaId) {
          slide.classList.add('looptech-gallery__slide--active');
          slide.removeAttribute('hidden');
        } else {
          slide.classList.remove('looptech-gallery__slide--active');
          slide.setAttribute('hidden', '');
        }
      });
    }
    
    /**
     * Slide carousel left or right
     */
    slideCarousel(direction) {
      if (!this.colorCarousel?.track) return;
      
      const maxIndex = Math.max(0, this.colorCarousel.images.length - this.colorCarousel.thumbsPerView);
      const newIndex = Math.max(0, Math.min(this.colorCarousel.currentIndex + direction, maxIndex));
      
      if (newIndex !== this.colorCarousel.currentIndex) {
        this.colorCarousel.currentIndex = newIndex;
        
        const thumbWidth = 72 + 10; // thumb + gap
        const offset = newIndex * thumbWidth;
        this.colorCarousel.track.style.transform = `translateX(-${offset}px)`;
        
        this.updateCarouselNav();
      }
    }
    
    /**
     * Update carousel navigation button states
     */
    updateCarouselNav() {
      if (!this.colorCarousel) return;
      
      const maxIndex = Math.max(0, this.colorCarousel.images.length - this.colorCarousel.thumbsPerView);
      
      if (this.colorCarousel.prevBtn) {
        this.colorCarousel.prevBtn.disabled = this.colorCarousel.currentIndex <= 0;
      }
      if (this.colorCarousel.nextBtn) {
        this.colorCarousel.nextBtn.disabled = this.colorCarousel.currentIndex >= maxIndex;
      }
    }
    
  }
  
  /**
   * Initialize spec modules when DOM is ready
   */
  function initSpecModules() {
    const container = document.querySelector('[data-spec-modules]');
    
    if (!container) {
      console.log('[LoopTech Spec Modules] No spec modules container found');
      return;
    }
    
    // Skip if already initialized
    if (container.dataset.initialized) return;
    
    // Create instance
    const specModules = new LooptechSpecModules(container);
    
    // Store reference
    container.looptechSpecModules = specModules;
    container.dataset.initialized = 'true';
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpecModules);
  } else {
    initSpecModules();
  }
  
  // Expose for external use
  window.LooptechSpecModules = LooptechSpecModules;
  window.initLooptechSpecModules = initSpecModules;
  
})();

