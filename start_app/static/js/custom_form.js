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


// Get the preset links
var presets = document.querySelectorAll('.preset');
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
    let mhRelationshipCurrent = sessionStorage.getItem('mhRelationshipCurrent');

    let mhLanguageCurrent = sessionStorage.getItem('mhLanguageCurrent');

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
        document.getElementById('relationship').value = mhRelationshipCurrent;

        if (mhLanguageCurrent) {
            document.getElementById('user_language').value = mhLanguageCurrent;
        } else {
            document.getElementById('user_language').value = 'en-US';
        }
    }

    updateTextareaHeights()
}

textareas.forEach((textarea) => {
    textarea.addEventListener("input", updateTextareaHeights);
});

function createPresetItem(name, botNarrative, premise, relationship, language) {
    const presetItem = document.createElement('div');
    presetItem.classList.add('preset-item');

    const presetLink = document.createElement('a');
    presetLink.href = '#';
    presetLink.classList.add('preset');
    presetLink.textContent = name;
    presetLink.setAttribute('bot_narrative', botNarrative || '');
    presetLink.setAttribute('premise', premise || '');
    presetLink.setAttribute('relationship', relationship || '');
    presetLink.setAttribute('language', language || '');

    presetItem.appendChild(presetLink);

    return presetItem;
}

function generatePresets(presetsDataObj) {
    const presetList = document.querySelector('.preset-list');
    
    for (const presetName in presetsDataObj) {
        const presetData = presetsDataObj[presetName];
        const presetItem = createPresetItem(
            presetName,
            presetData.Narrative,
            presetData.Premise,
            presetData.Relationship,
            presetData.Language
        );
        presetList.appendChild(presetItem);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fetchData = async () => {
        const response = await fetch('static/sapien-data/presets.json');
        const data = await response.json();
        generatePresets(data);

        const presets = document.querySelectorAll('.preset');
        presets.forEach((preset) => {
            preset.addEventListener('click', (event) => {
                event.preventDefault();

                const botNarrative = preset.getAttribute('bot_narrative');
                const premise = preset.getAttribute('premise');
                const relationship = preset.getAttribute('relationship');
                const language = preset.getAttribute('language');

                if (botNarrative) {
                    document.getElementById('bot_narrative').value = botNarrative;
                }
                if (premise) {
                    document.getElementById('premise').value = premise;
                }
                if (relationship) {
                    document.getElementById('relationship').value = relationship;
                }
            });
        });
    };

    fetchData();
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
    var userNarrative = document.getElementById('user_narrative').value;
    var userLanguage = document.getElementById('user_language').value;
    
    var premise = document.getElementById('premise').value;
    var relationship = document.getElementById('relationship').value;
    var goal = document.getElementById('goal').value;

    const jsonData = JSON.stringify({
        bot_fname: botFname,
        bot_lname: botLname,
        bot_pronoun: botPronoun,
        bot_age: botAge,
        bot_narrative: botNarrative,
        user_fname: userFName,
        user_lname: userLName,
        user_narrative: userNarrative,
        user_language: userLanguage,
        premise: premise,
        relationship: relationship,
        goal: goal
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/custom_form";
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