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
