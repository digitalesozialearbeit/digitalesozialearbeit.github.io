/**
 * Dynamic Content Loader with Theme Management and Navbar Support
 * Handles dynamic HTML includes, theme switching, and navbar functionality
 * @version 1.1.0
 */

(() => {
  "use strict";

  /**
   * Theme management utilities
   */
  const ThemeManager = {
    // Previous implementation...
    getStoredTheme: () => localStorage.getItem("theme") || "light",
    setStoredTheme: (theme) => localStorage.setItem("theme", theme),
    applyTheme: (theme) => {
      document.documentElement.setAttribute("data-bs-theme", theme);
    },
    initThemeSwitcher: () => {
      const themeSwitcher = document.querySelector('[data-bs-toggle="mode"]');
      if (!themeSwitcher) {
        console.warn("Theme switcher element not found");
        return;
      }

      const themeSwitcherCheck = themeSwitcher.querySelector(
        'input[type="checkbox"]'
      );
      if (!themeSwitcherCheck) {
        console.warn("Theme switcher checkbox not found");
        return;
      }

      // Set initial state
      const currentTheme = ThemeManager.getStoredTheme();
      themeSwitcherCheck.checked = currentTheme === "dark";
      ThemeManager.applyTheme(currentTheme);

      // Add click handler
      themeSwitcher.addEventListener("click", () => {
        const newTheme = themeSwitcherCheck.checked ? "dark" : "light";
        ThemeManager.setStoredTheme(newTheme);
        ThemeManager.applyTheme(newTheme);
      });
    },
  };

  /**
   * Navbar management utilities
   */
  const NavbarManager = {
    initStickyNavbar: () => {
      const navbar = document.querySelector(".navbar-sticky");
      if (navbar == null) return;

      const classes = navbar.classList;
      const navbarHeight = navbar.offsetHeight;

      if (classes.contains("position-absolute")) {
        // Handle absolute positioned navbar
        window.addEventListener("scroll", (e) => {
          if (e.currentTarget.pageYOffset > 500) {
            navbar.classList.add("navbar-stuck");
          } else {
            navbar.classList.remove("navbar-stuck");
          }
        });
      } else {
        // Handle fixed positioned navbar
        window.addEventListener("scroll", (e) => {
          if (e.currentTarget.pageYOffset > 500) {
            document.body.style.paddingTop = navbarHeight + "px";
            navbar.classList.add("navbar-stuck");
          } else {
            document.body.style.paddingTop = "";
            navbar.classList.remove("navbar-stuck");
          }
        });
      }

      // Trigger initial state check
      window.dispatchEvent(new Event("scroll"));
    },
  };

  /**
   * Content loading utilities
   */
  const ContentLoader = {
    async loadInclude(el) {
      const file = el.getAttribute("data-include");
      console.log(`Loading include: ${file}`);

      try {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        el.innerHTML = text;
        console.log(`Successfully loaded: ${file}`);

        // If this is a header include, initialize components
        if (file.includes("header")) {
          // Initialize theme switcher
          ThemeManager.initThemeSwitcher();

          // Initialize sticky navbar
          // Small timeout to ensure DOM is fully updated
          setTimeout(() => {
            NavbarManager.initStickyNavbar();
          }, 0);
        }

        return true;
      } catch (error) {
        console.error(`Failed to load include ${file}:`, error);
        el.innerHTML = `
                    <div style="color: red; padding: 1rem; border: 1px solid red; margin: 1rem 0;">
                        Error loading ${file}: ${error.message}
                    </div>`;
        return false;
      }
    },

    async loadAllIncludes() {
      const elements = document.querySelectorAll("[data-include]");
      console.log(`Found ${elements.length} includes to load`);

      for (const el of elements) {
        await this.loadInclude(el);
      }
    },
  };

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    ContentLoader.loadAllIncludes().catch((error) => {
      console.error("Error in content loading:", error);
    });

    // Handle system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const currentTheme = ThemeManager.getStoredTheme();
        ThemeManager.applyTheme(currentTheme);
      });
  });
})();
