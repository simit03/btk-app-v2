/**
 * Drawing Tool - Kalem Tool JavaScript
 * Quiz sayfasında çizim yapabilmek için kullanılan tool
 */

class DrawingTool {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.isActive = false;
        this.currentColor = '#FF0000';
        this.brushSize = 5;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.setupControls();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // ESC key to exit
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.toggleDrawing();
            }
        });
        
        // Window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
    
    setupControls() {
        const penBtn = document.getElementById('penToolBtn');
        const controls = document.getElementById('drawingControls');
        const colorPicker = document.getElementById('colorPicker');
        const brushSize = document.getElementById('brushSize');
        const clearBtn = document.getElementById('clearCanvas');
        
        if (!penBtn || !controls || !colorPicker || !brushSize || !clearBtn) {
            console.error('Drawing tool elements not found');
            return;
        }
        
        penBtn.addEventListener('click', () => this.toggleDrawing());
        
        colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });
        
        brushSize.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
        });
        
        clearBtn.addEventListener('click', () => this.clearCanvas());
        
        // Color picker buttons
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
                colorPicker.value = e.target.value;
            });
        });
    }
    
    toggleDrawing() {
        this.isActive = !this.isActive;
        const penBtn = document.getElementById('penToolBtn');
        const controls = document.getElementById('drawingControls');
        
        if (this.isActive) {
            this.canvas.classList.add('active');
            penBtn.classList.add('active');
            controls.classList.add('active');
            document.body.classList.add('drawing-active');
            penBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>';
        } else {
            this.canvas.classList.remove('active');
            penBtn.classList.remove('active');
            controls.classList.remove('active');
            document.body.classList.remove('drawing-active');
            penBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>';
        }
    }
    
    startDrawing(e) {
        if (!this.isActive) return;
        this.isDrawing = true;
        this.draw(e);
    }
    
    draw(e) {
        if (!this.isActive || !this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = this.currentColor;
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }
    
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize drawing tool when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DrawingTool();
}); 