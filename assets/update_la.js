class FAQDropdown extends HTMLElement {
  constructor() {
    super();
    this.trigger = this.querySelector('.collapsible-trigger');
    this.content = this.querySelector('.collapsible-content');
    this.innerContent = this.querySelector('.collapsible-content__inner');
    this.isOpen = false;
  }

  connectedCallback() {
    if (this.trigger && this.content && this.innerContent) {
      this.trigger.addEventListener('click', this.toggleDropdown.bind(this));
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;

    this.trigger.classList.toggle('is-open', this.isOpen);
    this.content.classList.toggle('is-open', this.isOpen);
    this.trigger.setAttribute('aria-expanded', this.isOpen);

    if (this.isOpen) {
      const contentHeight = this.innerContent.offsetHeight;
      this.content.style.height = `${contentHeight}px`;
    } else {
      this.content.style.height = '0px';
    }
  }
}

customElements.define('faq-dropdown', FAQDropdown);


class VideoSlideshow extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('.video-slider');
    this.slides = this.querySelectorAll('.video-slide');
    this.flickityInstance = null;
  }

  connectedCallback() {
    if (!this.slider || this.slides.length === 0) return;

      const totalSlideWidth = this.slides.length * 238;
      const containerWidth = this.slider.offsetWidth;

      if (totalSlideWidth <= containerWidth) {
        // Center slides with CSS only
        this.slider.classList.add('no-slider');
        this.slides.forEach(slide => {
          slide.style.width = `238px`;
        });
      } else {
        this.initSlider();
      }

      this.handleResize = this.handleResize.bind(this);
      window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
  if (this.flickityInstance) {
    this.flickityInstance.destroy();
  }
  window.removeEventListener('resize', this.handleResize);
}

  handleResize() {
  const totalSlideWidth = this.slides.length * 238;
  const containerWidth = this.slider.offsetWidth;

  if (this.flickityInstance && totalSlideWidth <= containerWidth) {
    this.flickityInstance.destroy();
    this.flickityInstance = null;
    this.slider.classList.add('no-slider');
  } else if (!this.flickityInstance && totalSlideWidth > containerWidth) {
    this.slider.classList.remove('no-slider');
    this.initSlider();
  }
}


  initSlider() {
      const slideWidth = 238;

    this.slides.forEach(slide => {
      slide.style.width = `${slideWidth}px`;
    });
    this.flickityInstance = new Flickity(this.slider, {
        cellAlign: 'center',
        contain: true,
        pageDots: true,
        wrapAround: true,
        prevNextButtons: true,
        axis: 'x',
        draggable: true, // 👈 disables dragging completely
        dragThreshold: 10, // extra-safe
       adaptiveHeight: false // 👈 This is key
      });


      this.flickityInstance.on('select', () => {
      this.updateActiveSlide();
    });

      // Prevent Flickity drag when clicking on videos or iframes
    const viewport = this.slider.querySelector('.flickity-viewport');

    if (viewport) {
      viewport.addEventListener('mousedown', this.pauseDragOnInteractive.bind(this), true);
      viewport.addEventListener('touchstart', this.pauseDragOnInteractive.bind(this), true);
    }
   
  }

  updateActiveSlide() {
  this.slides.forEach((slide, index) => {
    if (index === this.flickityInstance.selectedIndex) {
      slide.classList.add('is-selected');
    } else {
      slide.classList.remove('is-selected');
    }
  });
}

   pauseDragOnInteractive(event) {
    const target = event.target;

  if (target.tagName === 'IFRAME' || target.tagName === 'VIDEO') {
    if (this.flickityInstance) {
      this.flickityInstance.options.draggable = false;

      setTimeout(() => {
        this.flickityInstance.options.draggable = true;
      }, 500);
    }
  }
  }

  disconnectedCallback() {
    if (this.flickityInstance) {
      this.flickityInstance.destroy();
    }
  }
}

