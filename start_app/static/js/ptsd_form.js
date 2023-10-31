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


const textareas = document.querySelectorAll("textarea");

function updateTextareaHeights() {
    textareas.forEach((textarea) => {
        // Set the height to auto to ensure that it fits the content
        textarea.style.height = "auto";

        // Set the height to match the content height
        textarea.style.height = `${textarea.scrollHeight}px`;
    });
}

// On load get mhName from sessionStorage
window.onload = function () {

    let mhFilenameCurrent = sessionStorage.getItem('mhFilenameCurrent');
    let mhFNameCurrent = sessionStorage.getItem('mhFNameCurrent');
    let mhLNameCurrent = sessionStorage.getItem('mhLNameCurrent');
    let mhPronounCurrent = sessionStorage.getItem('mhPronounCurrent');
    let mhAgeCurrent = sessionStorage.getItem('mhAgeCurrent');
    let mhNarrativeCurrent = sessionStorage.getItem('mhNarrativeCurrent');
    let mhPremiseCurrent = sessionStorage.getItem('mhPremiseCurrent');

    let img = document.getElementById('mh-file');
    img.src = mhFilenameCurrent;
    
    console.log("sessionStorage.getItem('loadFormData') "+sessionStorage.getItem('loadFormData'))

    if (sessionStorage.getItem('loadFormData') === "true") {
        loadFormFromSessionStorage();
        sessionStorage.setItem('loadFormData', false);
    } else {
        document.getElementById('bot_fname').value = mhFNameCurrent;
        document.getElementById('bot_lname').value = mhLNameCurrent;
        document.getElementById('bot_pronoun').value = mhPronounCurrent;
        document.getElementById('bot_age').value = mhAgeCurrent;
    
        document.getElementById('bot_narrative').value = mhNarrativeCurrent;
    
        document.getElementById('premise').value = mhPremiseCurrent;
    }

    updateTextareaHeights()
}

textareas.forEach((textarea) => {
    textarea.addEventListener("input", updateTextareaHeights);
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-block');
    form.addEventListener('submit', (event) => {
        // event.preventDefault();
        saveFormToSessionStorage();
        checkOccupiedAndNavigate();
    });
});

function saveFormToSessionStorage() {
    const form = document.getElementById('form-block');

    for (let i = 0; i < form.elements.length; i++) {
        let element = form.elements[i];

        // only save elements with a 'name' attribute
        if (element.name) {
            sessionStorage.setItem(element.name, element.value);
        }
    }
}

function loadFormFromSessionStorage() {
    const form = document.getElementById('form-block');

    if (form) { // check if form exists
        for (let i = 0; i < form.elements.length; i++) {
            let element = form.elements[i];
            // only load elements with a 'name' attribute
            if (element.name) {
                let storedValue = sessionStorage.getItem(element.name);
                if (storedValue) {
                    element.value = storedValue;
                }
            }
        }
    }
}

function checkOccupiedAndNavigate() {
    showLoading();
    setup_custom();
}

function setup_custom() {
    var botFname = document.getElementById('bot_fname').value;
    var botLname = document.getElementById('bot_lname').value;
    var botPronoun = document.getElementById('bot_pronoun').value;
    var botAge = document.getElementById('bot_age').value;
    var botNarrative = document.getElementById('bot_narrative').value;

    var userFName = document.getElementById('user_fname').value;
    var userLName = document.getElementById('user_lname').value;
    
    var premise = document.getElementById('premise').value;

    const jsonData = JSON.stringify({
        bot_fname: botFname,
        bot_lname: botLname,
        bot_pronoun: botPronoun,
        bot_age: botAge,
        bot_narrative: botNarrative,
        user_fname: userFName,
        user_lname: userLName,
        premise: premise
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/ptsd_form";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Success!');
            window.location.href = '/wait';
        } else {
            console.log('Error with the request!');
        }
    };
    xhr.send(jsonData);
}

function showLoading() {
    $("#loadingContainer").fadeIn(500);
}


$(document).ready(function () {
    $("#nextButton").click(() => {
        checkOccupiedAndNavigate();
    });

    $("#backButton").click(() => {
        window.location.assign('/custom');
    });
});