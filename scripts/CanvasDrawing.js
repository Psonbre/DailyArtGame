export default class CanvasDrawing {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        // Set default canvas resolution
        this.canvas.width = 250;
        this.canvas.height = 250;

        this.currentColor = '#000000';
        this.penSize = 5; // Default pen size
        this.drawing = false; // Tracks drawing state
        this.isPenTool = true; // Tracks active tool

        this.setupEvents();
        this.updatePenPreview();
    }

    setupEvents() {

        document.getElementById('trash').addEventListener('click', () => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        })

        // Handle color changes
        document.querySelectorAll('input[name="color"]').forEach((radio) => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentColor = e.target.value;
                    this.updatePenPreview()
                }
            });
        });

        // Handle tool changes
        document.querySelectorAll('input[name="tool"]').forEach((radio) => {
            radio.addEventListener('change', (e) => {
                this.isPenTool = e.target.id === 'pen'; // Check if pen is active
            });
        });

        // Handle pen size changes
        const penSizeSlider = document.getElementById('penSize');
        penSizeSlider.addEventListener('input', (e) => {
            this.penSize = parseFloat(e.target.value);
            this.updatePenPreview();
        });

        // Mouse events for drawing
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    }

    startDrawing(e) {
        if (!this.isPenTool) return;
        this.drawing = true;
        this.draw(e); // Draw immediately
    }

    stopDrawing() {
        this.drawing = false;
        this.context.beginPath(); // Reset path
    }

    draw(e) {
        if (!this.drawing || !this.isPenTool) return;
    
        // Get the canvas's real rendered size
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width; // Scale from rendered size to internal resolution
        const scaleY = this.canvas.height / rect.height;
    
        // Map the mouse position to the canvas's internal resolution
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
    
        // Use the pen size directly (already in terms of the internal resolution)
        const radius = Math.floor(this.penSize);
    
        this.context.fillStyle = this.currentColor;
    
        // Draw the pixel-perfect circle
        this.drawCircle(x, y, radius);
    }
    
    drawCircle(cx, cy, radius) {
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y <= radius * radius) {
                    this.context.fillRect(cx + x, cy + y, 1, 1); // Draw sharp "pixels"
                }
            }
        }
    }
    
    updatePenPreview() {
        const previewCanvas = document.getElementById('penPreview');
        const previewContext = previewCanvas.getContext('2d');
    
        // Clear the preview canvas
        previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
        // Get the rendered (CSS) width of the drawing canvas
        const cssWidth = this.canvas.clientWidth;
    
        // Calculate the scaling factor from CSS to internal resolution
        const cssToInternalScale = cssWidth / this.canvas.width;

        // Calculate the preview radius
        const previewRadius = this.penSize * cssToInternalScale;
    
        previewContext.fillStyle = this.currentColor;
    
        // Center of the preview canvas
        const centerX = previewCanvas.width / 2;
        const centerY = previewCanvas.height / 2;
    
        // Draw the preview circle
        for (let y = -previewRadius; y <= previewRadius; y++) {
            for (let x = -previewRadius; x <= previewRadius; x++) {
                if (x * x + y * y <= previewRadius * previewRadius) {
                    previewContext.fillRect(centerX + x, centerY + y, 1, 1);
                }
            }
        }
    }
}
