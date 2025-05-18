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

    this.initSlider();
  }

  initSlider() {
    this.flickityInstance = new Flickity(this.slider, {
      cellAlign: 'left',
      contain: true,
      pageDots: true,
      wrapAround: true,
      prevNextButtons: true,
      draggable: true
    });
  }

  disconnectedCallback() {
    if (this.flickityInstance) {
      this.flickityInstance.destroy();
    }
  }
}

customElements.define('video-slideshow', VideoSlideshow);
