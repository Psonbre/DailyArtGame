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

// Predefined list of themes
const themes = ['SPORTS', 'NATURE', 'SPACE', 'CITY LIFE', 'UNDERWATER', 'HEROES', 'FANTASY'];

// Function to determine the theme based on the current date
function getDailyTheme() {
    const date = new Date();
    const dayOfYear = Math.floor(
        (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
    );
    const randomIndex = dayOfYear % themes.length;
    return themes[randomIndex];
}

// Set the theme
const dailyTheme = getDailyTheme();
document.getElementById('theme').textContent = dailyTheme;


var a = "Bearer sk-"
var b = "proj-juEPZ--LUldL2fH0J6febncipqOScJ9h29iUDAVyGoUwPNJ0k8YS7g80j"
var c = "CtlMwsW5bPqry3bFsT3BlbkFJD1KZTy66Mvt_5dHPX0PNgvv0Yz03d7I"
var d = "iW9I7iXBFtdazyDLJvG4_pN6TNli0yTF_R8Lnwp770A"

// Function to fetch AI response and set inner HTML of #limitations
async function fetchAIResponse(theme) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': a + b + c + d // Replace with your actual OpenAI API key
            },
            body: JSON.stringify({
                model: "gpt-4", // Use the desired model
                messages: [
                    { 
                        role: "system", 
                        content: 
                            `Generate a 3-item list in HTML format containing '<li>' entries only. Do not include '<ol>' or '<ul>', and do not use CSS.

                            - Each item should be an extra drawing challenge that can be combined with every other challenge on the list and provides bonus points.
                            - Example challenges: "only use blue," "draw a smiley face," "don’t use red," etc.
                            - Each item must be fewer than 40 characters. 
                            - The theme is "${theme}".
                            - Design challenges keeping in mind the user is using drawing software akin to a very barebones (bucket and pen only) Microsoft Paint.

                            Only answer with the generated '<li>' items.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 50 // Limit token usage to keep responses concise
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

// Fetch the response with the daily theme when the page loads
document.addEventListener('DOMContentLoaded', () => fetchAIResponse(dailyTheme));
