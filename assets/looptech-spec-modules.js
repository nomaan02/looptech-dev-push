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
      
      // Check for URL variant parameter
      this.checkUrlVariant();
      
      // Auto-select single-value options
      this.autoSelectSingleOptions();
      
      console.log('[LoopTech Spec Modules] Initialized with', this.requiredOptions.length, 'options');
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
      
      // Pre-select options based on variant
      variant.options.forEach((value, index) => {
        const optionName = this.productData.options[index];
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

