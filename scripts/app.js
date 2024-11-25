import CanvasDrawing from './CanvasDrawing.js';
import BucketTool from './BucketTool.js';
import themes from './themes.js'; // Import themes

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

// Function to set a cookie with an expiration date
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// Function to get a cookie by name
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}


var a = "Bearer sk-"
var b = "proj-juEPZ--LUldL2fH0J6febncipqOScJ9h29iUDAVyGoUwPNJ0k8YS7g80j"
var c = "CtlMwsW5bPqry3bFsT3BlbkFJD1KZTy66Mvt_5dHPX0PNgvv0Yz03d7I"
var d = "iW9I7iXBFtdazyDLJvG4_pN6TNli0yTF_R8Lnwp770A"

// Function to fetch AI response or retrieve from localStorage
async function fetchAIResponse(theme) {
    const bonusesKey = `bonuses_${theme}`; // Unique key for the theme's bonuses

    // Check localStorage for existing bonuses
    const savedBonuses = localStorage.getItem(bonusesKey);

    if (savedBonuses) {
        console.log('Using saved bonuses from localStorage');
        document.getElementById('limitations').innerHTML = savedBonuses;
        return;
    }

    console.log('Fetching new bonuses');
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': a + b + c + d // Replace with your actual OpenAI API key
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Use the desired model
                messages: [
                    { 
                        role: "system", 
                        content: 
                            `Generate a 3-item list in HTML format containing '<li>' entries only. Do not include '<ol>' or '<ul>', and do not use CSS.

                            - Each item should be an extra drawing challenge that can be combined with every other challenge on the list and provides bonus points.
                            - Example challenges: "only use blue," "draw a smiley face," "don’t use red," etc.
                            - The challenges must be possible to evaluate based on the drawing only (so no "draw with your left hand" since that's impossible to verify)
                            - Each item must be fewer than 40 characters. 
                            - The theme is "${theme}".
                            - Design challenges keeping in mind the user is using drawing software akin to a very barebones Microsoft Paint.

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

        // Save the new bonuses in localStorage
        localStorage.setItem(bonusesKey, answer);

        // Update the limitations section with the new bonuses
        document.getElementById('limitations').innerHTML = answer;
    } catch (error) {
        console.error('Error fetching AI response:', error);
    }
}

function cleanUpLocalStorage() {
    const currentThemes = themes.map(theme => `bonuses_${theme}`);
    Object.keys(localStorage).forEach(key => {
        if (!currentThemes.includes(key)) {
            localStorage.removeItem(key);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const dailyTheme = getDailyTheme(); // Get the theme based on the date
    document.getElementById('theme').textContent = dailyTheme;
    fetchAIResponse(dailyTheme); // Fetch or retrieve bonuses for the theme
    cleanUpLocalStorage();
});