customElements.define('video-slideshow', VideoSlideshow);


 class QuickAtc extends HTMLElement {
    constructor() {
      super();
      this.handle = this.dataset.productHandle;
    }

    connectedCallback() {
      fetch(`/products/${this.handle}.js`)
        .then(r => r.json())
        .then(product => {
          this.product = product;
          this.cacheEls();

          // Pick a default for each option if none is checked
          this.initDefaultSelection();

          // Initial render
          this.onVariantChange();

          // Recompute on each radio-click
          this.variantInputs.forEach(i =>
            i.addEventListener('change', () => this.onVariantChange())
          );

          // Hook up AJAX + side-cart
          this.productForm = new theme.AjaxProduct(
            this.querySelector('form'),
            '[data-add-to-cart]',
            { scopedEventId: 'quick-atc' }
          );
          document.addEventListener(
            'ajaxProduct:added:quick-atc',
            this.onAddedToCart.bind(this)
          );
        });
    }

    cacheEls() {
      this.variantInputs    = Array.from(this.querySelectorAll('input[data-variant-input]'));
      this.addToCartBtn     = this.querySelector('button[data-add-to-cart]');
      this.btnTextSpan      = this.addToCartBtn.querySelector('[data-add-to-cart-text]');
      this.defaultText      = this.btnTextSpan.dataset.defaultText;
      this.selectEl         = this.querySelector('select[data-product-select]');

      // price elements
      this.priceWrapper     = this.querySelector('[data-product-price-wrap]');
      this.priceEl          = this.querySelector('[data-product-price]');
      this.compareEl        = this.querySelector('[data-compare-price]');
      this.priceA11y        = this.querySelector('[data-a11y-price]');
      this.compareA11y      = this.querySelector('[data-compare-price-a11y]');
    }

    initDefaultSelection() {
      const optionCount = this.product.options.length;
      for (let idx = 1; idx <= optionCount; idx++) {
        const group = this.variantInputs.filter(i => i.dataset.index === `option${idx}`);
        if (!group.some(i => i.checked)) {
          const defaultVal = this.product.variants[0][`option${idx}`];
          const pick = group.find(i => i.value === defaultVal);
          if (pick) pick.checked = true;
        }
      }
    }

    onVariantChange() {
      // 1) Find the “current” variant from the radios
      const selections = this.variantInputs
        .filter(i => i.checked)
        .reduce((acc, i) => {
          const idx = Number(i.dataset.index.replace('option','')) - 1;
          acc[idx] = i.value;
          return acc;
        }, []);

      const variant = this.product.variants.find(v =>
        selections.every((sel, j) => v[`option${j+1}`] === sel)
      );

      // 2) Update price exactly like theme.updatePrice
      if (variant) this.updatePrice(variant);

      // 3) Sync hidden <select> for AJAX
      if (variant) this.selectEl.value = variant.id;

      // 4) Update button exactly like theme.updateCartButton
      if (variant) {
        if (variant.available) {
          this.addToCartBtn.classList.remove('disabled');
          this.addToCartBtn.disabled = false;
          this.btnTextSpan.textContent = this.defaultText;
        } else {
          this.addToCartBtn.classList.add('disabled');
          this.addToCartBtn.disabled = true;
          this.btnTextSpan.textContent = theme.strings.soldOut;
        }
      } else {
        // no matching variant
        this.addToCartBtn.classList.add('disabled');
        this.addToCartBtn.disabled = true;
        this.btnTextSpan.textContent = theme.strings.unavailable;
      }

      // 5) Now re–compute which labels should be “disabled”
      this.updateDynamicLabels(selections);
    }

    updatePrice(v) {
      this.priceEl.innerHTML = theme.Currency.formatMoney(v.price, theme.settings.moneyFormat);
      if (v.compare_at_price > v.price) {
        this.compareEl.innerHTML = theme.Currency.formatMoney(v.compare_at_price, theme.settings.moneyFormat);
        this.priceWrapper.classList.remove('hide');
        this.priceEl.classList.add('sale-price');
        this.compareA11y.setAttribute('aria-hidden','false');
        this.priceA11y.setAttribute('aria-hidden','false');
      } else {
        this.priceWrapper.classList.add('hide');
        this.priceEl.classList.remove('sale-price');
        this.compareA11y.setAttribute('aria-hidden','true');
        this.priceA11y.setAttribute('aria-hidden','true');
      }
    }

    updateDynamicLabels(selections) {
      const optionCount = this.product.options.length;

      this.variantInputs.forEach(inp => {
        const idx = Number(inp.dataset.index.replace('option','')) - 1;
        const val = inp.value;
        // Find all variants that match this value and your other selections
        let candidates = this.product.variants.filter(v => v[`option${idx+1}`] === val);
        candidates = candidates.filter(v =>
          selections.every((sel, j) => j === idx || v[`option${j+1}`] === sel)
        );
        const anyAvailable = candidates.some(v => v.available);
        const lbl = this.querySelector(`label[for="${inp.id}"]`);
        if (anyAvailable) lbl.classList.remove('disabled');
        else             lbl.classList.add('disabled');
      });
    }

    onAddedToCart() {
      const drawer = document.querySelector('#SideCartDrawer') ||
                     document.querySelector('.sidecart-drawer');
      if (drawer) drawer.classList.add('is-open');
    }
  }

  customElements.define('quick-atc', QuickAtc);


// assets/shipping-bar.js
// Web Component: single track with two markers and dynamic text update

class ShippingBar extends HTMLElement {
  constructor() {
    super();
    this._onCartUpdated = this._onCartUpdated.bind(this);
  }

  connectedCallback() {
       document.addEventListener('cart:updated', this._onCartUpdated);
        document.addEventListener('cart:build', () => this._fetchAndUpdate());

            // 3) Grab elements if they already exist (on reload)
    this._grabElements();
    if (this.track) {
      this._fetchAndUpdate();
    }
  }

