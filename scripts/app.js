import CanvasDrawing from './CanvasDrawing.js';
import BucketTool from './BucketTool.js';
import getDailyTheme from './themes.js'; // Import themes

var a = "Bearer sk-"
var b = "proj-juEPZ--LUldL2fH0J6febncipqOScJ9h29iUDAVyGoUwPNJ0k8YS7g80j"
var c = "CtlMwsW5bPqry3bFsT3BlbkFJD1KZTy66Mvt_5dHPX0PNgvv0Yz03d7I"
var d = "iW9I7iXBFtdazyDLJvG4_pN6TNli0yTF_R8Lnwp770A"

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

                            - Each item should be an extra drawing challenge that could provides bonus points.
                            - Example challenges: "make it romantic" "include a smiley face," "don’t use red," etc.
                            - The challenges must be possible to evaluate based on the drawing only (so no "draw with your left hand" since that's impossible to verify)
                            - Each item must be fewer than 100 characters. 
                            - The theme is "${theme}".
                            - Design challenges keeping in mind the user is using a very barebones version of Microsoft Paint.

                            Only answer with the generated '<li>' items.`
                    }
                ],
                temperature: 1.3,
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
    const currentTheme = `bonuses_${getDailyTheme()}`;
    const currentDrawing = `canvasDrawing_${getDailyTheme()}`;
    const currentFeedback = `feedback_${getDailyTheme()}`;
    const currentRating = `rating_${getDailyTheme()}`;
    Object.keys(localStorage).forEach(key => {
        if (currentTheme != key && currentDrawing != key && currentFeedback != key && currentRating != key) {
            localStorage.removeItem(key);
        }
    });
}


document.getElementById('submit').addEventListener('click', async () => {
    const canvas = document.getElementById('drawCanvas');
    const dataUrl = localStorage.getItem(`canvasDrawing_${getDailyTheme()}`)
    if (!dataUrl) return
    const base64Image = dataUrl.split(',')[1]; // Get Base64 string without prefix
    const theme = getDailyTheme()
    const bonusesKey = `bonuses_${theme}`

    document.getElementById("drawingSpace").style = "display : none"
    document.getElementById("loading").style = "display : block"
    document.getElementById("finalImage").src = dataUrl
    const feedback = await analyzeImage(base64Image, theme, localStorage.getItem(bonusesKey)); // Call the function to analyze the image
    document.getElementById("loading").style = "display : none"
    document.getElementById("feedback").style = "display : block"
    document.getElementById("rating").textContent = feedback.rating +"/10"
    document.getElementById("textFeedback").textContent = "\"" + feedback.feedback +"\"- AI"
    localStorage.setItem("feedback_"+getDailyTheme(), feedback.feedback)
    localStorage.setItem("rating_"+getDailyTheme(), feedback.rating)
});


document.getElementById('share').addEventListener('click', () => {
    const content = document.getElementById('body');
    document.getElementById('share').style = "display : none"
    html2canvas(content).then((canvas) => {
        // Convert the canvas to a data URL
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png'); // Image format
        link.download = 'Masterpiece.png'; // File name
        link.click(); // Trigger the download
    }).catch((err) => {
        console.error('Failed to capture screenshot:', err);
    });
    document.getElementById('share').style = "display : flex"
});


async function analyzeImage(base64Image, theme, bonuses) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': a + b + c + d, // Replace with your actual API key
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Adjust model as needed
                messages: [
                    {
                        role: "system",
                        content: [
                            { type: "text", text: `You are an art critic evaluating digital drawings based on a given theme and bonuses. Provide feedback as JSON with the following structure:
                            {
                                "rating": <decimal between 0.0 and 11.0, you can ignore these limits if you deem it appropriate>,
                                "feedback": <string summarizing strengths and weaknesses in relation to the theme and bonuses. Always a single line>
                            }` }
                        ]
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `
                                Evaluate the following image for its alignment with the theme "${theme}" and the bonuses "${bonuses}". 
                                Respond only with the JSON feedback, and do not include any additional text or formatting.
                                If the image you receive is innapropriate or imature, roast the artist based on their childish drawing.
                            ` },
                            { 
                                type: "image_url", 
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`,
                                    detail: "low"
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.choices[0].message.content);

        // Parse the JSON response to display or handle the feedback
        const feedback = JSON.parse(data.choices[0].message.content);
        return feedback

    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Failed to analyze the image. Check the console for more details.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const dailyTheme = getDailyTheme(); // Get the theme based on the date
    document.getElementById('theme').textContent = dailyTheme;
    fetchAIResponse(dailyTheme); // Fetch or retrieve bonuses for the theme
    cleanUpLocalStorage();
    const feedback = localStorage.getItem("feedback_"+getDailyTheme())
    const rating = localStorage.getItem("rating_"+getDailyTheme())
    const dataUrl = localStorage.getItem(`canvasDrawing_${getDailyTheme()}`)

    if (feedback && rating && dataUrl){
        document.getElementById("finalImage").src = dataUrl
        document.getElementById("loading").style = "display : none"
        document.getElementById("feedback").style = "display : block"
        document.getElementById("rating").textContent = rating +"/10"
        document.getElementById("textFeedback").textContent = "\"" + feedback +"\"- AI"
    }
    else{
        document.getElementById("drawingSpace").style = "display : block"
        canvasDrawing.loadCanvasState()
    }
});

