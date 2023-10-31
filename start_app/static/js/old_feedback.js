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


// let form = document.querySelector('.feedback-form');
// form.addEventListener("submit", addSkillToList, false);

let form = document.querySelector('.feedback-form');
form.addEventListener("submit", function(event) {
  event.preventDefault();
  addSkillToList();
}, false);

document.addEventListener('keydown', function (event) {
    if (event.key === ",") {
        event.preventDefault();
        document.getElementById("submit-button").click();
    }
});

const skillList = [];

function addKeypoints() {
    const dataString = sessionStorage.getItem('keypoints');
    const data = JSON.parse(dataString);
    
    console.log("data: ", data);
    
    data.keypoints.forEach(function (keypoint) {
        addSkillToList(undefined, keypoint);
    });
}

window.addEventListener("load", addKeypoints, false);

function addSkillToList(event, skill=undefined) {
    let newSkill;
    if (skillList.length < 5) {
        if (skill != undefined) {
            newSkill = skill;
        } else {
            newSkill = document.getElementById("skills-input").value;
        }
        // if stripped newskill is empty, return
        if (!newSkill.replace(/\s/g, '').length) {
            return;
        }
        // console.log(newSkill);

        skillList.push(newSkill);

        var skillDisplay = document.querySelector(".searchList");

        const newSkillDisplay = document.createElement("div");
        newSkillDisplay.classList.add("skill-to-search");

        const newSkillDisplayP = document.createElement("p");
        newSkillDisplayP.textContent = newSkill;

        const newSkillDisplayButton = document.createElement("button");
        newSkillDisplayButton.onclick = function () { removeSkillFromList(this); };

        newSkillDisplay.appendChild(newSkillDisplayP);
        newSkillDisplay.appendChild(newSkillDisplayButton);

        skillDisplay.appendChild(newSkillDisplay);

        document.getElementById("skills-input").value = "";
    } else {
        // alert("You can only add up to 5 skills.");
    }
}

function removeSkillFromList(element) {
    const skillP = element.parentElement.getElementsByTagName("p")[0].textContent;

    const indexSkill = skillList.indexOf(skillP);

    skillList.splice(indexSkill, 1);

    console.log("Skills: " + skillList);

    var skillDisplay = document.querySelector(".searchList");

    skillDisplay.removeChild(element.parentElement);
}

function getFeedback() {
    // if skillList is empty, alert user, then return
    if (skillList.length == 0) {
        alert("Please enter at least one skill.");
        return;
    }

    console.log("getFeedback");
    
    const feedbackButton = document.getElementsByClassName("feedback-button")[0];
    const feedbackBlock = document.querySelector('.feedback-block');
    const feedbackText = document.querySelector(".feedback-text p");

    feedbackBlock.style.display = 'flex';

    setTimeout(() => {
        feedbackButton.style.backgroundColor = "#a1a1a1";
        feedbackButton.style.pointerEvents = "none";
        feedbackBlock.style.opacity = '0';
    }, 50);

    feedbackButton.innerHTML = "Loading...";

    const data = { 'skillList': skillList };
    const jsonData = JSON.stringify(data);

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/feedback";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (this.status === 200) {
            const response = JSON.parse(this.responseText);
            let full_feedback = response.full_feedback;
            
            full_feedback = full_feedback.replaceAll('\n', '<br/>');
            feedbackText.innerHTML = full_feedback;

            setTimeout(() => {
                feedbackButton.style.backgroundColor = "black";
                feedbackButton.style.pointerEvents = "auto";
                feedbackBlock.style.opacity = '1';
                feedbackButton.innerHTML = "Get Feedback";
            }, 500);
        }
    };
    xhr.send(jsonData);
}

let transcriptButton = document.getElementsByClassName("transcript-button")[0];
let transcriptText = document.getElementsByClassName("transcript-content")[0];
let arrow = document.getElementsByClassName("arrow")[0];
let transcriptLabel = document.getElementsByClassName("transcript-label")[0];

transcriptButton.addEventListener("click", function () {
  this.classList.toggle("active");
  var content = this.nextElementSibling;
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    transcriptLabel.textContent = "Show Transcript";
    arrow.classList.remove("rotate-arrow");
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    transcriptLabel.textContent = "Hide Transcript";
    arrow.classList.add("rotate-arrow");
  }
});



async function fetchTranscriptText() {
    try {
        const response = await fetch('/get_transcript_text');
        if (response.ok) {
            let transcriptText = await response.text();
            transcriptText = '<br/>'.concat(transcriptText).concat('<br/><br/>');
            transcriptText = transcriptText.replaceAll('\n', '<br/>');
            document.getElementsByClassName("transcript-content")[0].innerHTML = transcriptText;
        } else {
            console.error('Error fetching transcript:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching transcript:', error);
    }
}

fetchTranscriptText();

let restartButton = document.getElementById("restart-button");

restartButton.addEventListener('click', async () => {
    // console.log("restartButton clicked");
    sessionStorage.setItem('loadFormData', true);
    // console.log("sessionStorage.getItem('loadFormData') "+sessionStorage.getItem('loadFormData'))
    window.location.href = "/form";
});


