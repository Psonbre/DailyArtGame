export default class BucketTool {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
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
                this.fill(e.offsetX, e.offsetY, this.hexToRgb(this.currentColor));
            }
        });
    }

    fill(x, y, fillColor) {
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const stack = [[x, y]];
        const targetColor = this.getPixelColor(data, x, y);

        if (this.colorsMatch(targetColor, fillColor)) return;

        while (stack.length) {
            const [currX, currY] = stack.pop();
            const index = (currY * this.canvas.width + currX) * 4;

            if (this.colorsMatch(this.getPixelColor(data, currX, currY), targetColor)) {
                this.setPixelColor(data, index, fillColor);

                stack.push([currX + 1, currY]);
                stack.push([currX - 1, currY]);
                stack.push([currX, currY + 1]);
                stack.push([currX, currY - 1]);
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

    colorsMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
}
