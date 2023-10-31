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
    'origins of the moon',
    'semiconductors',
    '3D animation',
    'criminal psychology',
    'life on other planets',
]

var topic = ""

function sendTopic() {
    let language = localStorage.getItem("language");

    // AJAX call using jQuery
    $.ajax({
        url: '/enter_topic',
        type: 'POST',
        data: {
            topic: topic,
            language: language
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
            sendTopic();
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
            sendTopic();
        }
    });
});

window.onload = function() {
    let dropdown = document.querySelector(".dropdown");
    let dropbtn = dropdown.querySelector(".dropbtn");
    let dropdownContent = dropdown.querySelector(".dropdown-content");
    let defaultLang = "en-US";

    localStorage.setItem("language", defaultLang);

    dropbtn.addEventListener("click", function() {
        dropdownContent.classList.toggle('show');
    });

    let languageOptions = dropdownContent.querySelectorAll("p");
    languageOptions.forEach(function (option) {
        option.addEventListener("click", function() {
            // Update dropbtn's html with clicked option's html
            dropbtn.innerHTML = this.innerHTML;
            dropdownContent.classList.remove('show');

            // here you can do anything with the selected language
            // e.g., if you need to get the selected language code, you can retrieve it from the dataset:
            var selectedLangCode = this.dataset.langCode;
            console.log(selectedLangCode);
            localStorage.setItem("language", selectedLangCode);

        });
    });

    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.querySelectorAll(".dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}