  disconnectedCallback() {
    document.removeEventListener('cart:updated', this._onCartUpdated);
    document.removeEventListener('cart:build', this._onCartUpdated);
  }

    _grabElements() {
    this.track    = this.querySelector('.shipping-progress-track');
    this.fill     = this.querySelector('.shipping-progress-fill');
    this.freeIcon = this.querySelector('.shipping-progress-icon--free');
    this.saleIcon = this.querySelector('.shipping-progress-icon--sale');
    this.textEl   = this.querySelector('.cart-drawer__shipping-text');

    if (this.track) {
      this.freeLimit = parseInt(this.getAttribute('free-limit'), 10)
                     || parseInt(this.track.dataset.freeLimit, 10);
      this.saleLimit = parseInt(this.getAttribute('sale-limit'), 10)
                     || parseInt(this.track.dataset.saleLimit, 10);
    }
  }

  _onCartUpdated(evt) {
     // ensure our elements are grabbed at least once
    if (!this.track) this._grabElements();
    if (evt.detail && evt.detail.cart) {
      this._updateProgress(evt.detail.cart);
    } else {
      this._fetchAndUpdate();
    }
  }

  _fetchAndUpdate() {
   if (!this.track) return;
    fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(r => r.json())
      .then(cart => this._updateProgress(cart))
      .catch(console.error);
  }

  _updateProgress(cart) {
    const total = cart.total_price;

    // Update fill width towards sale limit
    const fillPct = Math.min((total / this.saleLimit) * 100, 100);
    if (this.fill) this.fill.style.width = fillPct + '%';

    // Position free-limit marker
    const freePct = Math.min((this.freeLimit / this.saleLimit) * 100, 100);
    if (this.freeIcon) this.freeIcon.style.left = freePct + '%';
    if (this.saleIcon) this.saleIcon.style.left = '100%';

    // Update text based on freeLimit
    if (this.textEl) {
      const leftToFree = Math.max(this.freeLimit - total, 0);
     if (total < this.freeLimit) {
  // format the remaining money as a string
  const leftToFree = Math.max(this.freeLimit - total, 0);
  const money = theme.Currency
    ? theme.Currency.formatMoney(leftToFree, theme.settings.moneyFormat)
    : `$${(leftToFree/100).toFixed(2)}`;

      // pluck the translation and replace the placeholder
      this.textEl.textContent = theme.strings.cartGeneralFreeShippingLeft
        .replace('[left_money]', money);
    } else {
      this.textEl.textContent = theme.strings.cartGeneralFreeShipping;
    }
    }

     // 🔔 PULSE LOGIC
  if (total >= this.freeLimit) {
    this.freeIcon.classList.add('pulse');
  } else {
    this.freeIcon.classList.remove('pulse');
  }

  if (total >= this.saleLimit) {
    this.saleIcon.classList.add('pulse');
  } else {
    this.saleIcon.classList.remove('pulse');
  }
  }
}

customElements.define('shipping-bar', ShippingBar);


// assets/donation-info.js
class DonationInfo extends HTMLElement {
  constructor() {
    super();
    this._onCartChange = this._onCartChange.bind(this);
  }

  connectedCallback() {
    // read the pct from an attribute, injected via Liquid
    this.pct = parseFloat(this.getAttribute('pct')) || 0;
    // grab our text container
    this.textEl = this.querySelector('.human-action-info__text');
    // wire up both events
    document.addEventListener('cart:build', this._onCartChange);
    document.addEventListener('cart:updated', this._onCartChange);
    // if the drawer is already open with items, force an initial compute
    this._onCartChange();
  }

  disconnectedCallback() {
    document.removeEventListener('cart:build', this._onCartChange);
    document.removeEventListener('cart:updated', this._onCartChange);
  }

  _onCartChange(evt) {
    // prefer the JSON payload if available
    const cart = (evt && evt.detail && evt.detail.cart)
      ? evt.detail.cart
      : null;

    // either use the passed-in cart, or fetch fresh
    if (cart) {
      this._update(cart);
    } else {
      fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(c => this._update(c))
        .catch(console.error);
    }
  }

  _update(cart) {
    const total   = cart.total_price;               // in cents
    const cents   = Math.floor(total * this.pct / 100);
    const money   = (window.theme && theme.Currency)
      ? theme.Currency.formatMoney(cents, theme.settings.moneyFormat)
      : `$${(cents/100).toFixed(2)}`;

    // get the translation template string you set up in theme.strings
    const tpl     = theme.strings.cartGeneralHumanitarianInfo;
    const text    = tpl.replace('[amount]', money);

    if (this.textEl) this.textEl.textContent = text;
  }
}

customElements.define('donation-info', DonationInfo);
