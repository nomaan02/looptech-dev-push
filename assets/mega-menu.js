/* Mega Menu JavaScript - Copy to assets/mega-menu.js */

(function() {
    'use strict';
  
    class MegaMenu {
      constructor() {
        this.header = document.querySelector('.mega-menu-header');
        this.categoriesBtn = document.querySelector('.mega-menu-categories-btn');
        this.mobileBtn = document.querySelector('.mega-menu-mobile-btn');
        this.dropdown = document.querySelector('.mega-menu-dropdown');
        this.mobileMenu = document.querySelector('.mega-menu-mobile');
        this.chevron = document.querySelector('.mega-menu-chevron');
        this.blurOverlay = document.querySelector('.mega-menu-blur-overlay');
        
        this.isDesktopOpen = false;
        this.isMobileOpen = false;
        
        this.init();
      }
  
      init() {
        if (this.categoriesBtn) {
          this.categoriesBtn.addEventListener('click', () => this.toggleDesktopMenu());
        }
  
        if (this.mobileBtn) {
          this.mobileBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
  
        if (this.dropdown) {
          this.dropdown.addEventListener('mouseleave', () => this.closeDesktopMenu());
        }
  
        if (this.blurOverlay) {
          this.blurOverlay.addEventListener('click', () => this.closeAllMenus());
        }
  
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.closeAllMenus();
          }
        });
  
        // Close menus on window resize
        window.addEventListener('resize', () => {
          if (window.innerWidth >= 1024 && this.isMobileOpen) {
            this.closeMobileMenu();
          }
        });
      }
  
      toggleDesktopMenu() {
        if (this.isDesktopOpen) {
          this.closeDesktopMenu();
        } else {
          this.openDesktopMenu();
        }
      }
  
      openDesktopMenu() {
        this.isDesktopOpen = true;
        
        if (this.dropdown) {
          this.dropdown.classList.remove('mega-menu-hidden');
        }
        
        if (this.categoriesBtn) {
          this.categoriesBtn.classList.add('active');
        }
        
        if (this.chevron) {
          this.chevron.classList.add('rotated');
        }
        
        this.showOverlay();
      }
  
      closeDesktopMenu() {
        this.isDesktopOpen = false;
        
        if (this.dropdown) {
          this.dropdown.classList.add('mega-menu-hidden');
        }
        
        if (this.categoriesBtn) {
          this.categoriesBtn.classList.remove('active');
        }
        
        if (this.chevron) {
          this.chevron.classList.remove('rotated');
        }
        
        if (!this.isMobileOpen) {
          this.hideOverlay();
        }
      }
  
      toggleMobileMenu() {
        if (this.isMobileOpen) {
          this.closeMobileMenu();
        } else {
          this.openMobileMenu();
        }
      }
  
      openMobileMenu() {
        this.isMobileOpen = true;
        
        if (this.mobileMenu) {
          this.mobileMenu.classList.remove('mega-menu-hidden');
        }
        
        document.body.style.overflow = 'hidden';
        this.showOverlay();
        this.updateMobileIcon(true);
      }
  
      closeMobileMenu() {
        this.isMobileOpen = false;
        
        if (this.mobileMenu) {
          this.mobileMenu.classList.add('mega-menu-hidden');
        }
        
        document.body.style.overflow = '';
        
        if (!this.isDesktopOpen) {
          this.hideOverlay();
        }
        
        this.updateMobileIcon(false);
      }
  
      updateMobileIcon(isOpen) {
        const menuIcon = this.mobileBtn?.querySelector('.menu-icon');
        const closeIcon = this.mobileBtn?.querySelector('.close-icon');
        
        if (menuIcon && closeIcon) {
          if (isOpen) {
            menuIcon.classList.add('mega-menu-hidden');
            closeIcon.classList.remove('mega-menu-hidden');
          } else {
            menuIcon.classList.remove('mega-menu-hidden');
            closeIcon.classList.add('mega-menu-hidden');
          }
        }
      }
  
      showOverlay() {
        if (this.blurOverlay) {
          this.blurOverlay.classList.remove('mega-menu-hidden');
        }
      }
  
      hideOverlay() {
        if (this.blurOverlay) {
          this.blurOverlay.classList.add('mega-menu-hidden');
        }
      }
  
      closeAllMenus() {
        this.closeDesktopMenu();
        this.closeMobileMenu();
      }
    }
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new MegaMenu());
    } else {
      new MegaMenu();
    }
  })();
  