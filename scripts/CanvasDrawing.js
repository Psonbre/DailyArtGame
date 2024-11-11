export default class CanvasDrawing {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.currentColor = '#000000';
        this.drawing = false;
        this.setupEvents();
    }

    setupEvents() {
        document.querySelectorAll('input[name="color"]').forEach((radio) => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentColor = e.target.value;
                }
            });
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.drawing = true;
            this.context.beginPath();
            this.context.moveTo(e.offsetX, e.offsetY);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.drawing = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    }

    draw(e) {
        if (!this.drawing) return;
        this.context.lineWidth = 5;
        this.context.lineCap = 'round';
        this.context.strokeStyle = this.currentColor;
        this.context.lineTo(e.offsetX, e.offsetY);
        this.context.stroke();
    }
}
