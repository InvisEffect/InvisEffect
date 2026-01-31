class TypingEffect {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
        
        if (!this.element) {
            console.error('TypingEffect: Element not found');
            return;
        }
        
        this.text = options.text || this.element.textContent;
        this.speed = options.speed || 80;
        this.delay = options.delay || 0;
        this.loop = options.loop || false;
        this.cursor = options.cursor !== false;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.pauseEnd = options.pauseEnd || 2000;
        this.onComplete = options.onComplete || null;
        
        this.currentIndex = 0;
        this.isDeleting = false;
        this.textSpan = null;
        this.cursorSpan = null;
        
        this.init();
    }
    
    init() {
        this.element.innerHTML = '';
        this.element.style.display = 'inline-block';
        
        this.textSpan = document.createElement('span');
        this.textSpan.className = 'typing-text';
        this.textSpan.style.cssText = 'background: none; border: none;';
        this.element.appendChild(this.textSpan);
        
        if (this.cursor) {
            this.cursorSpan = document.createElement('span');
            this.cursorSpan.className = 'typing-cursor';
            this.cursorSpan.style.cssText = `
                display: inline-block;
                width: 2px;
                height: 1em;
                background: linear-gradient(180deg, #a347ff, #b366ff);
                margin-left: 3px;
                border-radius: 1px;
                animation: cursorBlink 1s ease-in-out infinite;
                vertical-align: text-bottom;
                box-shadow: 0 0 8px rgba(163, 71, 255, 0.35);
            `;
            this.element.appendChild(this.cursorSpan);
        }
        
        setTimeout(() => this.type(), this.delay);
    }
    
    type() {
        if (!this.isDeleting && this.currentIndex < this.text.length) {
            this.textSpan.textContent = this.text.substring(0, this.currentIndex + 1);
            this.currentIndex++;
            setTimeout(() => this.type(), this.speed);
            
        } else if (this.isDeleting && this.currentIndex > 0) {
            this.currentIndex--;
            this.textSpan.textContent = this.text.substring(0, this.currentIndex);
            setTimeout(() => this.type(), this.deleteSpeed);
            
        } else if (!this.isDeleting && this.currentIndex === this.text.length) {
            if (this.loop) {
                setTimeout(() => {
                    this.isDeleting = true;
                    this.type();
                }, this.pauseEnd);
            } else {
                if (this.onComplete) this.onComplete();
            }
            
        } else if (this.isDeleting && this.currentIndex === 0) {
            this.isDeleting = false;
            setTimeout(() => this.type(), this.speed);
        }
    }
    
    reset() {
        this.currentIndex = 0;
        this.isDeleting = false;
        if (this.textSpan) this.textSpan.textContent = '';
    }
    
    destroy() {
        if (this.element) {
            this.element.innerHTML = this.text;
        }
    }
}

// Add animation to document
if (!document.querySelector('#typing-cursor-animation')) {
    const style = document.createElement('style');
    style.id = 'typing-cursor-animation';
    style.textContent = `
        @keyframes cursorBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function typeText(selector, text, options = {}) {
    return new TypingEffect(selector, { ...options, text });
}