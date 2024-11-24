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

// Function to fetch AI response and set inner HTML of #limitations
async function fetchAIResponse() {
    try {
        const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.2-1b-instruct",
                messages: [
                    { role: "system", content: 
                        `Generate a 3 item list in an html format for a user, don't include the ol or ul, just the li, no css.
                        Only answer with the generated items.
                        Each item must be an extra drawing challenge that can be acomplished in combination with every other challenge on the list and gives bonus points (ex only use blue, draw a smiley face, don't use red, etc)
                        Each item must be less than 40 characters long
                        The user has received "SPORTS" as a theme
                        The user is using softeware akin to microsoft paint, so make sure your challenges make sense in that regard`
                    }, 
                ],
                temperature: 0.7,
                max_tokens: -1,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;
        document.getElementById('limitations').innerHTML = answer;
    } catch (error) {
        console.error('Error fetching AI response:', error);
    }
}

// Fetch the response when the page loads
document.addEventListener('DOMContentLoaded', fetchAIResponse);
