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


function formatTimeDisplay(seconds, minOrSec) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const boldSpan = (content) => `<span class="bold">${content}</span>`;

    const formatNumber = (number) => {
        return number.toString().padStart(2, '0');
    };

    if (minOrSec === 'min') {
        if (minutes > 9) {
            let mode = localStorage.getItem('mode');
            if ((mode === "interview")) {
              window.location.href = "/ask_feedback";
            } else if (mode === "learning") {
              window.location.href = "/ask_quiz";
            } else if (mode === "language") {
              window.location.href = "/ask_feedback";
            } else if (mode === "dating") {
              window.location.href = "/ask_feedback";
            }
        }
        return boldSpan(formatNumber(minutes) + ":" + formatNumber(remainingSeconds) + "/10:00");
    } else if (minOrSec === 'sec') {
        return boldSpan(formatNumber(remainingSeconds));
    }
}


// Function to update the timer display
function updateTimerDisplay(innerHTML, color = 'white') {
    const timerElement = document.getElementById('timer');
    timerElement.innerHTML = innerHTML;
    timerElement.style.color = color;
}

async function fetchElapsedTime() {
    const response = await fetch('/get_elapsed_time');
    const data = await response.json();
    return data.elapsed_time;
}

let timerStarted = false;
let timerInterval;

function startTimer() {
    // Check if timer is already started
    if (timerStarted) {
        console.log('Timer is already started. Ignoring the start request.');
        return;
    }

    console.log('Starting timer');
    timerStarted = true;

    // Fetch elapsed time from back end
    fetchElapsedTime().then(elapsedTime => {
        let seconds = elapsedTime;

        updateTimerDisplay(formatTimeDisplay(seconds, 'min'))

        timerInterval = setInterval(() => {
            seconds++;

            const minutes = Math.floor(seconds / 60);
            const displayText = formatTimeDisplay(seconds, 'min');
            const textColor = minutes >= 8 ? 'red' : 'white';
            updateTimerDisplay(displayText, textColor);
        }, 1000);
    });
}

function stopTimer() {
    if (timerStarted) {
       clearInterval(timerInterval);
       timerStarted = false;
       console.log('Stopped timer');
    } else {
       console.log('Timer not running, cannot stop');
    }
}

// Start the countdown when the page is loaded, do not uncomment, this function is called in chat.js
// window.addEventListener('load', startTimer);
