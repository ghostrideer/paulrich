document.addEventListener("DOMContentLoaded", () => {

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let animationDuration = 800
  
    if (prefersReducedMotion.matches) {
      animationDuration = 10
    }
  
    prefersReducedMotion.addEventListener("change", (e) => {
      animationDuration = e.matches ? 10 : 800
    })
  
    /**
     * dummy termek adatok
  
     */
    const dummyProducts = [
      {
        id: "1",
        name: "Signature Gold",
        price: 299,
        compareAtPrice: 399,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop",
        rating: 4.5,
        inventory: 10,
        badge: "sale",
        vendor: "paul rich",
      },
      {
        id: "2",
        name: "Carbon Black",
        price: 349,
        compareAtPrice: null,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop",
        rating: 5,
        inventory: 15,
        badge: null,
        vendor: "paul rich",
      },
      {
        id: "3",
        name: "Motorsport Red",
        price: 449,
        compareAtPrice: null,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop",
        rating: 4,
        inventory: 0, // Elfogyott termék
        badge: "sold-out",
        vendor: "paul rich",
      },
      {
        id: "4",
        name: "Rose Gold Elegance",
        price: 399,
        compareAtPrice: null,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop",
        rating: 5,
        inventory: 8,
        badge: "custom",
        vendor: "paul rich",
      },
      {
        id: "5",
        name: "Silver Classic",
        price: 279,
        compareAtPrice: null,
        image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=600&fit=crop",
        rating: 4.5,
        inventory: 20,
        badge: null,
        vendor: "paul rich",
      },
      {
        id: "6",
        name: "Midnight Blue",
        price: 249,
        compareAtPrice: 329,
        image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&h=600&fit=crop",
        rating: 4,
        inventory: 5,
        badge: "sale",
        vendor: "paul rich",
      },
    ]
  
    /**
     * ========================================
     * AUTH – FELHASZNÁLÓK ÉS BEJELENTKEZETT ÁLLAPOT
     * ========================================
     */
    const USERS_STORAGE_KEY = "paulrich_users"
    const CURRENT_USER_STORAGE_KEY = "paulrich_current_user"

    function getStoredUsers() {
      const raw = localStorage.getItem(USERS_STORAGE_KEY)
      if (!raw) return []
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    function saveStoredUsers(users) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }

    function getCurrentUser() {
      const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
      if (!raw) return null
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }

    function setCurrentUser(user) {
      if (!user) {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
      } else {
        localStorage.setItem(
          CURRENT_USER_STORAGE_KEY,
          JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        )
      }
    }

    function getCartStorageKeyForUser(user) {
      if (!user || !user.email) return null
      return `paulrich_cart_${user.email.toLowerCase()}`
    }

    const currentUser = getCurrentUser()

    /**
     */
    function generateStars(rating, containerEl) {
      /**
       * Csillag kitöltés számítása:
       * - Ha rating >= csillag index, teljesen kitöltött
       * - Ha rating > index - 1 és rating < index, félig kitöltött
       * - Egyébként üres
       */
      let starsHTML = ""
      const styles = containerEl ? getComputedStyle(containerEl) : getComputedStyle(document.documentElement)
      const filledColor = (styles.getPropertyValue("--color-star-filled") || "#1c1c1c").trim()
      const emptyColor = (styles.getPropertyValue("--color-star-rating") || "rgba(28,28,28,0.45)").trim()
  
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
          // Teljesen kitöltött csillag
          starsHTML += `<svg width="14" height="14" viewBox="0 0 24 24" fill="${filledColor}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
        } else if (rating > i - 1) {
          // Félig kitöltött csillag - linearGradient használatával
          const percentage = (rating - (i - 1)) * 100
          const gradId = `half-${i}-${Math.random().toString(36).slice(2, 10)}`
          starsHTML += `
            <svg width="14" height="14" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="${gradId}">
                  <stop offset="${percentage}%" stop-color="${filledColor}"/>
                  <stop offset="${percentage}%" stop-color="${emptyColor}"/>
                </linearGradient>
              </defs>
              <path fill="url(#${gradId})" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          `
        } else {
          // Üres csillag
          starsHTML += `<svg width="14" height="14" viewBox="0 0 24 24" fill="${emptyColor}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
        }
      }
      return starsHTML
    }
  
   
    function initializeStars() {
      const starContainers = document.querySelectorAll(".stars[data-rating]")
      starContainers.forEach((container) => {
        const rating = Number.parseFloat(container.dataset.rating) || 0
        container.innerHTML = generateStars(rating, container)
      })
    }
  
    initializeStars()
  
    const megaMenuTriggers = document.querySelectorAll(".nav__link--mega")
  
    megaMenuTriggers.forEach((trigger) => {
      const menuId = trigger.getAttribute("aria-controls")
      const menu = document.getElementById(menuId)
  
      if (!menu) return
  
      trigger.addEventListener("mouseenter", () => {
        openMegaMenu(trigger, menu)
      })
  
      trigger.parentElement.addEventListener("mouseleave", () => {
        closeMegaMenu(trigger, menu)
      })
  
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          const isExpanded = trigger.getAttribute("aria-expanded") === "true"
          if (isExpanded) {
            closeMegaMenu(trigger, menu)
          } else {
            openMegaMenu(trigger, menu)
          }
        }
        if (e.key === "Escape") {
          closeMegaMenu(trigger, menu)
        }
      })
    })
  
    function openMegaMenu(trigger, menu) {
      megaMenuTriggers.forEach((t) => {
        const mId = t.getAttribute("aria-controls")
        const m = document.getElementById(mId)
        if (t !== trigger && m) {
          closeMegaMenu(t, m)
        }
      })
  
      trigger.setAttribute("aria-expanded", "true")
      menu.setAttribute("aria-hidden", "false")
    }
  
    function closeMegaMenu(trigger, menu) {
      trigger.setAttribute("aria-expanded", "false")
      menu.setAttribute("aria-hidden", "true")
    }
  
    const hamburgerBtn = document.querySelector(".header__hamburger")
    const mobileMenu = document.getElementById("mobile-menu")
  
    if (hamburgerBtn && mobileMenu) {
      hamburgerBtn.addEventListener("click", () => {
        const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true"
        if (isExpanded) {
          closeMobileMenu()
        } else {
          openMobileMenu()
        }
      })
    }
  
    function openMobileMenu() {
      if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.setAttribute("aria-expanded", "true")
        mobileMenu.setAttribute("aria-hidden", "false")
        document.body.classList.add("drawer-open")
      }
    }
  
    function closeMobileMenu() {
      if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.setAttribute("aria-expanded", "false")
        mobileMenu.setAttribute("aria-hidden", "true")
        document.body.classList.remove("drawer-open")
      }
    }
  
  
    const cartDrawer = document.getElementById("cart-drawer")
    const cartOverlay = cartDrawer?.querySelector(".cart-drawer__overlay")
    const cartCloseBtn = cartDrawer?.querySelector(".cart-drawer__close")
    const cartOpenBtn = document.querySelector(".header__icon--cart")
    const cartCountEl = document.querySelector(".header__cart-count")
    const cartItemsEl = document.getElementById("cart-items")
    const cartEmptyEl = document.getElementById("cart-empty")
    const cartFooterEl = document.getElementById("cart-footer")
    const cartSubtotalEl = document.getElementById("cart-subtotal")
    const continueShoppingBtn = cartDrawer?.querySelector(".cart-drawer__continue")
    const cartSearchBtn = cartDrawer?.querySelector(".cart-drawer__search-btn")
  
    let cart = []
  
    /**
     * Csak bejelentkezett felhasználónál töltünk / mentünk kosarat.
     * Vendégként a kosár működik, de újratöltéskor nem marad meg.
     */
    function loadCart() {
      cart = []

      const storageKey = getCartStorageKeyForUser(currentUser)
      if (!storageKey) {
        // Nincs bejelentkezett user – üres kosár indul, nem töltünk semmit
        updateCartUI()
        return
      }

      const savedCart = localStorage.getItem(storageKey)
      if (!savedCart) {
        updateCartUI()
        return
      }

      try {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          cart = parsed
        }
      } catch {
        // ha sérült az adat, üres kosárral indulunk
        cart = []
      }

      updateCartUI()
    }
  
  
    function saveCart() {
      const storageKey = getCartStorageKeyForUser(currentUser)
      if (!storageKey) {
        // Vendégként nem mentjük a kosarat tartósan
        return
      }
      localStorage.setItem(storageKey, JSON.stringify(cart))
    }
  
  
    function updateCartUI() {
      if (!cartCountEl || !cartItemsEl || !cartEmptyEl || !cartFooterEl || !cartSubtotalEl) return
  
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      cartCountEl.textContent = totalItems
  
      if (cart.length === 0) {
        cartEmptyEl.style.display = "flex"
        cartItemsEl.innerHTML = ""
        cartFooterEl.style.display = "none"
      } else {
        cartEmptyEl.style.display = "none"
        cartFooterEl.style.display = "block"
  
        cartItemsEl.innerHTML = cart
          .map(
            (item) => `
                  <li class="cart-item" data-product-id="${item.id}">
                      <img src="${item.image}" alt="${item.name}" class="cart-item__image">
                      <div class="cart-item__info">
                          <h4 class="cart-item__name">${item.name}</h4>
                          <span class="cart-item__price">$${item.price}</span>
                          <div class="cart-item__quantity">
                              <button class="cart-item__qty-btn" data-action="decrease" aria-label="Mennyiség csökkentése">−</button>
                              <span class="cart-item__qty-value">${item.quantity}</span>
                              <button class="cart-item__qty-btn" data-action="increase" aria-label="Mennyiség növelése">+</button>
                          </div>
                          <button class="cart-item__remove" data-action="remove">Eltávolítás</button>
                      </div>
                  </li>
              `,
          )
          .join("")
  
   
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        cartSubtotalEl.textContent = `$${subtotal}`
  
        attachCartItemEvents()
      }
    }
  
    function attachCartItemEvents() {
      if (!cartItemsEl) return
  
      const qtyBtns = cartItemsEl.querySelectorAll(".cart-item__qty-btn")
      const removeBtns = cartItemsEl.querySelectorAll(".cart-item__remove")
  
      qtyBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const cartItem = e.target.closest(".cart-item")
          const productId = cartItem.dataset.productId
          const action = e.target.dataset.action
  
          if (action === "increase") {
            updateItemQuantity(productId, 1)
          } else if (action === "decrease") {
            updateItemQuantity(productId, -1)
          }
        })
      })
  
      removeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const cartItem = e.target.closest(".cart-item")
          const productId = cartItem.dataset.productId
          removeFromCart(productId)
        })
      })
    }
  
    /**
     * @param {Object} product - A termék adatai
     */
    function addToCart(product) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const existingItem = cart.find((item) => item.id === product.id)
  
            if (existingItem) {
              existingItem.quantity += 1
            } else {
              cart.push({
                id: product.id,
                name: product.name,
                price: Number.parseInt(product.price), // Az akciós árat használjuk
                image: product.image,
                quantity: 1,
              })
            }
  
            saveCart()
            updateCartUI()
            resolve({ success: true, message: "Termék hozzáadva a kosárhoz" })
          } catch (error) {
            reject({ success: false, message: "Hiba a kosárba helyezés során" })
          }
        }, 100)
      })
    }
  
    function updateItemQuantity(productId, change) {
      const item = cart.find((i) => i.id === productId)
      if (item) {
        item.quantity += change
        if (item.quantity <= 0) {
          removeFromCart(productId)
        } else {
          saveCart()
          updateCartUI()
        }
      }
    }
  
    function removeFromCart(productId) {
      cart = cart.filter((item) => item.id !== productId)
      saveCart()
      updateCartUI()
    }
  
    function openCartDrawer() {
      if (!cartDrawer || !cartOpenBtn) return
      cartDrawer.setAttribute("aria-hidden", "false")
      cartOpenBtn.setAttribute("aria-expanded", "true")
      document.body.classList.add("drawer-open")
  
      setTimeout(() => {
        cartCloseBtn?.focus()
      }, 100)
    }
  
    function closeCartDrawer() {
      if (!cartDrawer || !cartOpenBtn) return
      cartDrawer.setAttribute("aria-hidden", "true")
      cartOpenBtn.setAttribute("aria-expanded", "false")
      document.body.classList.remove("drawer-open")
    }
  
    cartOpenBtn?.addEventListener("click", openCartDrawer)
    cartCloseBtn?.addEventListener("click", closeCartDrawer)
    cartOverlay?.addEventListener("click", closeCartDrawer)
    continueShoppingBtn?.addEventListener("click", closeCartDrawer)
  
    // Cart drawer-ből search modal megnyitás
    cartSearchBtn?.addEventListener("click", () => {
      closeCartDrawer()
      setTimeout(openSearchModal, 100)
    })
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && cartDrawer?.getAttribute("aria-hidden") === "false") {
        closeCartDrawer()
      }
    })
  
    loadCart()
  
    function initAddToCartButtons() {
      const addToCartBtns = document.querySelectorAll("[data-product-id]:not(.search-result)")
  
      addToCartBtns.forEach((btn) => {
        // Csak gombokra működjön
        if (btn.tagName !== "BUTTON") return
        // Ha már van eseménykezelő, ne adjunk újat
        if (btn.dataset.cartInit) return
        btn.dataset.cartInit = "true"
  
        btn.addEventListener("click", async (e) => {
          e.preventDefault()
  
          // Ellenőrizzük, hogy disabled-e a gomb
          if (btn.disabled || btn.getAttribute("aria-disabled") === "true") {
            return
          }
  
          const product = {
            id: btn.dataset.productId,
            name: btn.dataset.productName,
            price: btn.dataset.productPrice,
            image: btn.dataset.productImage,
          }
  
          try {
            const result = await addToCart(product)
            if (result.success) {
              showToast(result.message)
              openCartDrawer()
            }
          } catch (error) {
            showToast("Hiba a kosárba helyezés során", "error")
          }
        })
      })
    }
  
    initAddToCartButtons()
  
  
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toast-message")
    let toastTimeout
  
    function showToast(message, type = "success") {
      if (!toast || !toastMessage) return
  
      if (toastTimeout) {
        clearTimeout(toastTimeout)
      }
  
      toastMessage.textContent = message
  
      const toastContent = toast.querySelector(".toast__content")
      if (toastContent) {
        toastContent.style.backgroundColor = type === "error" ? "var(--color-error)" : "var(--color-success)"
      }
  
      toast.setAttribute("aria-hidden", "false")
  
      toastTimeout = setTimeout(() => {
        toast.setAttribute("aria-hidden", "true")
      }, 3000)
    }
  
  
    const searchModal = document.getElementById("search-modal")
    const searchOverlay = searchModal?.querySelector(".search-modal__overlay")
    const searchCloseBtn = searchModal?.querySelector(".search-modal__close")
    const searchInput = document.getElementById("search-input")
    const searchResults = document.getElementById("search-results")
    const searchEmpty = document.getElementById("search-empty")
    const searchOpenBtns = document.querySelectorAll(".header__icon--search")
  
    let focusableElements = []
    let firstFocusable = null
    let lastFocusable = null
  
    function openSearchModal() {
      if (!searchModal) return
      searchModal.setAttribute("aria-hidden", "false")
      document.body.classList.add("modal-open")
  
  
      focusableElements = searchModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable = focusableElements[0]
      lastFocusable = focusableElements[focusableElements.length - 1]
  
      setTimeout(() => {
        searchInput?.focus()
      }, 100)
  
      if (searchInput) searchInput.value = ""
      if (searchResults) searchResults.innerHTML = ""
      if (searchEmpty) searchEmpty.style.display = "block"
    }
  
    function closeSearchModal() {
      if (!searchModal) return
      searchModal.setAttribute("aria-hidden", "true")
      document.body.classList.remove("modal-open")
    }
  
  
    function handleSearchModalKeydown(e) {
      if (searchModal?.getAttribute("aria-hidden") === "true") return
  
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable?.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable?.focus()
          }
        }
      }
  
      if (e.key === "Escape") {
        closeSearchModal()
      }
    }
  
    searchOpenBtns.forEach((btn) => {
      btn.addEventListener("click", openSearchModal)
    })
  
    searchCloseBtn?.addEventListener("click", closeSearchModal)
    searchOverlay?.addEventListener("click", closeSearchModal)
    document.addEventListener("keydown", handleSearchModalKeydown)
  
  
    searchInput?.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim()
  
      if (query.length === 0) {
        if (searchResults) searchResults.innerHTML = ""
        if (searchEmpty) searchEmpty.style.display = "block"
        return
      }
  
  
      const results = dummyProducts.filter((product) => product.name.toLowerCase().includes(query))
  
      if (results.length === 0) {
        if (searchResults) searchResults.innerHTML = '<li class="search-result__none">Nincs találat</li>'
        if (searchEmpty) searchEmpty.style.display = "none"
      } else {
        if (searchEmpty) searchEmpty.style.display = "none"
        if (searchResults) {
          searchResults.innerHTML = results
            .map(
              (product) => `
            <li class="search-result">
              <a href="product.html#product-${product.id}" class="search-result__link" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="search-result__image">
                <div class="search-result__info">
                  <span class="search-result__title">${product.name}</span>
                  <span class="search-result__price">$${product.price}</span>
                </div>
              </a>
            </li>
          `,
            )
            .join("")
  
  
          const resultLinks = searchResults.querySelectorAll(".search-result__link")
          resultLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
              closeSearchModal()
              // Ha ugyanazon az oldalon vagyunk, smooth scroll
              const productId = link.dataset.productId
              const targetElement = document.getElementById(`product-${productId}`)
              if (targetElement) {
                e.preventDefault()
                targetElement.scrollIntoView({
                  behavior: prefersReducedMotion.matches ? "auto" : "smooth",
                  block: "start",
                })
              }
            })
          })
        }
      }
    })
  
  
    const countdownDays = document.getElementById("countdown-days")
    const countdownHours = document.getElementById("countdown-hours")
    const countdownMinutes = document.getElementById("countdown-minutes")
    const countdownSeconds = document.getElementById("countdown-seconds")
  
    // Target dátum: 7 nap a mai naptól
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)
  
  
    function updateCountdown() {
      const now = new Date()
      const diff = targetDate - now
  
      if (diff <= 0) {
        // ha lejart nullakat ir
        if (countdownDays) countdownDays.textContent = "00"
        if (countdownHours) countdownHours.textContent = "00"
        if (countdownMinutes) countdownMinutes.textContent = "00"
        if (countdownSeconds) countdownSeconds.textContent = "00"
        return
      }
  
  
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
   
      if (countdownDays) countdownDays.textContent = days.toString().padStart(2, "0")
      if (countdownHours) countdownHours.textContent = hours.toString().padStart(2, "0")
      if (countdownMinutes) countdownMinutes.textContent = minutes.toString().padStart(2, "0")
      if (countdownSeconds) countdownSeconds.textContent = seconds.toString().padStart(2, "0")
    }
  
    if (countdownDays && countdownHours && countdownMinutes && countdownSeconds) {
      updateCountdown()
      setInterval(updateCountdown, 1000)
    }
  
  
    const revealItems = document.querySelectorAll(".reveal-item")
  
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }
  
    const revealCallback = (entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = index * 100
          const actualDelay = prefersReducedMotion.matches ? 0 : delay
  
          setTimeout(() => {
            entry.target.classList.add("revealed")
          }, actualDelay)
  
          observer.unobserve(entry.target)
        }
      })
    }
  
    const revealObserver = new IntersectionObserver(revealCallback, observerOptions)
  
    revealItems.forEach((item) => {
      revealObserver.observe(item)
    })
  
    /**
     * ========================================
     * PRODUCT PAGE - GRID GENERÁLÁS
     * A product.html oldalon generálja a termék kártyákat
     * ========================================
     */
    const productsGrid = document.getElementById("products-grid")
  
    if (productsGrid) {
      /**
       * Termék kártya generálása
       * Discount badge számítása: compare_at_price - price
       */
      productsGrid.innerHTML = dummyProducts
        .map((product) => {
          // Megtakarítás számítása
          const discount = product.compareAtPrice ? product.compareAtPrice - product.price : 0
          const discountBadge =
            discount > 0 ? `<span class="product-card__badge product-card__badge--discount">-${discount}$</span>` : ""
  
          // Badge típus meghatározása
          let badge = ""
          if (product.badge === "sale") {
            badge = '<span class="product-card__badge product-card__badge--sale">AKCIÓ</span>'
          } else if (product.badge === "sold-out") {
            badge = '<span class="product-card__badge product-card__badge--sold-out">ELFOGYOTT</span>'
          } else if (product.badge === "custom") {
            badge = '<span class="product-card__badge product-card__badge--custom">BESTSELLER</span>'
          }
  
          // Ár megjelenítés
          let priceHTML = ""
          if (product.compareAtPrice) {
            priceHTML = `
            <span class="product-card__price--old">$${product.compareAtPrice}</span>
            <span class="product-card__price--current">$${product.price}</span>
          `
          } else {
            priceHTML = `<span class="product-card__price--current">$${product.price}</span>`
          }
  
          // Kosárba gomb (disabled ha elfogyott)
          const isOutOfStock = product.inventory === 0
          const addToCartBtn = isOutOfStock
            ? ""
            : `
            <button class="product-card__add-to-cart btn btn--secondary" 
              data-product-id="${product.id}" 
              data-product-name="${product.name}" 
              data-product-price="${product.price}" 
              ${product.compareAtPrice ? `data-product-compare-price="${product.compareAtPrice}"` : ""}
              data-product-image="${product.image}">
              <span class="btn__text">KOSÁRBA</span>
            </button>
          `
  
          return `
          <article class="product-card reveal-item" role="listitem">
            <a href="#product-${product.id}" class="product-card__link">
              <div class="product-card__image-wrapper">
                ${badge}
                ${discountBadge}
                <img src="${product.image}" alt="${product.name}" class="product-card__image">
                ${addToCartBtn}
              </div>
              <div class="product-card__info">
                <span class="product-card__vendor">Márka: ${product.vendor}</span>
                <h3 class="product-card__title">${product.name.toUpperCase()}</h3>
                <div class="product-card__rating" aria-label="${product.rating} csillagos értékelés">
                  <div class="stars" data-rating="${product.rating}"></div>
                  <span class="rating-value">(${product.rating.toFixed(1)})</span>
                </div>
                <div class="product-card__price">
                  ${priceHTML}
                </div>
              </div>
            </a>
          </article>
        `
        })
        .join("")
  
      // Újra inicializáljuk a csillagokat és a kosár gombokat
      initializeStars()
      initAddToCartButtons()
  
      // Újra inicializáljuk a reveal animációkat
      const newRevealItems = productsGrid.querySelectorAll(".reveal-item")
      newRevealItems.forEach((item) => {
        revealObserver.observe(item)
      })
  
      // Smooth scroll a termék részletekhez
      const productLinks = productsGrid.querySelectorAll(".product-card__link")
      productLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href")
          if (href && href.startsWith("#")) {
            const target = document.querySelector(href)
            if (target) {
              e.preventDefault()
              target.scrollIntoView({
                behavior: prefersReducedMotion.matches ? "auto" : "smooth",
                block: "start",
              })
            }
          }
        })
      })
    }
  
    /**
     * ========================================
     * NEWSLETTER FORM KEZELÉSE
     * ========================================
     */
    const newsletterForms = document.querySelectorAll(".newsletter-form")
  
    newsletterForms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
  
        const emailInput = form.querySelector('input[type="email"]')
        const email = emailInput?.value.trim()
  
        if (email) {
          showToast("Köszönjük a feliratkozást!")
          if (emailInput) emailInput.value = ""
        }
      })
    })
  
    /**
     * ========================================
     * SMOOTH SCROLL ANCHOR LINKEKHEZ
     * ========================================
     */
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
  
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href")
  
        if (href !== "#") {
          const target = document.querySelector(href)
  
          if (target) {
            e.preventDefault()
  
            if (cartDrawer?.getAttribute("aria-hidden") === "false") {
              closeCartDrawer()
            }
            if (mobileMenu?.getAttribute("aria-hidden") === "false") {
              closeMobileMenu()
            }
            if (searchModal?.getAttribute("aria-hidden") === "false") {
              closeSearchModal()
            }
  
            target.scrollIntoView({
              behavior: prefersReducedMotion.matches ? "auto" : "smooth",
              block: "start",
            })
          }
        }
      })
    })
  
    /**
     * ========================================
     * HASH ALAPÚ SCROLL (product.html megnyitáskor)
     * ========================================
     */
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash)
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: prefersReducedMotion.matches ? "auto" : "smooth",
            block: "start",
          })
        }, 100)
      }
    }
  
    /**
     * ========================================
     * HEADER SCROLL EFFEKT
     * ========================================
     */
    window.addEventListener("scroll", () => {
      const header = document.querySelector(".header")
      if (header) {
        if (window.scrollY > 100) {
          header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
        } else {
          header.style.boxShadow = "none"
        }
      }
    })
  
    /**
     * ========================================
     * PRODUCT DETAIL - THUMBNAIL VÁLTÁS
     * ========================================
     */
    const productDetails = document.querySelectorAll(".product-detail")
  
    productDetails.forEach((detail) => {
      const thumbnails = detail.querySelectorAll(".product-detail__thumb")
      const mainImage = detail.querySelector(".product-detail__image")
  
      thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          // Aktív osztály eltávolítása az összes thumbnailről
          thumbnails.forEach((t) => t.classList.remove("active"))
          // Aktív osztály hozzáadása a kattintotthoz
          thumb.classList.add("active")
          // Fő kép cseréje
          const newSrc = thumb.querySelector("img")?.src.replace("w=200&h=200", "w=800&h=800")
          if (mainImage && newSrc) {
            mainImage.src = newSrc
          }
        })
      })
    })

    /**
     * ========================================
     * AUTH PAGE - LOGIN / REGISTER LOGIKA
     * ========================================
     */
    const authPage = document.querySelector(".auth-page")

    if (authPage) {
      const authToggleButtons = document.querySelectorAll("[data-auth-toggle]")
      const loginForm = document.getElementById("auth-login")
      const registerForm = document.getElementById("auth-register")

      function setAuthMode(mode) {
        const isLogin = mode === "login"

        authToggleButtons.forEach((btn) => {
          const target = btn.getAttribute("data-auth-toggle")
          const isActive = target === mode
          btn.classList.toggle("is-active", isActive)
          btn.setAttribute("aria-selected", String(isActive))
        })

        if (loginForm && registerForm) {
          loginForm.classList.toggle("hidden", !isLogin)
          loginForm.setAttribute("aria-hidden", String(!isLogin))
          registerForm.classList.toggle("hidden", isLogin)
          registerForm.setAttribute("aria-hidden", String(isLogin))
        }
      }

      authToggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const mode = btn.getAttribute("data-auth-toggle") || "login"
          setAuthMode(mode)
        })
      })

      // Alapértelmezett mód: login
      setAuthMode("login")

      // Jelszó megjelenítés / elrejtés
      const passwordToggleButtons = document.querySelectorAll("[data-password-toggle]")

      passwordToggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetId = btn.getAttribute("data-password-toggle")
          if (!targetId) return

          const input = document.getElementById(targetId)
          if (!input) return

          const isPassword = input.getAttribute("type") === "password"
          input.setAttribute("type", isPassword ? "text" : "password")
          btn.setAttribute("aria-pressed", String(isPassword))

          const labelSpan = btn.querySelector(".auth-password-toggle__label")
          if (labelSpan) {
            labelSpan.textContent = isPassword ? "Elrejtés" : "Megjelenítés"
          }
        })
      })

      // Regisztráció logika – egyszerű demo, localStorage-ben tároljuk
      if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
          e.preventDefault()

          const nameInput = document.getElementById("register-name")
          const emailInput = document.getElementById("register-email")
          const passwordInput = document.getElementById("register-password")
          const passwordConfirmInput = document.getElementById("register-password-confirm")

          const name = nameInput?.value.trim() || ""
          const email = emailInput?.value.trim().toLowerCase() || ""
          const password = passwordInput?.value || ""
          const passwordConfirm = passwordConfirmInput?.value || ""

          if (!name || !email || !password || !passwordConfirm) {
            showToast("Kérjük, tölts ki minden mezőt.", "error")
            return
          }

          if (password.length < 8) {
            showToast("A jelszónak legalább 8 karakter hosszúnak kell lennie.", "error")
            return
          }

          if (password !== passwordConfirm) {
            showToast("A jelszavak nem egyeznek.", "error")
            return
          }

          const users = getStoredUsers()
          const alreadyExists = users.some((u) => u.email.toLowerCase() === email)
          if (alreadyExists) {
            showToast("Ezzel az email címmel már létezik fiók.", "error")
            return
          }

          const newUser = { name, email, password }
          users.push(newUser)
          saveStoredUsers(users)

          showToast("Sikeres regisztráció. Most jelentkezz be.", "success")

          // mezők ürítése
          if (passwordInput) passwordInput.value = ""
          if (passwordConfirmInput) passwordConfirmInput.value = ""

          // automatikus átváltás login fülre + email előtöltése
          setAuthMode("login")
          const loginEmailInput = document.getElementById("login-email")
          if (loginEmailInput) {
            loginEmailInput.value = email
          }
        })
      }

      // Bejelentkezés logika
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault()

          const emailInput = document.getElementById("login-email")
          const passwordInput = document.getElementById("login-password")

          const email = emailInput?.value.trim().toLowerCase() || ""
          const password = passwordInput?.value || ""

          if (!email || !password) {
            showToast("Kérjük, add meg az email címed és a jelszavad.", "error")
            return
          }

          const users = getStoredUsers()
          const user = users.find((u) => u.email.toLowerCase() === email)

          if (!user || user.password !== password) {
            showToast("Hibás email vagy jelszó.", "error")
            return
          }

          setCurrentUser(user)
          showToast("Sikeres bejelentkezés.", "success")

          // Rövid várakozás után vissza a főoldalra
          setTimeout(() => {
            window.location.href = "index.html"
          }, 800)
        })
      }

      // Elfelejtett jelszó gomb – egyelőre csak info üzenet
      const forgotButtons = authPage.querySelectorAll(".auth-link--muted")
      forgotButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          showToast("Az elfelejtett jelszó funkció hamarosan érkezik.", "success")
        })
      })
    }

    // Sikeres betöltés log
    console.log("Paul Rich e-commerce script sikeresen betöltve.")
  })