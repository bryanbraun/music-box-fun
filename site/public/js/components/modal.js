class Modal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
        }
        
        :host([open]) {
          display: block;
        }
        
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
        
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 4px;
          max-width: 90%;
          max-height: 90%;
          overflow: auto;
          z-index: 1001;
        }
        
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: none;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          z-index: 1002;
        }
        
        @media (max-width: 768px) {
          .modal {
            width: 95%;
            max-height: 80vh;
          }
        }
      </style>
      
      <div class="overlay" data-testid="modal-overlay">
        <div class="modal">
          <button class="close-button" data-testid="modal-close" aria-label="Close modal">×</button>
          <slot></slot>
        </div>
      </div>
    `;

    this.closeButton = this.shadowRoot.querySelector('[data-testid="modal-close"]');
    this.overlay = this.shadowRoot.querySelector('[data-testid="modal-overlay"]');
    
    this._handleClose = this._handleClose.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
  }
  
  connectedCallback() {
    this.closeButton.addEventListener('click', this._handleClose);
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this._handleClose();
      }
    });
    document.addEventListener('keydown', this._handleKeydown);
  }
  
  disconnectedCallback() {
    this.closeButton.removeEventListener('click', this._handleClose);
    this.overlay.removeEventListener('click', this._handleClose);
    document.removeEventListener('keydown', this._handleKeydown);
  }
  
  _handleClose() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('modal-close'));
  }
  
  _handleKeydown(e) {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      this._handleClose();
    }
  }
  
  open() {
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('modal-open'));
  }
}

export { Modal };