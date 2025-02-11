export class Modal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.setupEventListeners();
  }

  static get observedAttributes() {
    return ['open'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      this.render();
    }
  }

  setupEventListeners() {
    // Close when clicking outside the modal
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target === this.shadowRoot.querySelector('.modal-overlay')) {
        this.close();
      }
    });

    // Close when clicking the close button
    this.shadowRoot.querySelector('.modal-close').addEventListener('click', () => {
      this.close();
    });
  }

  open() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

  render() {
    const isOpen = this.hasAttribute('open');
    const styles = `
      :host {
        display: ${isOpen ? 'block' : 'none'};
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: var(--z-modal-overlay);
      }

      .modal-content {
        background: var(--color-white);
        padding: 2rem;
        border-radius: 4px;
        position: relative;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        border: none;
        background: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        color: var(--color-gray-dark);
      }

      .modal-close:hover {
        color: var(--color-black);
      }

      @media (max-width: 768px) {
        .modal-content {
          width: 95%;
          margin: 1rem;
        }
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">×</button>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('music-box-modal', Modal); 