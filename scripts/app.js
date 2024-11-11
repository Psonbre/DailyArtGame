import CanvasDrawing from './CanvasDrawing.js';
import BucketTool from './BucketTool.js';

const canvas = document.getElementById('drawCanvas');

const canvasDrawing = new CanvasDrawing(canvas);
const bucketTool = new BucketTool(canvas);

document.querySelectorAll('.colorButton').forEach(button => {
    button.addEventListener('click', () => {
        const color = button.getAttribute('data-color');
        colorSelect.value = color;
        canvasDrawing.currentColor = color;
        bucketTool.currentColor = color;
    });
});
