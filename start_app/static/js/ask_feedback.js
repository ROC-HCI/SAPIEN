// Code authors: Masum Hasan, Cengiz Ozel, Sammy Potter
// ROC-HCI Lab, University of Rochester
// Copyright (c) 2023 University of Rochester

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
// THE SOFTWARE.


const modeAskFeedbackMap = {
    "learning": "Would you like feedback on your conversation?",
    "interview": "Would you like feedback on your conversation?",
    "dating": "Would you like feedback on your conversation?",
    "language": "Would you like feedback on your conversation?",
    "custom": "Would you like feedback on your conversation?"
}

const mode = localStorage.getItem('mode');
let askFeedbackText = document.querySelector("h1")
askFeedbackText.innerText = modeAskFeedbackMap[mode];

let yesButton = document.getElementById("yes-button");

yesButton.addEventListener('click', async () => {
    console.log("yesButton clicked");
    
    yesButton.style.backgroundColor = "#a1a1a1";
    yesButton.style.pointerEvents = "none";
    yesButton.innerHTML = "Loading...";
    
    window.location.href = "/feedback";
});

let restartButton = document.getElementById("restart-button");

restartButton.addEventListener('click', async () => {
    sessionStorage.setItem('loadFormData', true);
    const mode_page = localStorage.getItem('mode_page');
    window.location.assign(mode_page);
});
