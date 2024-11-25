export default class BucketTool {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d', { willReadFrequently: true });
        this.isBucketTool = false;
        this.currentColor = '#000000';
        this.setupEvents();
    }

    setupEvents() {
        // Update current color when a color radio button is selected
        document.querySelectorAll('input[name="color"]').forEach((radio) => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentColor = e.target.value;
                }
            });
        });

        // Set the tool type based on the selected tool radio button
        document.querySelectorAll('input[name="tool"]').forEach((radio) => {
            radio.addEventListener('change', (e) => {
                this.isBucketTool = e.target.id === 'bucket';
            });
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isBucketTool) {
                // Map mouse coordinates to canvas resolution
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;

                const x = Math.floor((e.clientX - rect.left) * scaleX);
                const y = Math.floor((e.clientY - rect.top) * scaleY);

                this.fill(x, y, this.hexToRgb(this.currentColor));
            }
        });
    }

    fill(x, y, fillColor) {
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        const startColor = this.getPixelColor(data, x, y);

        if (this.colorsMatch(startColor, [...fillColor, 255])) {
            return; // Avoid infinite loop if the color is already the same
        }

        const stack = [[x, y]];
        const width = this.canvas.width;
        const height = this.canvas.height;
        const tolerance = 50; // Adjust this value as needed

        while (stack.length > 0) {
            const [currentX, currentY] = stack.pop();

            const currentIndex = (currentY * width + currentX) * 4;

            if (this.colorsMatch(this.getPixelColor(data, currentX, currentY), startColor, tolerance)) {
                this.setPixelColor(data, currentIndex, fillColor);

                // Add all 8 neighbors to the stack
                if (currentX > 0) stack.push([currentX - 1, currentY]); // Left
                if (currentX < width - 1) stack.push([currentX + 1, currentY]); // Right
                if (currentY > 0) stack.push([currentX, currentY - 1]); // Top
                if (currentY < height - 1) stack.push([currentX, currentY + 1]); // Bottom

                if (currentX > 0 && currentY > 0) stack.push([currentX - 1, currentY - 1]); // Top-left
                if (currentX < width - 1 && currentY > 0) stack.push([currentX + 1, currentY - 1]); // Top-right
                if (currentX > 0 && currentY < height - 1) stack.push([currentX - 1, currentY + 1]); // Bottom-left
                if (currentX < width - 1 && currentY < height - 1) stack.push([currentX + 1, currentY + 1]); // Bottom-right
            }
        }

        this.context.putImageData(imageData, 0, 0);
    }

    getPixelColor(data, x, y) {
        const index = (y * this.canvas.width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    }

    setPixelColor(data, index, color) {
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = 255;
    }

    colorsMatch(a, b, tolerance = 50) {
        return (
            Math.abs(a[0] - b[0]) <= tolerance &&
            Math.abs(a[1] - b[1]) <= tolerance &&
            Math.abs(a[2] - b[2]) <= tolerance &&
            Math.abs(a[3] - b[3]) <= tolerance
        );
    }

    hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
}
