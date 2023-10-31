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


const phrases = [
    "quirky ice cream flavors", 
    "first pet's story", 
    "favorite childhood games", 
    "daring adventures", 
    "unusual food combinations", 
    "Dream holiday destinations", 
    "relatable fictional characters", 
    "fascinating historical periods", 
    "favorite trivia", 
    "thrift store finds"
];

var topic = ""

function sendLanguage() {
    let language = localStorage.getItem("language");
    let proficiency = localStorage.getItem("proficiency");

    // AJAX call using jQuery
    $.ajax({
        url: '/enter_language',
        type: 'POST',
        data: {
            language: language,
            topic: topic,
            proficiency: proficiency
        },
        success: function (data) {
            window.location.assign("gallery");
        },
        error: function (xhr, status, error) {
            alert("Error. Check console for details.");
            console.error(error);
        }
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomPhrase() {
    return phrases[getRandomInt(phrases.length)];
}

function setupTextBox() {
    $("#topicInput").css('min-width', 0);
    $("#topicInput").text(getRandomPhrase());
    $("#topicInput").css('min-width', $("#topicInput").css('width'));
}

$(document).ready(function () {

    setupTextBox();

    $("#topicInput").focusin(function () {
        $("#topicCursor").hide();
        if (!$("#topicInput").hasClass('has-text')) {
            $("#topicInput").text("");
        }
    });

    let nextButton = $("#nextButton");
    $("#topicInput").focusout(function () {
        if ($("#topicInput").text().length === 0) {
            setupTextBox();
            $("#topicInput").removeClass('has-text');
            $("#topicCursor").show();
            nextButton.addClass('disabled');
            nextButton.removeClass('primary');
        } else {
            $("#topicInput").addClass('has-text');
            nextButton.addClass('primary');
            nextButton.removeClass('disabled');
        }
    });

    $("#topicInput").on('input', function () {
        topic = $(this).text();

        if (topic === "") {
            nextButton.addClass('disabled');
            nextButton.removeClass('primary');
        } else {
            nextButton.addClass('primary');
            nextButton.removeClass('disabled');
        }
    });


    $("#nextButton").click(function () {
        if (!$(this).hasClass("disabled")) {
            sendLanguage();
        }
    });

    $("#backButton").click(function () {
        if (!$(this).hasClass("disabled")) {
            window.location.assign("mode_select");
        }
    });

    $("#topicInput").on('keydown', function (event) {
        if (event.keyCode === 13 && topic !== "") {
            event.preventDefault();
            sendLanguage();
        }
    });
});

window.onload = function() {
    setupDropdown("languageDropdown", "language", "en-US");
    setupDropdown("proficiencyDropdown", "proficiency", "A1: Beginner");
}

function setupDropdown(dropdownId, key, defaultValue) {
    let dropdown = document.getElementById(dropdownId);
    let dropbtn = dropdown.querySelector(".dropbtn");
    let dropdownContent = dropdown.querySelector(".dropdown-content");

    localStorage.setItem(key, defaultValue); 

    dropbtn.addEventListener("click", function() {
        dropdownContent.classList.toggle('show');
    });

    let options = dropdownContent.querySelectorAll("p");
    options.forEach(function (option) {
        option.addEventListener("click", function() {
            dropbtn.innerHTML = this.innerHTML;
            dropdownContent.classList.remove('show');
            console.log(this.dataset[key]);

            localStorage.setItem(key, this.dataset[key]);
            if (dropdownId === "languageDropdown") {
                body = document.querySelector("body");
                body.style.backgroundImage = "url(/static/img/countries/" + this.dataset[key] + ".jpg)";
                body.style.backgroundSize = "cover";
            }
        });
    });
}
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.querySelectorAll(".dropdown-content");
        dropdowns.forEach(function(dropdown) {
            dropdown.classList.remove('show');
        });
    }
}
